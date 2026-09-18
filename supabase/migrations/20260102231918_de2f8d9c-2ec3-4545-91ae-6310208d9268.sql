-- Create regionais table
CREATE TABLE public.regionais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.regionais ENABLE ROW LEVEL SECURITY;

-- Create policy for reading regionais (authenticated users can read)
CREATE POLICY "Usuários autenticados podem ver regionais"
ON public.regionais
FOR SELECT
TO authenticated
USING (true);

-- Add regional_id to profiles table
ALTER TABLE public.profiles
ADD COLUMN regional_id UUID REFERENCES public.regionais(id);

-- Create trigger for updated_at
CREATE TRIGGER update_regionais_updated_at
BEFORE UPDATE ON public.regionais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial regions for testing
INSERT INTO public.regionais (nome, codigo) VALUES 
  ('Regional São Paulo', 'REG-SP'),
  ('Regional Rio de Janeiro', 'REG-RJ'),
  ('Regional Minas Gerais', 'REG-MG');