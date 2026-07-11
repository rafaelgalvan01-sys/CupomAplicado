-- Suporte à importação automática de cupons via API da Lomadee.
-- Rode isso no SQL Editor do Supabase antes de rodar scripts/import-lomadee.mjs.

alter table stores add column external_id text unique;
alter table stores add column source text;

alter table coupons add column external_id text unique;
alter table coupons add column source text;

alter table coupons drop constraint coupons_discount_type_check;
alter table coupons add constraint coupons_discount_type_check
  check (discount_type in ('percentual', 'fixo', 'frete_gratis', 'outro'));
