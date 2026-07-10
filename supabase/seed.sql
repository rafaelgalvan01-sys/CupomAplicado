-- Dados fictícios de exemplo, só para o site nascer funcional.
-- Troque por lojas/cupons reais quando as parcerias de afiliados forem aprovadas.

insert into categories (id, name, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Moda', 'moda'),
  ('22222222-2222-2222-2222-222222222222', 'Eletrônicos', 'eletronicos'),
  ('33333333-3333-3333-3333-333333333333', 'Viagem', 'viagem');

insert into stores (id, name, slug, description, category_id, affiliate_base_url, active) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Moda Boa', 'moda-boa', 'Roupas e acessórios com os melhores preços.', '11111111-1111-1111-1111-111111111111', 'https://example.com/moda-boa', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'EletroPrime', 'eletroprime', 'Eletrônicos e gadgets com desconto.', '22222222-2222-2222-2222-222222222222', 'https://example.com/eletroprime', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ViajaFácil', 'viajafacil', 'Passagens e pacotes de viagem em oferta.', '33333333-3333-3333-3333-333333333333', 'https://example.com/viajafacil', true);

insert into coupons (store_id, title, description, code, discount_type, discount_value, affiliate_url, expires_at, active) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '20% OFF em toda a loja', 'Válido para novos clientes.', 'MODA20', 'percentual', 20, 'https://example.com/moda-boa?cupom=MODA20', now() + interval '30 days', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Frete grátis acima de R$150', null, 'FRETEGRATIS', 'frete_gratis', null, 'https://example.com/moda-boa?cupom=FRETEGRATIS', now() + interval '30 days', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'R$50 OFF em fones de ouvido', null, 'FONE50', 'fixo', 50, 'https://example.com/eletroprime?cupom=FONE50', now() + interval '15 days', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '15% OFF em pacotes nacionais', 'Válido para viagens até dezembro.', 'VIAJA15', 'percentual', 15, 'https://example.com/viajafacil?cupom=VIAJA15', now() + interval '60 days', true);
