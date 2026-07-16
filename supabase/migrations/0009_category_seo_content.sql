-- Conteúdo de SEO gerado por IA por categoria — mesmo padrão já usado em
-- stores (migração 0003/0005): seo_description (texto sobre a categoria),
-- how_to_use_content (como escolher a melhor loja dessa categoria) e faq.
-- Hoje /categoria/[slug] só tem um H1 genérico + lista de lojas, sem nenhum
-- texto único — o mesmo problema de conteúdo raso que já resolvemos pras
-- lojas.

alter table categories add column if not exists seo_description text;
alter table categories add column if not exists how_to_use_content text;
alter table categories add column if not exists faq jsonb not null default '[]'::jsonb;
