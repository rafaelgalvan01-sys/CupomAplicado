-- Redesign: destaques, votação da comunidade nos cupons.
-- Todos os comandos abaixo usam "if not exists" / "or replace" para que a
-- migração possa ser rodada de novo com segurança caso já tenha sido
-- aplicada parcialmente antes.

alter table coupons add column if not exists is_highlight boolean not null default false;
alter table coupons add column if not exists helpful_count integer not null default 0;
alter table coupons add column if not exists not_helpful_count integer not null default 0;

create table if not exists coupon_votes (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references coupons(id) on delete cascade,
  voter_id text not null,
  is_helpful boolean not null,
  created_at timestamptz not null default now(),
  unique (coupon_id, voter_id)
);

create index if not exists coupon_votes_coupon_id_idx on coupon_votes(coupon_id);

alter table coupon_votes enable row level security;
-- Sem policy de leitura/escrita pública: essa tabela só é tocada pela função
-- security definer abaixo, chamada pela rota /api/vote com a chave anon.

create or replace function cast_coupon_vote(p_coupon_id uuid, p_voter_id text, p_is_helpful boolean)
returns table (helpful_count integer, not_helpful_count integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into coupon_votes (coupon_id, voter_id, is_helpful)
  values (p_coupon_id, p_voter_id, p_is_helpful)
  on conflict (coupon_id, voter_id)
  do update set is_helpful = excluded.is_helpful, created_at = now();

  update coupons c set
    helpful_count = (select count(*) from coupon_votes v where v.coupon_id = p_coupon_id and v.is_helpful = true),
    not_helpful_count = (select count(*) from coupon_votes v where v.coupon_id = p_coupon_id and v.is_helpful = false)
  where c.id = p_coupon_id;

  return query select c.helpful_count, c.not_helpful_count from coupons c where c.id = p_coupon_id;
end;
$$;

grant execute on function cast_coupon_vote(uuid, text, boolean) to anon, authenticated;
