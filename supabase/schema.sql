create extension if not exists "pgcrypto";

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  description text,
  category_id uuid references categories(id),
  affiliate_base_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  title text not null,
  description text,
  code text,
  discount_type text not null check (discount_type in ('percentual', 'fixo', 'frete_gratis')),
  discount_value numeric,
  affiliate_url text not null,
  expires_at timestamptz,
  active boolean not null default true,
  clicks integer not null default 0,
  created_at timestamptz not null default now()
);

create index coupons_store_id_idx on coupons(store_id);
create index stores_category_id_idx on stores(category_id);

alter table categories enable row level security;
alter table stores enable row level security;
alter table coupons enable row level security;

create policy "Public read categories" on categories for select using (true);
create policy "Public read active stores" on stores for select using (active = true);
create policy "Public read active coupons" on coupons for select using (active = true);

-- Contador de cliques é incrementado via função (não via UPDATE direto do cliente),
-- para não precisar de uma policy de escrita aberta pro anon key.
create or replace function increment_coupon_clicks(coupon_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update coupons set clicks = clicks + 1 where id = coupon_id;
$$;

grant execute on function increment_coupon_clicks(uuid) to anon, authenticated;
