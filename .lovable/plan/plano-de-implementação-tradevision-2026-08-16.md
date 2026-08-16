# Plano de Implementação - TradeVision

Criação do front-end completo e responsivo para o SaaS de trade marketing **TradeVision**, com perfis de Gestor e Promotor.

## Estrutura de Arquivos

- `src/components/layout/`: Sidebar, MobileNav e PageHeader.
- `src/components/dashboard/`: Cards de indicadores e gráficos (Gestor).
- `src/components/promotor/`: Roteiro, Fluxo de Visita (Promotor).
- `src/components/ui/`: Componentes básicos (Button, Card, Input, etc.).
- `src/routes/`:
  - `index.tsx`: Seleção de perfil (Landing/Login simulado).
  - `gestor/`:
    - `dashboard.tsx`: Visão analítica.
    - `visitas/index.tsx`: Listagem de visitas.
    - `visitas/$id.tsx`: Detalhe da visita.
    - `lojas/`, `produtos/`, `promotores/`, `relatorios/`.
  - `promotor/`:
    - `roteiro.tsx`: Roteiro do dia.
    - `visita/index.tsx`: Registro de visita (multi-etapas).
    - `historico.tsx`: Histórico pessoal.

## Design e Identidade

- **Cores**: Azul Profundo (`#003366`), Verde (Sucesso), Amarelo (Atenção), Vermelho (Ruptura).
- **Estilo**: B2B moderno, clean, sombras leves, cantos arredondados.
- **Responsividade**: Desktop para gestores (leitura rápida), Mobile-first para promotores (operação em campo).

## Dados Mockados (Exemplo: Indústria de Bebidas)

- **Marcas**: "RefrescaCo", "Cervejaria Artesanal Br", "Água Pura".
- **Lojas**: "Pão de Açúcar", "Carrefour", "Assaí", localizados em SP, RJ, BH.
- **Indicadores**: Taxa de Ruptura (12%), Execução (85%), Visitas (45/50).

## Etapas Técnicas

1.  **Configuração de Tema**: Ajustar `src/styles.css` com as cores do TradeVision.
2.  **Layout Base**: Criar componentes de navegação adaptáveis.
3.  **Telas do Gestor**: Implementar dashboard com `recharts` e tabelas de dados.
4.  **Telas do Promotor**: Criar fluxo de visita com gerenciamento de estado local para simular etapas.
5.  **Navegação**: Conectar todas as rotas usando `@tanstack/react-router`.
