/**
 * Cliente de API seguro para comunicação com o backend
 * 
 * Implementa:
 * - Autenticação JWT automática
 * - Idempotência para endpoints críticos
 * - Tratamento padronizado de erros
 * - Retry com backoff exponencial
 */

import { supabase } from "@/integrations/supabase/client";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  retryAfter?: number;
}

const API_BASE_URL = `https://vzztqnihkwuhqgavtgae.supabase.co/functions/v1/api-gateway`;

// Gerar chave de idempotência única
function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Endpoints que requerem idempotência
const CRITICAL_ENDPOINTS = ['criar_cotacao', 'criar_proposta', 'processar_pagamento'];

// Cache de idempotência local para evitar duplicatas
const idempotencyCache = new Map<string, string>();

export async function apiRequest<T>(
  action: string,
  data?: unknown,
  options?: {
    idempotencyKey?: string;
    maxRetries?: number;
  }
): Promise<ApiResponse<T>> {
  const { idempotencyKey, maxRetries = 3 } = options || {};
  
  // Obter token JWT atual
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  
  if (!token) {
    return {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' },
      timestamp: new Date().toISOString()
    };
  }
  
  // Gerar ou usar chave de idempotência
  let finalIdempotencyKey = idempotencyKey;
  if (CRITICAL_ENDPOINTS.includes(action)) {
    const cacheKey = `${action}-${JSON.stringify(data)}`;
    if (!finalIdempotencyKey) {
      // Verificar se já temos uma chave para esta requisição
      if (idempotencyCache.has(cacheKey)) {
        finalIdempotencyKey = idempotencyCache.get(cacheKey);
      } else {
        finalIdempotencyKey = generateIdempotencyKey();
        idempotencyCache.set(cacheKey, finalIdempotencyKey);
        // Limpar cache após 5 minutos
        setTimeout(() => idempotencyCache.delete(cacheKey), 5 * 60 * 1000);
      }
    }
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  if (finalIdempotencyKey) {
    headers['X-Idempotency-Key'] = finalIdempotencyKey;
  }
  
  let lastError: ApiError | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, data })
      });
      
      const result = await response.json();
      
      // Rate limit - aguardar e tentar novamente
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        lastError = { 
          code: 'TOO_MANY_REQUESTS', 
          message: 'Limite de requisições excedido',
          retryAfter 
        };
        
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
      }
      
      // Erro do servidor - retry com backoff
      if (response.status >= 500 && attempt < maxRetries - 1) {
        const backoff = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || { code: 'ERROR', message: 'Erro desconhecido' },
          timestamp: result.timestamp || new Date().toISOString()
        };
      }
      
      return result as ApiResponse<T>;
      
    } catch (error) {
      console.error(`[API] Request failed (attempt ${attempt + 1}):`, error);
      lastError = { code: 'NETWORK_ERROR', message: 'Erro de conexão' };
      
      if (attempt < maxRetries - 1) {
        const backoff = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }
  }
  
  return {
    success: false,
    error: lastError || { code: 'ERROR', message: 'Falha após múltiplas tentativas' },
    timestamp: new Date().toISOString()
  };
}

// Funções de conveniência tipadas
export const api = {
  buscarVeiculo: (placa: string) => 
    apiRequest<{ placa: string; marca: string; modelo: string; ano: number }>('buscar_veiculo', { placa }),
  
  buscarCotacao: (veiculo: { placa?: string; marca: string; modelo: string; ano: number }) =>
    apiRequest<{
      valorFipe: number;
      faixaFipe: string;
      cotaAplicada: string;
      mensalidade: number;
      beneficiosInclusos: Array<{ id: string; nome: string }>;
      beneficiosAdicionais: Array<{ id: string; nome: string; impactaValor: boolean; valorAdicional?: number; permitidoSelecao: boolean }>;
      validadeDias: number;
    }>('buscar_cotacao', veiculo),
  
  recalcularCotacao: (beneficiosSelecionados: string[]) =>
    apiRequest<{ mensalidade: number; beneficiosSelecionados: string[] }>('recalcular_cotacao', { beneficiosSelecionados }),
  
  criarCotacao: (dados: unknown, idempotencyKey?: string) =>
    apiRequest<{ id: string; token: string }>('criar_cotacao', dados, { idempotencyKey })
};
