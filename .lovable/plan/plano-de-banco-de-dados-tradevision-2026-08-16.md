# Plano de Banco de Dados TradeVision

Este plano descreve a estrutura do banco de dados para o SaaS TradeVision no Supabase, garantindo segurança via Row Level Security (RLS) e isolamento de dados por empresa.

## Estrutura de Tabelas e Relacionamentos

### 1. Empresas (`empresas`)
Tabela central para isolamento (multi-tenancy).
- `id`: uuid (PK)
- `nome`: text
- `slug`: text (único)
- `created_at`, `updated_at`

### 2. Perfis (`profiles`)
Extensão do `auth.users` do Supabase.
- `id`: uuid (PK, references auth.users)
- `empresa_id`: uuid (FK empresas)
- `email`: text
- `nome`: text
- `cargo`: text
- `tipo`: app_role (enum: 'gestor', 'promotor')
- `foto_url`: text

### 3. Promotores (`promotores`)
Dados específicos da atuação do promotor.
- `id`: uuid (PK)
- `perfil_id`: uuid (FK profiles)
- `empresa_id`: uuid (FK empresas)
- `regiao`: text

### 4. Lojas (`lojas`)
Pontos de venda atendidos.
- `id`: uuid (PK)
- `empresa_id`: uuid (FK empresas)
- `nome`: text
- `rede`: text
- `endereco`: text
- `cidade`: text
- `estado`: char(2)
- `regiao`: text
- `latitude`: decimal
- `longitude`: decimal

### 5. Produtos (`produtos`)
Catálogo da indústria.
- `id`: uuid (PK)
- `empresa_id`: uuid (FK empresas)
- `marca`: text
- `nome`: text
- `categoria`: text
- `sku`: text

### 6. Roteiros (`roteiros`)
Planejamento de visitas.
- `id`: uuid (PK)
- `promotor_id`: uuid (FK promotores)
- `loja_id`: uuid (FK lojas)
- `empresa_id`: uuid (FK empresas)
- `data_prevista`: date
- `horario_previsto`: time
- `status`: text (agendado, realizado, cancelado)

### 7. Visitas (`visitas`)
Execução real no PDV.
- `id`: uuid (PK)
- `roteiro_id`: uuid (FK roteiros, opcional)
- `promotor_id`: uuid (FK promotores)
- `loja_id`: uuid (FK lojas)
- `empresa_id`: uuid (FK empresas)
- `inicio`: timestamp
- `fim`: timestamp
- `status`: text
- `nota_execucao`: integer
- `observacoes`: text
- `localizacao_gps`: geography(point)

### 8. Itens de Visita (`itens_visita`)
Checklist de produtos na visita.
- `id`: uuid (PK)
- `visita_id`: uuid (FK visitas)
- `produto_id`: uuid (FK produtos)
- `status_estoque`: enum (em_estoque, estoque_baixo, ruptura, nao_encontrado)
- `preco`: decimal
- `quantidade_estimada`: integer
- `observacoes`: text

### 9. Fotos de Visita (`fotos_visita`)
Registro fotográfico da execução.
- `id`: uuid (PK)
- `visita_id`: uuid (FK visitas)
- `caminho_arquivo`: text
- `legenda`: text
- `data_envio`: timestamp

## Segurança e Row Level Security (RLS)

- **Empresas**: Usuários autenticados só veem a própria empresa através do `perfil_id`.
- **Isolamento**: Todas as tabelas terão `empresa_id`. Políticas garantirão que `auth.uid()` -> `profiles.empresa_id` coincida com o registro acessado.
- **Perfis**:
  - `Gestor`: Acesso total a registros com o mesmo `empresa_id`.
  - `Promotor`: Acesso total a seus próprios `roteiros` e `visitas`; leitura de `lojas` e `produtos` da sua empresa.

## Armazenamento (Storage)

- Bucket `visita-fotos`:
  - Privado.
  - Pasta organizada por `empresa_id/visita_id/`.
  - RLS: Somente usuários da mesma empresa podem ler/escrever.

## Detalhes Técnicos
- Uso de `SECURITY DEFINER` para funções de verificação de permissão.
- Índices em `empresa_id` e chaves estrangeiras.
- Triggers para `updated_at`.
