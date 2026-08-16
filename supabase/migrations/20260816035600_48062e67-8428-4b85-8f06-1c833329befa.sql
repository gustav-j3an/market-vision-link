
-- Habilitar extensões se não estiverem
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- Recriar função has_role com SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    from public.profiles
    where id = _user_id
      and tipo = _role
  )
$$;

-- 1. Tabela de Indústrias
CREATE TABLE public.industrias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    marca TEXT,
    categoria TEXT,
    status TEXT NOT NULL DEFAULT 'ativo',
    contato TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.industrias TO authenticated;
GRANT ALL ON public.industrias TO service_role;

ALTER TABLE public.industrias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores podem gerenciar indústrias da própria empresa"
ON public.industrias
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'gestor'::public.app_role) AND empresa_id = public.get_my_empresa_id());

CREATE POLICY "Promotores podem ver indústrias da própria empresa"
ON public.industrias
FOR SELECT
TO authenticated
USING (empresa_id = public.get_my_empresa_id());

-- 2. Vínculo Promotores x Indústrias
CREATE TABLE public.promotores_industrias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotor_id UUID NOT NULL REFERENCES public.promotores(id) ON DELETE CASCADE,
    industria_id UUID NOT NULL REFERENCES public.industrias(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ativo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(promotor_id, industria_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotores_industrias TO authenticated;
GRANT ALL ON public.promotores_industrias TO service_role;

ALTER TABLE public.promotores_industrias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores podem gerenciar vínculos de promotores e indústrias"
ON public.promotores_industrias
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'gestor'::public.app_role));

CREATE POLICY "Promotores podem ver seus próprios vínculos"
ON public.promotores_industrias
FOR SELECT
TO authenticated
USING (promotor_id IN (SELECT id FROM public.promotores WHERE perfil_id = auth.uid()));

-- 3. Ajuste na tabela de Produtos
ALTER TABLE public.produtos ADD COLUMN industria_id UUID REFERENCES public.industrias(id) ON DELETE SET NULL;

-- 4. Roteiro Semanal
CREATE TABLE public.roteiros_semanais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    promotor_id UUID NOT NULL REFERENCES public.promotores(id) ON DELETE CASCADE,
    semana_referencia DATE NOT NULL,
    nome TEXT,
    status TEXT NOT NULL DEFAULT 'rascunho',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roteiros_semanais TO authenticated;
GRANT ALL ON public.roteiros_semanais TO service_role;

ALTER TABLE public.roteiros_semanais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores podem gerenciar roteiros semanais da própria empresa"
ON public.roteiros_semanais
FOR ALL
TO authenticated
USING (empresa_id = public.get_my_empresa_id());

CREATE POLICY "Promotores podem ver seus roteiros semanais"
ON public.roteiros_semanais
FOR SELECT
TO authenticated
USING (promotor_id IN (SELECT id FROM public.promotores WHERE perfil_id = auth.uid()));

-- 5. Paradas do Roteiro
CREATE TABLE public.paradas_roteiro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roteiro_semanal_id UUID NOT NULL REFERENCES public.roteiros_semanais(id) ON DELETE CASCADE,
    dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
    data DATE NOT NULL,
    promotor_id UUID NOT NULL REFERENCES public.promotores(id) ON DELETE CASCADE,
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    industria_id UUID NOT NULL REFERENCES public.industrias(id) ON DELETE CASCADE,
    horario_previsto TIME,
    ordem INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pendente',
    observacao TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.paradas_roteiro TO authenticated;
GRANT ALL ON public.paradas_roteiro TO service_role;

ALTER TABLE public.paradas_roteiro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores podem gerenciar paradas de roteiro"
ON public.paradas_roteiro
FOR ALL
TO authenticated
USING (promotor_id IN (SELECT id FROM public.promotores WHERE empresa_id = public.get_my_empresa_id()));

CREATE POLICY "Promotores podem ver suas paradas"
ON public.paradas_roteiro
FOR SELECT
TO authenticated
USING (promotor_id IN (SELECT id FROM public.promotores WHERE perfil_id = auth.uid()));

-- 6. Ajuste na tabela de Visitas
ALTER TABLE public.visitas ADD COLUMN parada_id UUID REFERENCES public.paradas_roteiro(id) ON DELETE SET NULL;
ALTER TABLE public.visitas ADD COLUMN industria_id UUID REFERENCES public.industrias(id) ON DELETE SET NULL;

-- Trigger para updated_at (usando função customizada se moddatetime falhar)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at_industrias BEFORE UPDATE ON public.industrias FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at_roteiros_semanais BEFORE UPDATE ON public.roteiros_semanais FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at_paradas_roteiro BEFORE UPDATE ON public.paradas_roteiro FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
