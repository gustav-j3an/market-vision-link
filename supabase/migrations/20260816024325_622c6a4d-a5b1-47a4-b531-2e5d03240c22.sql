-- 1. GRANTs para permitir escrita pelo usuário autenticado via API
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT INSERT, UPDATE ON public.empresas TO authenticated;

-- 2. Políticas para a tabela PROFILES

-- Permitir que o usuário insira seu próprio perfil
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Permitir que o usuário atualize seus próprios dados
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Atualizar SELECT de profiles para permitir que o usuário veja seu próprio perfil 
-- (necessário para que get_my_empresa_id() funcione durante o onboarding)
DROP POLICY IF EXISTS "Users can only access their company's profiles" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id OR empresa_id = get_my_empresa_id());

-- 3. Políticas para a tabela EMPRESAS

-- Permitir a criação de novas empresas por qualquer usuário autenticado
CREATE POLICY "Users can create companies" ON public.empresas
FOR INSERT TO authenticated
WITH CHECK (true);

-- Atualizar SELECT de empresas
DROP POLICY IF EXISTS "Users can only access their company's data" ON public.empresas;
CREATE POLICY "Users can view their company" ON public.empresas
FOR SELECT TO authenticated
USING (id = get_my_empresa_id());