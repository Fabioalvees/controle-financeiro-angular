-- Controle de Contas — esquema do banco no Supabase
-- Cole isso no SQL Editor do Supabase e clique em "Run".

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  budget numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  card_limit numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric not null,
  category text not null,
  card text not null,
  installments int not null default 1,
  tx_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists meta (
  user_id uuid primary key references auth.users(id) on delete cascade,
  salario numeric not null default 0
);

-- Row Level Security: cada usuário só vê e mexe nos próprios dados
alter table categories enable row level security;
alter table cards enable row level security;
alter table transactions enable row level security;
alter table meta enable row level security;

create policy "categories: owner only" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cards: owner only" on cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions: owner only" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "meta: owner only" on meta
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
