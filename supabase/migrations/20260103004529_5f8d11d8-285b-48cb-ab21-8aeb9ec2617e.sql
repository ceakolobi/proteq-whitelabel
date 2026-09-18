-- Criar tabela de comissões para consultores
CREATE TABLE IF NOT EXISTS public.consultor_comissoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultor_id uuid NOT NULL,
  cotacao_id uuid REFERENCES public.cotacoes(id),
  proposta_id uuid REFERENCES public.propostas(id),
  cliente_nome text NOT NULL,
  tipo text NOT NULL DEFAULT 'inicial' CHECK (tipo IN ('inicial', 'recorrente')),
  valor numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'paga', 'cancelada')),
  mes_referencia date NOT NULL DEFAULT date_trunc('month', now()),
  data_aprovacao timestamp with time zone,
  data_pagamento timestamp with time zone,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_consultor_comissoes_consultor ON public.consultor_comissoes(consultor_id);
CREATE INDEX IF NOT EXISTS idx_consultor_comissoes_status ON public.consultor_comissoes(consultor_id, status);
CREATE INDEX IF NOT EXISTS idx_consultor_comissoes_mes ON public.consultor_comissoes(consultor_id, mes_referencia);

-- Habilitar RLS
ALTER TABLE public.consultor_comissoes ENABLE ROW LEVEL SECURITY;

-- Política: Consultor pode VER apenas suas próprias comissões
CREATE POLICY "Consultores podem ver suas comissões" 
ON public.consultor_comissoes 
FOR SELECT 
USING (auth.uid() = consultor_id);

-- NÃO criar políticas de INSERT/UPDATE/DELETE para consultores
-- Apenas o sistema/admin pode gerenciar comissões

-- Trigger para atualizar updated_at
CREATE TRIGGER update_consultor_comissoes_updated_at
BEFORE UPDATE ON public.consultor_comissoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo para teste
INSERT INTO public.consultor_comissoes (consultor_id, cliente_nome, tipo, valor, status, mes_referencia)
SELECT 
  id,
  'Cliente Exemplo 1',
  'inicial',
  150.00,
  'paga',
  date_trunc('month', now() - interval '1 month')
FROM auth.users LIMIT 1;

INSERT INTO public.consultor_comissoes (consultor_id, cliente_nome, tipo, valor, status, mes_referencia)
SELECT 
  id,
  'Cliente Exemplo 2',
  'recorrente',
  50.00,
  'aprovada',
  date_trunc('month', now())
FROM auth.users LIMIT 1;

INSERT INTO public.consultor_comissoes (consultor_id, cliente_nome, tipo, valor, status, mes_referencia)
SELECT 
  id,
  'Cliente Exemplo 3',
  'inicial',
  200.00,
  'pendente',
  date_trunc('month', now())
FROM auth.users LIMIT 1;