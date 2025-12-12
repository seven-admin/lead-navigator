-- Tabela para histórico de interações com leads
CREATE TABLE public.lead_interacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ligacao', 'mensagem', 'reuniao', 'nota', 'email')),
  descricao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_interacoes ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todas as interações
CREATE POLICY "Admins podem ver todas interacoes"
ON public.lead_interacoes FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins podem inserir interações
CREATE POLICY "Admins podem inserir interacoes"
ON public.lead_interacoes FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins podem deletar interações
CREATE POLICY "Admins podem deletar interacoes"
ON public.lead_interacoes FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Usuários podem ver interações dos leads atribuídos a eles
CREATE POLICY "Usuarios podem ver interacoes de seus leads"
ON public.lead_interacoes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_interacoes.lead_id 
    AND leads.assigned_to = auth.uid()
  )
);

-- Usuários podem inserir interações nos leads atribuídos a eles
CREATE POLICY "Usuarios podem inserir interacoes em seus leads"
ON public.lead_interacoes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_interacoes.lead_id 
    AND leads.assigned_to = auth.uid()
  )
);

-- Índice para melhorar performance de consultas
CREATE INDEX idx_lead_interacoes_lead_id ON public.lead_interacoes(lead_id);
CREATE INDEX idx_lead_interacoes_created_at ON public.lead_interacoes(created_at DESC);