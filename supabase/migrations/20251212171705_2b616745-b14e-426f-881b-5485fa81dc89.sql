-- Políticas RLS para admins gerenciarem status_opcoes
CREATE POLICY "Admins podem inserir status"
ON public.status_opcoes FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem atualizar status"
ON public.status_opcoes FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem deletar status"
ON public.status_opcoes FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Política RLS para admins gerenciarem roles de usuários
CREATE POLICY "Admins podem atualizar roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));