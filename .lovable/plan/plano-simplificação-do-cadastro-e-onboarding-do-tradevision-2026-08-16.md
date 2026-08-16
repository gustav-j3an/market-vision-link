# Plano: Simplificação do Cadastro e Onboarding do TradeVision

O objetivo é tornar a primeira interação do usuário mais rápida e fluida, movendo a configuração da empresa para uma etapa de onboarding pós-cadastro.

## 1. Alterações no Cadastro (`src/routes/auth/signup.tsx`)
- Remover o campo "Nome da Empresa".
- Ajustar a lógica de submissão:
    - Criar apenas o usuário (`auth.signUp`) e o perfil (`profiles`) com `empresa_id` nulo inicialmente.
    - O tipo de perfil (`gestor` ou `promotor`) será salvo agora.

## 2. Nova Rota de Onboarding (`src/routes/onboarding.tsx`)
- Criar uma rota protegida para usuários logados que ainda não completaram o perfil (sem `empresa_id`).
- **Fluxo Gestor**: Pedir nome da empresa e confirmar o nome do gestor. Ao finalizar, criar a empresa e vincular ao perfil.
- **Fluxo Promotor**: Mostrar interface para o promotor solicitar vínculo ou informar a empresa (mockado inicialmente).

## 3. Ajustes na Proteção de Rotas
- **`src/routes/gestor.tsx` e `src/routes/promotor.tsx`**: Redirecionar para `/onboarding` se o perfil existir mas `empresa_id` for nulo.
- **`src/hooks/use-auth.tsx`**: Garantir que o `AuthContext` forneça dados atualizados após o onboarding.

## 4. Banco de Dados (Supabase)
- Verificar se a coluna `empresa_id` em `profiles` permite nulos (deve permitir para o novo fluxo).
- Garantir que as políticas de RLS permitem que o usuário atualize seu próprio perfil com o `empresa_id` após criar a empresa.

---
Este plano foca na conversão de usuários, simplificando a entrada e organizando a configuração em etapas lógicas.
