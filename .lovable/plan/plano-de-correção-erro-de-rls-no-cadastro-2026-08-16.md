# Plano de Correção: Erro de RLS no Cadastro

O objetivo é corrigir o erro "new row violates row-level security policy" que ocorre durante o cadastro de novos usuários gestores. Atualmente, não existem políticas de `INSERT` nas tabelas `profiles` e `empresas`, o que impede a criação de registros.

## Alterações Propostas

### 1. Tabela `profiles`
- Adicionar política de `INSERT` que permite a qualquer usuário autenticado criar seu próprio perfil (`id = auth.uid()`).
- Adicionar política de `UPDATE` para permitir que o usuário atualize seus próprios dados.
- Ajustar a política de `SELECT` para garantir que o usuário consiga ler o próprio perfil, essencial para o funcionamento do sistema e das funções de segurança.

### 2. Tabela `empresas`
- Adicionar política de `INSERT` que permite a criação de novas empresas por usuários autenticados.
- Ajustar a política de `SELECT` para permitir que o usuário veja a empresa associada ao seu perfil.

### 3. Permissões de Data API
- Garantir que as tabelas `profiles` e `empresas` tenham os `GRANT`s necessários para o papel `authenticated`.

## Detalhes Técnicos (SQL)

```sql
-- GRANTs (Segurança padrão Supabase)
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT INSERT, UPDATE ON public.empresas TO authenticated;

-- Políticas para PROFILES
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Atualizar SELECT de profiles para incluir acesso ao próprio perfil
DROP POLICY IF EXISTS "Users can only access their company's profiles" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id OR empresa_id = get_my_empresa_id());

-- Políticas para EMPRESAS
CREATE POLICY "Users can create companies" ON public.empresas
FOR INSERT TO authenticated
WITH CHECK (true);

-- Atualizar SELECT de empresas
DROP POLICY IF EXISTS "Users can only access their company's data" ON public.empresas;
CREATE POLICY "Users can view their company" ON public.empresas
FOR SELECT TO authenticated
USING (id = get_my_empresa_id());
```

## Verificação
1. Executar as migrations no Supabase.
2. Testar o fluxo de cadastro na interface `/auth/signup`.
3. Validar se a empresa e o perfil são criados e vinculados sem erros de RLS.
