-- Tabela para controle de rate limit
CREATE TABLE public.rate_limit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índice para busca rápida
CREATE INDEX idx_rate_limit_user_endpoint ON public.rate_limit_logs(user_id, endpoint, window_start);

-- Tabela para idempotência
CREATE TABLE public.idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  request_hash text NOT NULL,
  response_status integer,
  response_body jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Índice para busca por chave
CREATE INDEX idx_idempotency_key ON public.idempotency_keys(idempotency_key);
CREATE INDEX idx_idempotency_expires ON public.idempotency_keys(expires_at);

-- Habilitar RLS
ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Políticas - apenas service role pode acessar
CREATE POLICY "Service role only - rate_limit_logs"
ON public.rate_limit_logs
FOR ALL
USING (false);

CREATE POLICY "Service role only - idempotency_keys"
ON public.idempotency_keys
FOR ALL
USING (false);

-- Função para verificar rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id uuid,
  _endpoint text,
  _max_requests integer,
  _window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _window_start timestamp with time zone;
  _current_count integer;
BEGIN
  _window_start := now() - (_window_seconds || ' seconds')::interval;
  
  SELECT COALESCE(SUM(request_count), 0) INTO _current_count
  FROM public.rate_limit_logs
  WHERE user_id = _user_id
    AND endpoint = _endpoint
    AND window_start >= _window_start;
  
  IF _current_count >= _max_requests THEN
    RETURN false;
  END IF;
  
  INSERT INTO public.rate_limit_logs (user_id, endpoint, window_start)
  VALUES (_user_id, _endpoint, now());
  
  RETURN true;
END;
$$;

-- Função para verificar role com rate limit
CREATE OR REPLACE FUNCTION public.check_role_with_limit(
  _user_id uuid,
  _role app_role,
  _endpoint text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _has_role boolean;
  _max_requests integer;
  _window_seconds integer;
  _rate_ok boolean;
BEGIN
  -- Verificar role
  SELECT public.has_role(_user_id, _role) INTO _has_role;
  
  IF NOT _has_role THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'forbidden');
  END IF;
  
  -- Definir limites por role
  CASE _role
    WHEN 'admin' THEN
      _max_requests := 1000;
      _window_seconds := 60;
    WHEN 'consultor' THEN
      _max_requests := 100;
      _window_seconds := 60;
    WHEN 'indicador' THEN
      _max_requests := 50;
      _window_seconds := 60;
    ELSE
      _max_requests := 30;
      _window_seconds := 60;
  END CASE;
  
  -- Verificar rate limit
  SELECT public.check_rate_limit(_user_id, _endpoint, _max_requests, _window_seconds) INTO _rate_ok;
  
  IF NOT _rate_ok THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'rate_limited', 'retry_after', _window_seconds);
  END IF;
  
  RETURN jsonb_build_object('allowed', true);
END;
$$;

-- Função para limpar logs antigos (rodar via cron)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limit_logs
  WHERE window_start < now() - interval '1 hour';
  
  DELETE FROM public.idempotency_keys
  WHERE expires_at < now();
END;
$$;