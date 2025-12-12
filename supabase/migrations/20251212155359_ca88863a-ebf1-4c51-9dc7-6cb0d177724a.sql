-- 1. Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Tabela de status
CREATE TABLE public.status_opcoes (
  id SERIAL PRIMARY KEY,
  descricao TEXT NOT NULL UNIQUE
);

-- Inserir status iniciais
INSERT INTO public.status_opcoes (descricao) VALUES
  ('SEM CONTATO'),
  ('RETORNAR'),
  ('TEM INTERESSE'),
  ('AGENDADO'),
  ('CONTATO ERRADO'),
  ('SEM INTERESSE');

-- 3. Tabela de perfis
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Tabela de roles (separada para segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Função has_role com SECURITY DEFINER (evita recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Tabela de leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  sexo TEXT CHECK (sexo IN ('M', 'F')),
  ano_nascimento INTEGER,
  classe TEXT CHECK (classe IN ('A', 'B', 'C', 'D', 'E')),
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cep TEXT,
  cidade TEXT,
  uf TEXT CHECK (char_length(uf) = 2),
  status_id INTEGER REFERENCES public.status_opcoes(id) DEFAULT 1,
  telefone_1 TEXT,
  telefone_2 TEXT,
  telefone_3 TEXT,
  telefone_4 TEXT,
  telefone_5 TEXT,
  observacoes TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS para profiles
CREATE POLICY "Usuários podem ver todos os perfis"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem atualizar próprio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 8. Políticas RLS para user_roles
CREATE POLICY "Usuários podem ver próprio role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Políticas RLS para leads
CREATE POLICY "Admins podem ver todos os leads"
ON public.leads FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários podem ver leads atribuídos"
ON public.leads FOR SELECT
TO authenticated
USING (assigned_to = auth.uid());

CREATE POLICY "Admins podem inserir leads"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar todos os leads"
ON public.leads FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários podem atualizar leads atribuídos"
ON public.leads FOR UPDATE
TO authenticated
USING (assigned_to = auth.uid());

CREATE POLICY "Admins podem deletar leads"
ON public.leads FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. Trigger para criar profile e role automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'nome', NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();