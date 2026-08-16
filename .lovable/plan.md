# Plano de Evolução: TradeVision Multi-Indústria

Este plano detalha a transição do TradeVision de um modelo simples de produtos para uma operação real de trade marketing focada em **Indústrias**.

## 1. Alterações no Banco de Dados (Resumo para Aprovação)

### Novas Tabelas
- `industrias`: Cadastro de indústrias clientes (Ex: Nestlé, Coca-Cola).
- `promotores_industrias`: Vínculo N:N entre promotores e as indústrias que eles atendem.
- `roteiros_semanais`: Agrupador de visitas planejadas para uma semana.
- `paradas_roteiro`: Cada parada específica de um promotor (Loja X + Indústria Y).

### Alterações em Tabelas Existentes
- `produtos`: Ganha `industria_id` para organização.
- `visitas`: Ganha `industria_id` e `parada_id` para precisão analítica.

## 2. Interface do Gestor
- **Novo Menu "Indústrias"**: Gestão completa de clientes e seus produtos vinculados.
- **Novo Planejador Semanal**: Interface para montar a agenda da semana, permitindo que um promotor visite a mesma loja para diferentes indústrias no mesmo dia.

## 3. Interface do Promotor
- **Roteiro do Dia**: Lista de paradas ordenadas por horário/ordem.
- **Visita Contextual**: Ao iniciar, o promotor vê apenas os produtos da indústria daquela parada específica.

## 4. Dashboard e Seed
- Filtros globais por Indústria.
- Seed atualizado com cenário de múltiplas indústrias e paradas diárias coordenadas.

## 5. Próximos Passos (Técnico)
- Aplicar migration SQL no Supabase.
- Atualizar hooks de busca de dados.
- Criar a nova tela de Indústrias.
- Refatorar o planejador de roteiros.
- Ajustar o fluxo de visita do promotor.

---

**Posso prosseguir com a criação das tabelas e migração dos dados?**
