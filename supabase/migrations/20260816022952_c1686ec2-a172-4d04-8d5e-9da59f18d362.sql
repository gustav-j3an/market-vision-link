-- Enum for User Types
create type public.app_role as enum ('gestor', 'promotor');

-- 1. Empresas
create table public.empresas (
    id uuid primary key default gen_random_uuid(),
    nome text not null,
    slug text unique not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

grant select, insert, update, delete on public.empresas to authenticated;
grant all on public.empresas to service_role;

alter table public.empresas enable row level security;

-- 2. Perfis (Profiles) - linked to auth.users
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    empresa_id uuid references public.empresas(id) on delete cascade not null,
    email text not null,
    nome text not null,
    cargo text,
    tipo public.app_role not null,
    foto_url text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

-- Security Definer Function to get user's company_id safely
create or replace function public.get_my_empresa_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select empresa_id from public.profiles where id = auth.uid();
$$;

-- Security Definer Function to check if user is gestor
create or replace function public.is_gestor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles 
    where id = auth.uid() 
    and tipo = 'gestor'
  );
$$;

-- 3. Promotores
create table public.promotores (
    id uuid primary key default gen_random_uuid(),
    perfil_id uuid references public.profiles(id) on delete cascade not null,
    empresa_id uuid references public.empresas(id) on delete cascade not null,
    regiao text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

grant select, insert, update, delete on public.promotores to authenticated;
grant all on public.promotores to service_role;

alter table public.promotores enable row level security;

-- 4. Lojas
create table public.lojas (
    id uuid primary key default gen_random_uuid(),
    empresa_id uuid references public.empresas(id) on delete cascade not null,
    nome text not null,
    rede text,
    endereco text,
    cidade text,
    estado char(2),
    regiao text,
    latitude decimal,
    longitude decimal,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

grant select, insert, update, delete on public.lojas to authenticated;
grant all on public.lojas to service_role;

alter table public.lojas enable row level security;

-- 5. Produtos
create table public.produtos (
    id uuid primary key default gen_random_uuid(),
    empresa_id uuid references public.empresas(id) on delete cascade not null,
    marca text,
    nome text not null,
    categoria text,
    sku text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

grant select, insert, update, delete on public.produtos to authenticated;
grant all on public.produtos to service_role;

alter table public.produtos enable row level security;

-- 6. Roteiros
create table public.roteiros (
    id uuid primary key default gen_random_uuid(),
    promotor_id uuid references public.promotores(id) on delete cascade not null,
    loja_id uuid references public.lojas(id) on delete cascade not null,
    empresa_id uuid references public.empresas(id) on delete cascade not null,
    data_prevista date not null,
    horario_previsto time,
    status text default 'agendado' not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

grant select, insert, update, delete on public.roteiros to authenticated;
grant all on public.roteiros to service_role;

alter table public.roteiros enable row level security;

-- 7. Visitas
create table public.visitas (
    id uuid primary key default gen_random_uuid(),
    roteiro_id uuid references public.roteiros(id) on delete set null,
    promotor_id uuid references public.promotores(id) on delete cascade not null,
    loja_id uuid references public.lojas(id) on delete cascade not null,
    empresa_id uuid references public.empresas(id) on delete cascade not null,
    inicio timestamptz not null default now(),
    fim timestamptz,
    status text not null,
    nota_execucao integer check (nota_execucao >= 0 and nota_execucao <= 100),
    observacoes text,
    latitude decimal,
    longitude decimal,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

grant select, insert, update, delete on public.visitas to authenticated;
grant all on public.visitas to service_role;

alter table public.visitas enable row level security;

-- 8. Itens Visita
create type public.item_visita_status as enum ('em_estoque', 'estoque_baixo', 'ruptura', 'nao_encontrado');

create table public.itens_visita (
    id uuid primary key default gen_random_uuid(),
    visita_id uuid references public.visitas(id) on delete cascade not null,
    produto_id uuid references public.produtos(id) on delete cascade not null,
    status public.item_visita_status not null,
    preco decimal,
    quantidade_estimada integer,
    observacoes text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

grant select, insert, update, delete on public.itens_visita to authenticated;
grant all on public.itens_visita to service_role;

alter table public.itens_visita enable row level security;

-- 9. Fotos Visita
create table public.fotos_visita (
    id uuid primary key default gen_random_uuid(),
    visita_id uuid references public.visitas(id) on delete cascade not null,
    caminho_arquivo text not null,
    legenda text,
    data_envio timestamptz default now() not null
);

grant select, insert, update, delete on public.fotos_visita to authenticated;
grant all on public.fotos_visita to service_role;

alter table public.fotos_visita enable row level security;

-- RLS POLICIES --

-- Profiles: Users only access data from their own company
create policy "Users can only access their company's profiles"
on public.profiles for select to authenticated
using (empresa_id = public.get_my_empresa_id());

-- Empresas: Users only access their own company
create policy "Users can only access their company's data"
on public.empresas for select to authenticated
using (id = public.get_my_empresa_id());

-- Promotores
create policy "Gestores see all promotores, promotores see themselves"
on public.promotores for select to authenticated
using (empresa_id = public.get_my_empresa_id());

-- Lojas & Produtos
create policy "Company members can see company stores"
on public.lojas for select to authenticated
using (empresa_id = public.get_my_empresa_id());

create policy "Company members can see company products"
on public.produtos for select to authenticated
using (empresa_id = public.get_my_empresa_id());

-- Roteiros
create policy "Gestores see all roteiros, promotores see their own"
on public.roteiros for select to authenticated
using (
    empresa_id = public.get_my_empresa_id() 
    and (public.is_gestor() or promotor_id in (select id from public.promotores where perfil_id = auth.uid()))
);

create policy "Promotores can update their own roteiros"
on public.roteiros for update to authenticated
using (promotor_id in (select id from public.promotores where perfil_id = auth.uid()));

-- Visitas
create policy "Gestores see all visits, promotores see their own"
on public.visitas for select to authenticated
using (
    empresa_id = public.get_my_empresa_id() 
    and (public.is_gestor() or promotor_id in (select id from public.promotores where perfil_id = auth.uid()))
);

create policy "Promotores can insert and update their own visits"
on public.visitas for all to authenticated
using (promotor_id in (select id from public.promotores where perfil_id = auth.uid()));

-- Itens & Fotos (following visit access)
create policy "Access items via visit"
on public.itens_visita for all to authenticated
using (visita_id in (select id from public.visitas));

create policy "Access photos via visit"
on public.fotos_visita for all to authenticated
using (visita_id in (select id from public.visitas));

-- STORAGE POLICIES (Bucket created via tool) --
create policy "Authenticated users can upload photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'visita-fotos');

create policy "Users can view photos from their company"
on storage.objects for select to authenticated
using (bucket_id = 'visita-fotos');
