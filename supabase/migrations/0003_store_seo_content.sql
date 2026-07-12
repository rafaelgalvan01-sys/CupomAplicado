-- Conteúdo de SEO gerado por IA (texto descritivo + FAQ) por loja.
-- seo_description é o texto longo exibido no corpo da página da loja
-- (description continua sendo o resumo curto usado no header/meta).

alter table stores add column if not exists seo_description text;
alter table stores add column if not exists faq jsonb not null default '[]'::jsonb;
