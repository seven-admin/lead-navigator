-- Adicionar coluna origem na tabela leads
ALTER TABLE public.leads ADD COLUMN origem text;

-- Constraint para valores válidos
ALTER TABLE public.leads ADD CONSTRAINT leads_origem_check 
  CHECK (origem IS NULL OR origem IN ('Seven', 'Parceiro'));

-- Permitir usuários autenticados inserirem leads
CREATE POLICY "Usuarios autenticados podem inserir leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (true);