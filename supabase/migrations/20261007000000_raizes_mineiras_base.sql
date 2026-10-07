create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text not null default '',
  price_cents integer not null default 0,
  image_url text,
  stock integer not null default 0,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_city text,
  customer_address text,
  notes text,
  items jsonb not null default '[]'::jsonb,
  total_cents integer not null default 0,
  status text not null default 'novo',
  created_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  headline text,
  whatsapp text,
  pix_key text,
  shipping_note text,
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.store_settings enable row level security;

create policy if not exists "Public read categories" on public.categories for select to anon, authenticated using (true);
create policy if not exists "Public read active products" on public.products for select to anon, authenticated using (active = true);
create policy if not exists "Public read settings" on public.store_settings for select to anon, authenticated using (true);
create policy if not exists "Public create orders" on public.orders for insert to anon, authenticated with check (true);

create policy if not exists "Authenticated manage categories" on public.categories for all to authenticated using (true) with check (true);
create policy if not exists "Authenticated manage products" on public.products for all to authenticated using (true) with check (true);
create policy if not exists "Authenticated manage orders" on public.orders for all to authenticated using (true) with check (true);
create policy if not exists "Authenticated manage settings" on public.store_settings for all to authenticated using (true) with check (true);
