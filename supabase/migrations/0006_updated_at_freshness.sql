-- Frescor real (não decorativo): updated_at em coupons/stores, mantido
-- automaticamente por trigger em qualquer UPDATE (inclusive os upserts dos
-- scripts de importação e do generate-seo-content.mjs) — nenhum script
-- precisa ser alterado pra isso funcionar, o trigger cobre qualquer forma
-- de escrita na tabela.

alter table coupons add column if not exists updated_at timestamptz not null default now();
alter table stores add column if not exists updated_at timestamptz not null default now();

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on coupons;
create trigger set_updated_at
  before update on coupons
  for each row
  execute function set_updated_at();

drop trigger if exists set_updated_at on stores;
create trigger set_updated_at
  before update on stores
  for each row
  execute function set_updated_at();
