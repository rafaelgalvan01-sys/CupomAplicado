-- Guias de compra: conteúdo editorial (não preso a uma loja/categoria só)
-- pra capturar buscas de quem ainda não decidiu onde comprar, tipo "como
-- economizar comprando eletrônicos". Conteúdo (intro/sections/faq) é gerado
-- depois via scripts/generate-guide-content.mjs, igual já fazemos com lojas
-- e categorias — esta migração só cria a tabela e semeia os temas.

create table if not exists guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  related_category_slug text,
  intro text,
  sections jsonb not null default '[]'::jsonb,
  faq jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table guides enable row level security;
create policy "Public read guides" on guides for select using (true);

drop trigger if exists set_updated_at on guides;
create trigger set_updated_at before update on guides for each row execute function set_updated_at();

insert into guides (slug, title, related_category_slug) values
  ('como-economizar-eletronicos-e-tecnologia', 'Como economizar comprando eletrônicos e tecnologia', 'eletronicos'),
  ('vale-a-pena-comprar-roupa-em-promocao', 'Vale a pena comprar roupa em promoção? O que observar antes', 'moda'),
  ('hora-certa-de-comprar-eletrodomesticos-com-desconto', 'Como saber a hora certa de comprar eletrodomésticos com desconto', 'eletrodomesticos'),
  ('como-economizar-decorando-ou-reformando-a-casa', 'Dicas pra economizar decorando ou reformando a casa', 'casa-e-decoracao'),
  ('como-aproveitar-promocoes-de-produtos-de-beleza', 'Como aproveitar promoções de produtos de beleza sem desperdiçar', 'beleza'),
  ('equipamento-esportivo-em-oferta-o-que-considerar', 'O que considerar antes de comprar equipamento esportivo em oferta', 'esportes'),
  ('guia-de-economia-para-quem-vai-viajar', 'Guia de economia pra quem vai viajar', 'viagem'),
  ('como-funciona-um-cupom-de-desconto', 'Como funciona um cupom de desconto, de verdade', null),
  ('cupom-cashback-ou-promocao-qual-compensa-mais', 'Cupom, cashback ou promoção direta da loja: qual compensa mais', null),
  ('erros-comuns-que-fazem-cupom-nao-funcionar', 'Erros comuns que fazem um cupom "não funcionar" na hora de comprar', null),
  ('melhor-epoca-do-ano-para-comprar-com-desconto', 'Quando é a melhor época do ano pra comprar com desconto', null),
  ('como-comprar-com-seguranca-em-sites-desconhecidos', 'Como comprar com segurança em sites de loja que você não conhece', null)
on conflict (slug) do nothing;
