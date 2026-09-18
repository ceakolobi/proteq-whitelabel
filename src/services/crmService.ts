/**
 * Serviço de comunicação com o CRM
 * 
 * O APP Harmony é apenas uma interface de consumo.
 * Todas as regras de negócio, valores e benefícios são definidos EXCLUSIVAMENTE pelo CRM.
 * 
 * REGRAS CRÍTICAS:
 * - NENHUM cálculo de valores no frontend
 * - NENHUM mock ou fallback de dados
 * - NENHUM cache de regras
 * - Mensalidade é SOMENTE LEITURA
 * - Faixas FIPE, cotas e percentuais vêm do CRM
 */

import { supabase } from "@/integrations/supabase/client";
import type { PerfilCRM } from "@/types/crm";

// ============================================
// TIPOS - Baseados no contrato oficial do CRM
// ============================================

export interface VeiculoCRMResponse {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  chassi?: string;
  cor?: string;
}

export interface BeneficioIncluso {
  id: string;
  nome: string;
  descricao?: string;
}

export interface BeneficioAdicional {
  id: string;
  nome: string;
  descricao: string;
  impactaValor: boolean;
  valorAdicional?: number;
  permitidoSelecao: boolean;
}

export interface CotacaoCRMResponse {
  valorFipe: number;
  faixaFipe: string;
  cotaAplicada: string;
  mensalidade: number; // SOMENTE LEITURA - calculado pelo CRM
  beneficiosInclusos: BeneficioIncluso[];
  beneficiosAdicionais: BeneficioAdicional[];
  validadeDias: number;
}

export interface RecalculoRequest {
  veiculoPlaca?: string;
  veiculoMarca: string;
  veiculoModelo: string;
  veiculoAno: number;
  beneficiosAdicionaisSelecionados: string[];
}

export interface RecalculoResponse {
  mensalidade: number; // SOMENTE LEITURA - recalculado pelo CRM
  beneficiosAdicionais: BeneficioAdicional[];
}

// ============================================
// RESULTADO CONTROLADO (não derruba o React)
// ============================================

export type CRMResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: string;
      message: string;
      endpoint: string;
      statusCode?: number;
    };

// ============================================
// FUNÇÃO AUXILIAR - Chamada à Edge Function
// ============================================

type CRMProxyErrorPayload = { code?: string; message?: string; error?: string };

function parseCRMProxyError(err: unknown): CRMProxyErrorPayload | null {
  if (!err) return null;

  // Supabase SDK pode retornar o erro de várias formas dependendo do status HTTP
  const anyErr = err as Record<string, unknown>;

  // 1) Prioridade: body retornado pela Edge Function (quando disponível via context)
  const context = anyErr["context"] as { body?: unknown } | undefined;
  const body = context?.body;

  if (body) {
    if (typeof body === "string") {
      try {
        return JSON.parse(body) as CRMProxyErrorPayload;
      } catch {
        // ignore
      }
    }
    if (typeof body === "object" && body !== null) {
      return body as CRMProxyErrorPayload;
    }
  }

  // 2) Quando o erro retorna diretamente como objeto com code/message (Supabase SDK 2.x)
  if (anyErr["code"] || anyErr["message"]) {
    return {
      code: typeof anyErr["code"] === "string" ? (anyErr["code"] as string) : undefined,
      message:
        typeof anyErr["message"] === "string"
          ? (anyErr["message"] as string)
          : undefined,
      error: typeof anyErr["error"] === "string" ? (anyErr["error"] as string) : undefined,
    };
  }

  // 3) Fallback: alguns erros vêm embedados em error.message como JSON
  if (typeof anyErr["message"] === "string") {
    const msg = anyErr["message"] as string;
    const jsonStart = msg.indexOf("{");
    if (jsonStart >= 0) {
      const possibleJson = msg.slice(jsonStart);
      try {
        return JSON.parse(possibleJson) as CRMProxyErrorPayload;
      } catch {
        // ignore
      }
    }
  }

  return null;
}

function extractStatusCodeFromInvokeError(err: unknown): number | undefined {
  const anyErr = err as Record<string, unknown>;

  const directStatus = anyErr["status"];
  if (typeof directStatus === "number") return directStatus;

  const context = anyErr["context"] as Record<string, unknown> | undefined;
  const ctxStatus = context?.["status"];
  if (typeof ctxStatus === "number") return ctxStatus;

  const response = context?.["response"] as Record<string, unknown> | undefined;
  const resStatus = response?.["status"];
  if (typeof resStatus === "number") return resStatus;

  return undefined;
}

function isGenericNon2xxErrorMessage(message: string) {
  const m = message.toLowerCase();
  return m.includes("edge function returned") || m.includes("non-2xx");
}

