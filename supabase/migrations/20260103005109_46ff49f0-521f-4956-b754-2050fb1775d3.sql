-- Adicionar token de compartilhamento seguro para cotações
ALTER TABLE public.cotacoes 
ADD COLUMN IF NOT EXISTS token_compartilhamento text UNIQUE,
ADD COLUMN IF NOT EXISTS validade_cotacao timestamp with time zone DEFAULT (now() + interval '7 days'),
ADD COLUMN IF NOT EXISTS compartilhada boolean DEFAULT false;

-- Criar função para gerar token único
CREATE OR REPLACE FUNCTION public.gerar_token_cotacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Gerar token único baseado em UUID curto
  NEW.token_compartilhamento := encode(gen_random_bytes(12), 'base64');
  -- Remover caracteres especiais do base64
  NEW.token_compartilhamento := replace(replace(replace(NEW.token_compartilhamento, '/', '_'), '+', '-'), '=', '');
  RETURN NEW;
END;
$$;

-- Criar trigger para gerar token automaticamente
DROP TRIGGER IF EXISTS trigger_gerar_token_cotacao ON public.cotacoes;
CREATE TRIGGER trigger_gerar_token_cotacao
BEFORE INSERT ON public.cotacoes
FOR EACH ROW
WHEN (NEW.token_compartilhamento IS NULL)
EXECUTE FUNCTION public.gerar_token_cotacao();

-- Gerar tokens para cotações existentes que não têm
UPDATE public.cotacoes 
SET token_compartilhamento = replace(replace(replace(encode(gen_random_bytes(12), 'base64'), '/', '_'), '+', '-'), '=', '')
WHERE token_compartilhamento IS NULL;

-- Criar índice para busca rápida por token
CREATE INDEX IF NOT EXISTS idx_cotacoes_token ON public.cotacoes(token_compartilhamento);

-- Política pública para visualização de cotação via token (sem autenticação)
CREATE POLICY "Cotações podem ser vistas via token público" 
ON public.cotacoes 
FOR SELECT 
TO anon
USING (token_compartilhamento IS NOT NULL AND validade_cotacao > now());