-- Adicionar coluna para soft-delete de leads (ocultar do consultor sem remover do CRM)
ALTER TABLE public.cotacoes 
ADD COLUMN IF NOT EXISTS lead_descartado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_descartado_em timestamp with time zone,
ADD COLUMN IF NOT EXISTS lead_descartado_motivo text;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_cotacoes_lead_descartado ON public.cotacoes(consultor_id, lead_descartado);

-- Remover qualquer política de DELETE existente para cotacoes (Consultor não pode deletar)
DROP POLICY IF EXISTS "Consultores podem deletar suas cotações" ON public.cotacoes;

-- Garantir que não existe política de DELETE para cotacoes
-- RLS já está configurado sem DELETE, mas vamos garantir explicitamente