async function chamarCRMProxyResult<T>(
  endpoint: string,
  payload?: unknown
): Promise<CRMResult<T>> {
  try {
    const result = await supabase.functions.invoke("crm-proxy", {
      body: { endpoint, payload },
    });

    const data = result.data as unknown;
    const error = result.error as unknown;

    // Quando a Edge Function retorna status não-2xx, o Supabase coloca resposta no 'error'
    if (error) {
      let parsedError: CRMProxyErrorPayload | null = null;
      try {
        parsedError = parseCRMProxyError(error);
      } catch {
        // ignore
      }

      const rawMsg =
        parsedError?.message ||
        (typeof (error as { message?: unknown })?.message === "string"
          ? (error as { message: string }).message
          : "Erro desconhecido");

      const statusCode = extractStatusCodeFromInvokeError(error);
      const friendlyUnavailableMsg =
        "Sistema em manutenção. Integração com CRM indisponível.";

      // Nota: às vezes o SDK não expõe o body/código e só retorna:
      // "Edge Function returned a non-2xx status code"
      const parsedCode = parsedError?.code;
      const code =
        parsedCode ??
        (statusCode === 404
          ? "CRM_NOT_FOUND"
          : statusCode === 401 || statusCode === 403
            ? "CRM_UNAUTHORIZED"
            : statusCode === 400
              ? "CRM_BAD_REQUEST"
              : "CRM_UNAVAILABLE");

      // Erros clássicos de indisponibilidade/configuração (ou non-2xx genérico)
      if (
        code === "CRM_NOT_CONFIGURED" ||
        code === "CRM_UNREACHABLE" ||
        statusCode === 503 ||
        isGenericNon2xxErrorMessage(rawMsg) ||
        (typeof statusCode === "number" && statusCode >= 500)
      ) {
        return {
          ok: false,
          code,
          message: friendlyUnavailableMsg,
          endpoint,
          statusCode: statusCode ?? 503,
        };
      }

      // 404: veículo não encontrado (quando o CRM expõe)
      if (statusCode === 404) {
        return {
          ok: false,
          code,
          message: parsedError?.message || "Veículo não encontrado",
          endpoint,
          statusCode,
        };
      }

      return {
        ok: false,
        code,
        message: parsedError?.message
          ? parsedError.message
          : `Falha na comunicação com o CRM: ${rawMsg}`,
        endpoint,
        statusCode,
      };
    }

    // Verificar se o CRM retornou erro no body (caso 2xx com erro no payload)
    if ((data as { error?: unknown; code?: string; message?: string })?.error) {
      const d = data as { error?: string; code?: string; message?: string };
      const code = d.code || "CRM_ERROR";
      const friendlyUnavailableMsg =
        "Sistema em manutenção. Integração com CRM indisponível.";

      if (code === "CRM_NOT_CONFIGURED" || code === "CRM_UNREACHABLE") {
        return {
          ok: false,
          code,
          message: friendlyUnavailableMsg,
          endpoint,
          statusCode: 503,
        };
      }

      return {
        ok: false,
        code,
        message: d.message || d.error || "Falha na comunicação com o CRM.",
        endpoint,
        statusCode: 500,
      };
    }

    return { ok: true, data: data as T };
  } catch (invokeError: unknown) {
    console.error("[CRM Service] Exceção ao invocar edge function:", invokeError);
    return {
      ok: false,
      code: "CRM_UNAVAILABLE",
      message: "Sistema em manutenção. Integração com CRM indisponível.",
      endpoint,
      statusCode: 503,
    };
  }
}

// Nota: não existe mais helper que lança exceção (throw) para erros HTTP.
// Todos os endpoints devem retornar CRMResult para manter a UI estável.


// ============================================
// ENDPOINTS DO CRM
// ============================================

/**
 * Busca perfil do usuário autenticado no CRM
 * Retorna permissões granulares definidas EXCLUSIVAMENTE pelo CRM
 */
export async function buscarPerfilUsuario(): Promise<CRMResult<PerfilCRM>> {
  return chamarCRMProxyResult<PerfilCRM>("perfil");
}

/**
 * Busca dados do veículo por placa no CRM
 * O CRM consulta APIs oficiais (FIPE, Detran) - o APP não tem acesso direto
 *
 * IMPORTANTE: esta função NUNCA lança exceção (throw) por non-2xx.
 */
export async function buscarVeiculoPorPlaca(
  placa: string
): Promise<CRMResult<VeiculoCRMResponse>> {
  if (!placa || placa.length < 7) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Placa inválida",
      endpoint: "veiculo",
      statusCode: 400,
    };
  }

  return chamarCRMProxyResult<VeiculoCRMResponse>("veiculo", {
    placa: placa.toUpperCase(),
  });
}

/**
 * Busca cotação completa do CRM baseada nos dados do veículo
 * 
 * IMPORTANTE:
 * - O CRM calcula o valor FIPE real
 * - O CRM aplica a faixa FIPE conforme tabela interna
 * - O CRM define a cota e mensalidade
 * - O APP apenas exibe os valores retornados
 * - NENHUM cálculo é feito no frontend
 */
export async function buscarCotacaoCRM(veiculo: {
  placa?: string;
  marca: string;
  modelo: string;
  ano: number;
}): Promise<CRMResult<CotacaoCRMResponse>> {
  if (!veiculo.marca || !veiculo.modelo || !veiculo.ano) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Dados do veículo incompletos",
      endpoint: "cotacao",
      statusCode: 400,
    };
  }

  return chamarCRMProxyResult<CotacaoCRMResponse>("cotacao", veiculo);
}

/**
 * Envia seleção de benefícios ao CRM para recálculo
 * 
 * IMPORTANTE:
 * - O CRM é a ÚNICA fonte de cálculo de valores
 * - O APP envia os benefícios selecionados
 * - O CRM retorna a nova mensalidade calculada
 * - NENHUM cálculo local - o frontend NÃO soma valores
 */
export async function recalcularCotacaoCRM(
  request: RecalculoRequest
): Promise<CRMResult<RecalculoResponse>> {
  if (!request.veiculoMarca || !request.veiculoModelo || !request.veiculoAno) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Dados do veículo incompletos para recálculo",
      endpoint: "recalcular",
      statusCode: 400,
    };
  }

  return chamarCRMProxyResult<RecalculoResponse>("recalcular", request);
}
