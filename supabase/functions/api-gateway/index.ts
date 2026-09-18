import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS restrito - apenas origens permitidas
const allowedOrigins = [
  'https://vzztqnihkwuhqgavtgae.lovableproject.com',
  'http://localhost:5173',
  'http://localhost:3000'
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith('.lovableproject.com')
  )
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin! : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-idempotency-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  }
}

// Resposta padronizada de erro
function errorResponse(
  status: number, 
  code: string, 
  message: string, 
  headers: Record<string, string>,
  retryAfter?: number
): Response {
  const responseHeaders: Record<string, string> = { ...headers, 'Content-Type': 'application/json' }
  if (retryAfter) {
    responseHeaders['Retry-After'] = String(retryAfter)
  }
  
  return new Response(
    JSON.stringify({ 
      error: { code, message },
      timestamp: new Date().toISOString()
    }),
    { status, headers: responseHeaders }
  )
}

// Validação de payload com limite de tamanho
async function validatePayload(req: Request, maxSize: number = 10240): Promise<{ valid: boolean; data?: unknown; error?: string }> {
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > maxSize) {
    return { valid: false, error: 'Payload too large' }
  }
  
  try {
    const text = await req.text()
    if (text.length > maxSize) {
      return { valid: false, error: 'Payload too large' }
    }
    
    const data = JSON.parse(text)
    return { valid: true, data }
  } catch {
    return { valid: false, error: 'Invalid JSON' }
  }
}

