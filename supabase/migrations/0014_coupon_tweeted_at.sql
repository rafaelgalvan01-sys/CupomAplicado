-- Marca quando um cupom foi postado no Twitter/X, pra a automação
-- (scripts/post-twitter.mjs) não repetir o mesmo cupom toda vez que roda.
-- Fica null enquanto o cupom nunca foi postado; recebe now() no momento do post.
--
-- Importante: a importação (import-lomadee/import-awin) faz upsert por
-- external_id passando um conjunto fixo de colunas que NÃO inclui tweeted_at,
-- então o upsert preserva esse valor — reimportar um cupom já postado não o
-- "desmarca". Nenhuma leitura pública do site usa esta coluna; é só de
-- controle interno do script.
alter table coupons add column if not exists tweeted_at timestamptz;

-- Índice parcial pros ainda-não-postados: a query da automação filtra
-- tweeted_at is null com frequência e essa lista tende a ser pequena.
create index if not exists coupons_tweeted_at_null_idx on coupons(created_at) where tweeted_at is null;
