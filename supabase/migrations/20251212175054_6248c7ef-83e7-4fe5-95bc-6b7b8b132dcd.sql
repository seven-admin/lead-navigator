-- Remover o constraint antigo e adicionar o novo com 'I'
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_sexo_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_sexo_check CHECK (sexo IN ('M', 'F', 'I'));