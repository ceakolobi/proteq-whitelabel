import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * CRM Proxy Edge Function
 * 
 * Esta função atua como proxy para o CRM externo (MARKA).
 * TODA lógica de negócio, cotas, faixas FIPE e valores vem do CRM.
 * O APP apenas consome e exibe os dados retornados.
 * 
 * Endpoints suportados:
 * - POST /perfil - Busca perfil do usuário autenticado
 * - POST /veiculo - Busca dados do veículo por placa
 * - POST /cotacao - Gera cotação baseada no veículo
 * - POST /recalcular - Recalcula cotação com benefícios selecionados
 * 
 * CONFIGURAÇÃO NECESSÁRIA:
 * - CRM_API_URL: URL base da API do CRM
 * - CRM_API_KEY: Chave de autenticação da API do CRM
 */

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Credenciais do CRM - OBRIGATÓRIAS para funcionamento
    // Normaliza valores para evitar erros comuns (ex: colar "CRM_API_URL=https://..." no secret)
    const rawCrmUrl = Deno.env.get('CRM_API_URL');
    const rawCrmKey = Deno.env.get('CRM_API_KEY');

    const CRM_API_URL = rawCrmUrl
      ?.trim()
      .replace(/^CRM_API_URL=/i, '')
      .replace(/\/+$/, '');

    const CRM_API_KEY = rawCrmKey?.trim().replace(/^CRM_API_KEY=/i, '');
    
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação não fornecido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { endpoint, payload } = body;

    console.log(`[CRM Proxy] Endpoint: ${endpoint}, User: ${user.id}`);

    let responseData;

    switch (endpoint) {
      case 'perfil':
        // Perfil usa dados locais do Supabase (não depende do CRM externo)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, regionais:regional_id(id, nome)')
          .eq('id', user.id)
          .single();
        
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        const userRole = roles?.[0]?.role?.toUpperCase() || 'ASSOCIADO';
        
        // Monta resposta no formato do contrato CRM
        responseData = {
          id: user.id,
          nome: profile?.nome || user.email,
          perfil: userRole,
          regional: profile?.regionais ? {
            id: profile.regionais.id,
            nome: profile.regionais.nome
          } : null,
          // Permissões definidas pelo perfil
          // TODO: Em produção com CRM real, estas permissões virão do endpoint /api/v1/auth/me
          permissoes: {
            cotar: userRole === 'CONSULTOR',
            ver_leads: userRole === 'CONSULTOR',
            editar_leads: userRole === 'CONSULTOR',
            ver_comissoes: userRole === 'CONSULTOR' || userRole === 'INDICADOR',
            ajuste_manual: false // Sempre false - valor virá do CRM
          }
        };
        break;

      case 'veiculo':
        // REQUER CRM CONFIGURADO
        if (!CRM_API_URL || !CRM_API_KEY) {
          console.error('[CRM Proxy] CRM não configurado - CRM_API_URL ou CRM_API_KEY ausente');
          return new Response(
            JSON.stringify({ 
              error: 'CRM não configurado',
              message: 'Aguardando configuração das credenciais do CRM. Contate o administrador.',
              code: 'CRM_NOT_CONFIGURED'
            }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`[CRM Proxy] Buscando veículo no CRM: ${payload.placa}`);

        let veiculoResponse: Response;
        try {
          // Chamada real ao CRM
          veiculoResponse = await fetch(`${CRM_API_URL}/api/v1/veiculos/placa/${payload.placa}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${CRM_API_KEY}`,
              'Content-Type': 'application/json',
              'X-User-Id': user.id,
            },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[CRM Proxy] Falha de conexão ao CRM (veiculo): ${msg}`);
          return new Response(
            JSON.stringify({
              error: 'CRM indisponível',
              message: 'Não foi possível conectar ao CRM. Verifique a URL/DNS do servidor.',
              code: 'CRM_UNREACHABLE',
            }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!veiculoResponse.ok) {
          const errorText = await veiculoResponse.text();
          console.error(`[CRM Proxy] Erro CRM veículo: ${veiculoResponse.status} - ${errorText}`);
          return new Response(
            JSON.stringify({
              error: 'Erro ao consultar veículo no CRM',
              message: veiculoResponse.status === 404 ? 'Veículo não encontrado' : 'Falha na comunicação com o CRM',
              code: 'CRM_ERROR',
            }),
            { status: veiculoResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        responseData = await veiculoResponse.json();
        break;

      case 'cotacao':
        // REQUER CRM CONFIGURADO
        if (!CRM_API_URL || !CRM_API_KEY) {
          console.error('[CRM Proxy] CRM não configurado - CRM_API_URL ou CRM_API_KEY ausente');
          return new Response(
            JSON.stringify({ 
              error: 'CRM não configurado',
              message: 'Aguardando configuração das credenciais do CRM. Contate o administrador.',
              code: 'CRM_NOT_CONFIGURED'
            }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`[CRM Proxy] Gerando cotação no CRM para: ${payload.marca} ${payload.modelo}`);

        let cotacaoResponse: Response;
        try {
          // Chamada real ao CRM para gerar cotação
          cotacaoResponse = await fetch(`${CRM_API_URL}/api/v1/cotacoes`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${CRM_API_KEY}`,
              'Content-Type': 'application/json',
              'X-User-Id': user.id,
            },
            body: JSON.stringify({
              placa: payload.placa,
              marca: payload.marca,
              modelo: payload.modelo,
              ano: payload.ano,
            }),
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[CRM Proxy] Falha de conexão ao CRM (cotacao): ${msg}`);
          return new Response(
            JSON.stringify({
              error: 'CRM indisponível',
              message: 'Não foi possível conectar ao CRM. Verifique a URL/DNS do servidor.',
              code: 'CRM_UNREACHABLE',
            }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!cotacaoResponse.ok) {
          const errorText = await cotacaoResponse.text();
          console.error(`[CRM Proxy] Erro CRM cotação: ${cotacaoResponse.status} - ${errorText}`);
          return new Response(
            JSON.stringify({
              error: 'Erro ao gerar cotação no CRM',
              message: 'Falha na comunicação com o CRM',
              code: 'CRM_ERROR',
            }),
            { status: cotacaoResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        responseData = await cotacaoResponse.json();
        break;

      case 'recalcular':
        // REQUER CRM CONFIGURADO
        if (!CRM_API_URL || !CRM_API_KEY) {
          console.error('[CRM Proxy] CRM não configurado - CRM_API_URL ou CRM_API_KEY ausente');
          return new Response(
            JSON.stringify({ 
              error: 'CRM não configurado',
              message: 'Aguardando configuração das credenciais do CRM. Contate o administrador.',
              code: 'CRM_NOT_CONFIGURED'
            }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`[CRM Proxy] Recalculando cotação no CRM com benefícios: ${payload.beneficiosAdicionaisSelecionados?.join(', ')}`);

        let recalculoResponse: Response;
        try {
          // Chamada real ao CRM para recalcular
          recalculoResponse = await fetch(`${CRM_API_URL}/api/v1/cotacoes/recalcular`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${CRM_API_KEY}`,
              'Content-Type': 'application/json',
              'X-User-Id': user.id,
            },
            body: JSON.stringify({
              veiculoPlaca: payload.veiculoPlaca,
              veiculoMarca: payload.veiculoMarca,
              veiculoModelo: payload.veiculoModelo,
              veiculoAno: payload.veiculoAno,
              beneficiosAdicionaisSelecionados: payload.beneficiosAdicionaisSelecionados,
            }),
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[CRM Proxy] Falha de conexão ao CRM (recalcular): ${msg}`);
          return new Response(
            JSON.stringify({
              error: 'CRM indisponível',
              message: 'Não foi possível conectar ao CRM. Verifique a URL/DNS do servidor.',
              code: 'CRM_UNREACHABLE',
            }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!recalculoResponse.ok) {
          const errorText = await recalculoResponse.text();
          console.error(`[CRM Proxy] Erro CRM recálculo: ${recalculoResponse.status} - ${errorText}`);
          return new Response(
            JSON.stringify({
              error: 'Erro ao recalcular cotação no CRM',
              message: 'Falha na comunicação com o CRM',
              code: 'CRM_ERROR',
            }),
            { status: recalculoResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        responseData = await recalculoResponse.json();
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Endpoint não suportado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`[CRM Proxy] Resposta enviada para endpoint: ${endpoint}`);
    
    return new Response(
      JSON.stringify(responseData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[CRM Proxy] Erro:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