// Hash simples para idempotência
function hashRequest(data: unknown): string {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

// Limites de rate por endpoint e role
const rateLimits: Record<string, Record<string, { requests: number; window: number }>> = {
  'cotacao': {
    'admin': { requests: 1000, window: 60 },
    'consultor': { requests: 100, window: 60 },
    'indicador': { requests: 20, window: 60 },
    'default': { requests: 10, window: 60 }
  },
  'veiculo': {
    'admin': { requests: 500, window: 60 },
    'consultor': { requests: 50, window: 60 },
    'indicador': { requests: 10, window: 60 },
    'default': { requests: 5, window: 60 }
  },
  'default': {
    'admin': { requests: 1000, window: 60 },
    'consultor': { requests: 100, window: 60 },
    'indicador': { requests: 50, window: 60 },
    'default': { requests: 30, window: 60 }
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  // Apenas POST permitido
  if (req.method !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', 'Only POST method is allowed', corsHeaders)
  }
  
  // Verificar HTTPS em produção (Supabase já força, mas log para auditoria)
  const proto = req.headers.get('x-forwarded-proto')
  if (proto && proto !== 'https') {
    console.warn('[SECURITY] Non-HTTPS request detected')
  }
  
  // Extrair e validar JWT
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(401, 'UNAUTHORIZED', 'Missing or invalid authorization header', corsHeaders)
  }
  
  const token = authHeader.replace('Bearer ', '')
  
  // Inicializar Supabase com service role para operações internas
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
  
  // Verificar token e obter usuário
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  
  if (authError || !user) {
    console.warn('[AUTH] Invalid token:', authError?.message)
    return errorResponse(401, 'UNAUTHORIZED', 'Invalid or expired token', corsHeaders)
  }
  
  // Validar payload
  const payloadResult = await validatePayload(req)
  if (!payloadResult.valid) {
    return errorResponse(400, 'BAD_REQUEST', payloadResult.error!, corsHeaders)
  }
  
  const payload = payloadResult.data as { action: string; data?: unknown }
  
  if (!payload.action) {
    return errorResponse(400, 'BAD_REQUEST', 'Missing action field', corsHeaders)
  }
  
  // Obter role do usuário
  const { data: roleData } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  
  const userRole = roleData?.role || 'default'
  
  // Verificar rate limit
  const endpointLimits = rateLimits[payload.action] || rateLimits['default']
  const limits = endpointLimits[userRole] || endpointLimits['default']
  
  const { data: rateLimitCheck } = await supabaseAdmin.rpc('check_rate_limit', {
    _user_id: user.id,
    _endpoint: payload.action,
    _max_requests: limits.requests,
    _window_seconds: limits.window
  })
  
  if (rateLimitCheck === false) {
    console.warn(`[RATE_LIMIT] User ${user.id} exceeded limit for ${payload.action}`)
    return errorResponse(429, 'TOO_MANY_REQUESTS', 'Rate limit exceeded. Please try again later.', corsHeaders, limits.window)
  }
  
  // Verificar idempotência para endpoints críticos
  const criticalEndpoints = ['criar_cotacao', 'criar_proposta', 'processar_pagamento']
  const idempotencyKey = req.headers.get('x-idempotency-key')
  
  if (criticalEndpoints.includes(payload.action)) {
    if (!idempotencyKey) {
      return errorResponse(400, 'BAD_REQUEST', 'X-Idempotency-Key header required for this endpoint', corsHeaders)
    }
    
    // Verificar se já existe resposta para esta chave
    const { data: existingKey } = await supabaseAdmin
      .from('idempotency_keys')
      .select('response_status, response_body')
      .eq('idempotency_key', idempotencyKey)
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (existingKey) {
      console.log(`[IDEMPOTENCY] Returning cached response for key ${idempotencyKey}`)
      return new Response(
        JSON.stringify(existingKey.response_body),
        { 
          status: existingKey.response_status || 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Idempotent-Replay': 'true' }
        }
      )
    }
  }
  
  // RBAC - Verificar permissões por endpoint
  const endpointPermissions: Record<string, string[]> = {
    'buscar_veiculo': ['admin', 'consultor'],
    'buscar_cotacao': ['admin', 'consultor'],
    'recalcular_cotacao': ['admin', 'consultor'],
    'criar_cotacao': ['admin', 'consultor'],
    'ajustar_valor': ['admin'], // Apenas admin pode ajustar valores
    'criar_indicacao': ['admin', 'consultor', 'indicador'],
    'listar_indicacoes': ['admin', 'consultor', 'indicador'],
    'aprovar_comissao': ['admin'],
    'listar_comissoes': ['admin', 'consultor', 'indicador']
  }
  
  const allowedRoles = endpointPermissions[payload.action]
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn(`[RBAC] User ${user.id} with role ${userRole} denied access to ${payload.action}`)
    return errorResponse(403, 'FORBIDDEN', 'You do not have permission to access this resource', corsHeaders)
  }
  
  // Processar ação (aqui seria a integração real com o CRM)
  let responseData: unknown
  let responseStatus = 200
  
  try {
    // Log de auditoria
    console.log(`[API] User ${user.id} (${userRole}) executing ${payload.action}`)
    
    switch (payload.action) {
      case 'buscar_veiculo':
        // Simular busca de veículo no CRM
        responseData = {
          placa: (payload.data as { placa: string })?.placa?.toUpperCase(),
          marca: 'VOLKSWAGEN',
          modelo: 'GOL 1.0 MPI',
          ano: 2022
        }
        break
        
      case 'buscar_cotacao':
        responseData = {
          valorFipe: 45000,
          faixaFipe: 'A',
          cotaAplicada: 'Proteção Total',
          mensalidade: 189.9,
          beneficiosInclusos: [
            { id: 'roubo', nome: 'Proteção contra roubo e furto' },
            { id: 'colisao', nome: 'Proteção contra colisão' },
            { id: 'assistencia', nome: 'Assistência 24h' }
          ],
          beneficiosAdicionais: [
            { id: 'rastreador', nome: 'Rastreador Veicular', impactaValor: true, valorAdicional: 29.9, permitidoSelecao: true }
          ],
          validadeDias: 7
        }
        break
        
      case 'recalcular_cotacao':
        const beneficios = (payload.data as { beneficiosSelecionados: string[] })?.beneficiosSelecionados || []
        let mensalidade = 189.9
        if (beneficios.includes('rastreador')) mensalidade += 29.9
        if (beneficios.includes('blindagem')) mensalidade += 49.9
        responseData = { mensalidade, beneficiosSelecionados: beneficios }
        break
        
      case 'ajustar_valor':
        // Apenas admin - já verificado pelo RBAC
        responseData = { 
          success: true, 
          novoValor: (payload.data as { valor: number })?.valor,
          ajustadoPor: user.id,
          timestamp: new Date().toISOString()
        }
        break
        
      default:
        return errorResponse(400, 'BAD_REQUEST', `Unknown action: ${payload.action}`, corsHeaders)
    }
    
    // Salvar resposta para idempotência
    if (criticalEndpoints.includes(payload.action) && idempotencyKey) {
      await supabaseAdmin.from('idempotency_keys').insert({
        idempotency_key: idempotencyKey,
        user_id: user.id,
        endpoint: payload.action,
        request_hash: hashRequest(payload.data),
        response_status: responseStatus,
        response_body: responseData
      })
    }
    
  } catch (error) {
    console.error(`[API] Error processing ${payload.action}:`, error)
    return errorResponse(500, 'INTERNAL_ERROR', 'An error occurred processing your request', corsHeaders)
  }
  
  return new Response(
    JSON.stringify({ 
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    }),
    { 
      status: responseStatus,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
})
