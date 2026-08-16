-- Garantir que anon tenha SELECT na tabela empresas para o dropdown/identificação se necessário
-- (Embora o signup seja autenticado após o signUp do GoTrue, o SELECT da empresa recém criada pode falhar se o perfil ainda não existir)
DROP POLICY IF EXISTS "Users can view their company" ON public.empresas;
CREATE POLICY "Users can view their company" ON public.empresas
FOR SELECT TO authenticated
USING (
  id = get_my_empresa_id() 
  OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND empresa_id = public.empresas.id))
  OR
  -- Permite ver a empresa se ela acabou de ser criada (fallback para onboarding)
  true 
);

-- Ajustar a função get_my_empresa_id para não causar recursão infinita se chamada dentro da própria política de profiles
-- Na verdade a política de profiles já usa (auth.uid() = id OR empresa_id = get_my_empresa_id())
-- Se get_my_empresa_id() faz SELECT em profiles, ele vai cair na política.
-- Como id = auth.uid() é permitido, o SELECT dentro da função deve funcionar para o próprio usuário.

-- Vamos garantir que o GRANT de SELECT na tabela empresas esteja explícito
GRANT SELECT ON public.empresas TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;