-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('associado', 'consultor', 'indicador');

-- Criar enum para status de indicação
CREATE TYPE public.indicacao_status AS ENUM ('novo', 'em_negociacao', 'proposta_enviada', 'fechado', 'cancelado');

-- Criar enum para status de cotação
CREATE TYPE public.cotacao_status AS ENUM ('aberta', 'em_analise', 'proposta_enviada', 'aprovada', 'recusada');

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  email TEXT,
  telefone TEXT,
  avatar_url TEXT,
  codigo_indicador TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de roles dos usuários (separada por segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Tabela de veículos dos associados
CREATE TABLE public.veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  placa TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER,
  cor TEXT,
  chassi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de indicações
CREATE TABLE public.indicacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_indicado TEXT NOT NULL,
  telefone_indicado TEXT NOT NULL,
  email_indicado TEXT,
  placa_veiculo TEXT,
  modelo_veiculo TEXT,
  observacoes TEXT,
  status indicacao_status NOT NULL DEFAULT 'novo',
  consultor_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de cotações
CREATE TABLE public.cotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_nome TEXT NOT NULL,
  cliente_cpf TEXT,
  cliente_telefone TEXT NOT NULL,
  cliente_email TEXT,
  veiculo_placa TEXT NOT NULL,
  veiculo_modelo TEXT NOT NULL,
  veiculo_ano INTEGER,
  valor_mensal DECIMAL(10,2),
  status cotacao_status NOT NULL DEFAULT 'aberta',
  indicacao_id UUID REFERENCES public.indicacoes(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de propostas
CREATE TABLE public.propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id UUID NOT NULL REFERENCES public.cotacoes(id) ON DELETE CASCADE,
  consultor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valor_adesao DECIMAL(10,2),
  valor_mensal DECIMAL(10,2) NOT NULL,
  observacoes TEXT,
  aceita BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de comissões dos indicadores
CREATE TABLE public.comissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  indicacao_id UUID NOT NULL REFERENCES public.indicacoes(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL,
  pago BOOLEAN DEFAULT false,
  data_pagamento TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;

-- Função para verificar role do usuário
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Consultores podem ver perfis de indicadores
CREATE POLICY "Consultores podem ver perfis" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'consultor'));

-- RLS Policies para user_roles
CREATE POLICY "Usuários podem ver suas próprias roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies para veiculos
CREATE POLICY "Usuários podem ver seus veículos" ON public.veiculos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus veículos" ON public.veiculos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus veículos" ON public.veiculos
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies para indicacoes
CREATE POLICY "Indicadores podem ver suas indicações" ON public.indicacoes
  FOR SELECT USING (auth.uid() = indicador_id);

CREATE POLICY "Indicadores podem criar indicações" ON public.indicacoes
  FOR INSERT WITH CHECK (auth.uid() = indicador_id);

CREATE POLICY "Indicadores podem atualizar suas indicações" ON public.indicacoes
  FOR UPDATE USING (auth.uid() = indicador_id);

CREATE POLICY "Consultores podem ver todas as indicações" ON public.indicacoes
  FOR SELECT USING (public.has_role(auth.uid(), 'consultor'));

CREATE POLICY "Consultores podem atualizar indicações" ON public.indicacoes
  FOR UPDATE USING (public.has_role(auth.uid(), 'consultor'));

-- RLS Policies para cotacoes
CREATE POLICY "Consultores podem ver suas cotações" ON public.cotacoes
  FOR SELECT USING (auth.uid() = consultor_id);

CREATE POLICY "Consultores podem criar cotações" ON public.cotacoes
  FOR INSERT WITH CHECK (auth.uid() = consultor_id);

CREATE POLICY "Consultores podem atualizar suas cotações" ON public.cotacoes
  FOR UPDATE USING (auth.uid() = consultor_id);

-- RLS Policies para propostas
CREATE POLICY "Consultores podem ver suas propostas" ON public.propostas
  FOR SELECT USING (auth.uid() = consultor_id);

CREATE POLICY "Consultores podem criar propostas" ON public.propostas
  FOR INSERT WITH CHECK (auth.uid() = consultor_id);

CREATE POLICY "Consultores podem atualizar suas propostas" ON public.propostas
  FOR UPDATE USING (auth.uid() = consultor_id);

-- RLS Policies para comissoes
CREATE POLICY "Indicadores podem ver suas comissões" ON public.comissoes
  FOR SELECT USING (auth.uid() = indicador_id);

-- Trigger para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, codigo_indicador)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email,
    'HARM-' || SUBSTRING(NEW.id::text, 1, 8)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_veiculos_updated_at BEFORE UPDATE ON public.veiculos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_indicacoes_updated_at BEFORE UPDATE ON public.indicacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cotacoes_updated_at BEFORE UPDATE ON public.cotacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_propostas_updated_at BEFORE UPDATE ON public.propostas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();