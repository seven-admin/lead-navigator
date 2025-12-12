-- Habilitar RLS na tabela status_opcoes
ALTER TABLE public.status_opcoes ENABLE ROW LEVEL SECURITY;

-- Permitir que todos os usuários autenticados vejam os status
CREATE POLICY "Usuários autenticados podem ver status"
ON public.status_opcoes FOR SELECT
TO authenticated
USING (true);