# TradeVision Insights

# Prompt para colar no Lovable

Crie o front-end completo, responsivo e navegável de um SaaS de trade marketing chamado **TradeVision**.

O sistema conecta o trabalho de campo dos promotores à análise da indústria. Promotores visitam supermercados, verificam produtos, registram estoque ou ruptura, preço, execução no ponto de venda, observações e fotos. Gestores da indústria analisam esses dados em dashboards.

Nesta fase, crie somente o front-end com dados fictícios realistas. Não integrar banco de dados, autenticação real ou APIs ainda. Todas as telas devem funcionar com dados mockados e navegação entre páginas.

## Identidade visual

- Aparência profissional de SaaS B2B moderno.

- Design claro, limpo e sofisticado.

- Cor principal: azul profundo.

- Cores de apoio: verde para bom desempenho, amarelo para atenção e vermelho para rupturas.

- Fundo claro, cards brancos, sombras leves, bordas arredondadas e boa hierarquia visual.

- Usar ícones modernos e gráficos elegantes.

- Interface em português do Brasil.

- Responsivo para desktop, tablet e celular.

## Perfis de usuário

Criar uma experiência com dois perfis visuais:

1. **Gestor da Indústria:** acessa dashboards, relatórios, lojas, promotores e produtos.

2. **Promotor:** acessa roteiro de visitas, registra visitas, produtos, estoque, rupturas e fotos.

## Estrutura principal

Criar uma barra lateral no desktop com: Visão geral, Dashboard analítico, Visitas, Roteiro, Lojas, Produtos, Promotores, Relatórios e Configurações. No celular, usar navegação inferior ou menu compacto.

## Telas do Gestor

### Dashboard principal

Criar um dashboard executivo com cards de visitas realizadas, lojas visitadas, taxa de ruptura, execução média e promotores ativos. Incluir gráfico de linha com evolução das visitas, gráfico de barras com ruptura por categoria, gráfico de pizza com status de execução, ranking de promotores, ranking de lojas com maior ruptura, alertas críticos e filtros por período, marca, região, estado, cidade e promotor.

### Visitas e detalhe da visita

Criar tabela de visitas com data, promotor, loja, cidade, status, produtos verificados, taxa de ruptura, nota de execução e botão de detalhe. Ao abrir, mostrar dados da loja e do promotor, horários, produtos, status de estoque, preço, execução, observações, galeria de fotos e linha do tempo.

### Lojas, produtos e promotores

Criar páginas de listagem e detalhes. As lojas devem exibir rede, localização, último atendimento, execução, ruptura e histórico. Os produtos devem exibir marca, categoria, SKU, ruptura, preço médio e tendência. Os promotores devem mostrar foto, região, visitas, execução, rupturas encontradas e desempenho.

### Relatórios

Criar cards para relatórios de rupturas, execução, visitas, promotores e lojas, com botões visuais de exportação em Excel e PDF, sem implementar a exportação ainda.

## Experiência do Promotor

### Roteiro de visitas

Criar tela mobile-first com saudação, progresso do dia, lista de lojas do roteiro, horário, endereço, status e botão **Iniciar visita**. Incluir mapa ou rota apenas ilustrativa.

### Registro de visita

Criar um fluxo em etapas: check-in, seleção dos produtos, estoque, preço, execução no ponto de venda, observações, fotos e resumo final. Para cada produto, permitir escolher: em estoque, estoque baixo, ruptura ou produto não encontrado. Incluir barra de progresso e confirmação ao concluir.

### Histórico do promotor

Criar histórico de visitas, pendências, indicadores pessoais, fotos recentes e evolução de desempenho.

## Dados fictícios e qualidade

- Usar dados realistas de uma indústria brasileira de bebidas.

- Criar marcas, produtos, supermercados, promotores, cidades e regiões brasileiras.

- Mostrar casos de ruptura e estoque baixo.

- Usar fotos ilustrativas de prateleiras e pontos de venda.

- Criar componentes reutilizáveis, estados vazios, carregamento visual e erros simulados.

- Adicionar tooltips nos indicadores.

- Priorizar experiência mobile para o promotor e leitura rápida para o gestor.

- Não criar back-end nesta etapa.

- Entregar todas as páginas conectadas por navegação e prontas para receber Supabase depois.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7996844c-9cef-4e7d-b0ae-3040fb2e13e8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
