# TradeVision - SaaS de Trade Marketing

TradeVision é uma plataforma Full-Stack projetada para otimizar operações de trade marketing, conectando a inteligência da indústria à execução no ponto de venda (PDV).

Este projeto foi desenvolvido como uma peça central de portfólio, demonstrando habilidades em arquitetura de software moderna, integração com serviços cloud e design focado em UX.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, TanStack Start (SSR/SPA), Vite.
- **Estilização**: Tailwind CSS (v4), Shadcn UI, Lucide React (Ícones).
- **Backend & Infra**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **Gerenciamento de Estado & Rotas**: TanStack Router & Query.
- **Gráficos**: Recharts.
- **Feedback**: Sonner (Toasts).

## 🛠️ Funcionalidades Principais

### Área do Gestor (Desktop)
- **Dashboard Analítico**: Visão geral de visitas, taxa de ruptura, execução média e performance de promotores.
- **Gestão de Cadastro**: Controle completo de Lojas, Produtos (SKUs) e Equipe de Promotores.
- **Roteirização**: Planejamento de visitas diárias por promotor.
- **Alertas Inteligentes**: Notificações automáticas sobre rupturas críticas e visitas fora do padrão de qualidade.

### Área do Promotor (Mobile-First)
- **Roteiro Diário**: Lista otimizada de lojas a serem visitadas no dia.
- **Check-in Geolocalizado**: Registro de início de atividade.
- **Coleta de Dados**: Registro de preços, status de estoque (ruptura) e fotos de evidência.
- **Resumo de Visita**: Finalização com observações e sincronização automática.

## 📦 Como Executar Localmente

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/tradevision.git
   cd tradevision
   ```

2. **Instale as dependências**:
   ```bash
   bun install
   ```

3. **Configure o Supabase**:
   - Crie um projeto no Supabase.
   - Execute o SQL de migração presente na pasta `supabase/migrations` (se disponível).
   - Configure as variáveis de ambiente `.env` com sua `SUPABASE_URL` e `SUPABASE_ANON_KEY`.

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   bun run dev
   ```

## 🧪 Demonstração e Dados Demo

Ao acessar o sistema, você encontrará um botão **"Carregar Dados Demo"** no Dashboard do Gestor. Esta funcionalidade cria automaticamente um cenário realista de uma indústria de bebidas, incluindo:
- Lojas e produtos cadastrados.
- Um roteiro para o dia atual.
- Uma visita já concluída com fotos e rupturas reais para popular os gráficos instantaneamente.

---

*Nota: Este é um projeto de demonstração técnica. Todos os nomes de empresas e produtos citados nos dados demo são fictícios.*
