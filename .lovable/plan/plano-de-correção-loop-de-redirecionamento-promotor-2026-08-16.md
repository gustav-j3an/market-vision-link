# Plano de Correção: Loop de Redirecionamento (Promotor)

O problema de loop infinito ocorre porque as rotas de layout (`/gestor` e `/promotor`) e a rota raiz (`/`) possuem lógicas de redirecionamento conflitantes ou incompletas, especialmente quando o perfil ainda está carregando ou quando há uma incompatibilidade entre o tipo de usuário e a rota acessada.

## Alterações Propostas

### 1. `src/hooks/use-auth.tsx`
- Melhorar o tratamento de erro no `fetchProfile`.
- Garantir que o estado `isLoading` reflita corretamente o término da busca, mesmo em caso de erro (ex: perfil não encontrado).
- Adicionar um estado explicitamente para "perfil não encontrado" ou "erro de carregamento".

### 2. Layouts de Rota (`src/routes/gestor.tsx` e `src/routes/promotor.tsx`)
- Refinar a lógica de proteção para evitar redirecionamentos enquanto `isLoading` for verdadeiro.
- Adicionar tratamento para quando o perfil não for encontrado (exibir mensagem e opção de logout).

### 3. Rota Raiz (`src/routes/index.tsx`)
- Garantir que o redirecionamento automático só ocorra após o carregamento completo do perfil.

### 4. Componente de Erro de Perfil
- Criar um componente simples para exibir quando o usuário está logado mas não possui um perfil vinculado na tabela `profiles`.

## Detalhes Técnicos
- **Causa do Loop**: O redirecionamento cruzado entre `/gestor` e `/promotor` sem considerar o estado de carregamento completo (`isLoading` + `profile`).
- **Segurança**: Manter as verificações de RLS no Supabase, garantindo que o `auth.uid()` seja usado corretamente.

---
Este plano foca na estabilidade da navegação e na experiência do usuário durante o carregamento.
