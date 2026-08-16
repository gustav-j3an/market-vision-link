# Plano de Acabamento de Portfólio - TradeVision

Preparar o TradeVision para apresentação como projeto principal de portfólio, focando em UX, dados coerentes e uma landing page profissional.

## 1. Landing Page e Navegação
- Transformar `src/routes/index.tsx` em uma Landing Page completa.
- Explicar o problema, a solução, as tecnologias (React, TanStack Start, Supabase) e o fluxo do usuário.
- Adicionar botões claros para "Acessar Demonstração" (redirecionando para login ou onboarding).

## 2. Dados de Demonstração (Seed)
- Atualizar `src/utils/seed-demo-data.ts`.
- Criar um cenário completo de indústria de bebidas:
  - 1 Gestor e 1 Promotor.
  - Lojas variadas (Pão de Açúcar, Carrefour, etc).
  - Produtos (Bebidas, Sucos, Cervejas).
  - Roteiro para o dia atual.
  - **Novo**: Inserir uma visita já concluída para a data de hoje para que o Dashboard já apareça populado com dados reais assim que o usuário clicar no botão.
  - Simular rupturas e notas de execução variadas.

## 3. Refinamentos de UX e Feedback
- **Dashboard**: Adicionar estados vazios ilustrativos caso não haja dados.
- **Promotor**: 
  - Adicionar feedback visual de upload nas fotos.
  - Melhorar a navegação mobile-first.
- **Estados Vazios**: Garantir que listagens de Lojas, Produtos e Promotores tenham mensagens amigáveis de "Nenhum item encontrado".
- **Erros**: Adicionar tratamento de erros global ou local para falhas de conexão com o Supabase usando `toast`.

## 4. Documentação e Qualidade
- Criar `README.md` detalhado (Português).
- Revisar responsividade em todas as telas.
- Garantir que o build `npm run build` passe sem avisos críticos.

## Detalhes Técnicos
- Utilizar `createServerFn` para operações pesadas de seed se necessário, mas manter no utilitário atual para simplicidade se funcionar bem.
- Mockar URLs de fotos no seed usando imagens de placeholder (ex: Unsplash) que representem gôndolas de supermercado.
