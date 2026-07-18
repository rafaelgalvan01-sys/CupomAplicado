-- Imagem ilustrativa por guia, vinda do banco de fotos gratuito Pexels (sem
-- direitos autorais, uso comercial liberado sem crédito obrigatório — ver
-- scripts/generate-guide-images.mjs). image_query é o termo de busca em
-- inglês usado pra achar a foto; os demais campos ficam nulos até o script
-- rodar.

alter table guides add column if not exists image_url text;
alter table guides add column if not exists image_query text;
alter table guides add column if not exists photographer_name text;
alter table guides add column if not exists photographer_url text;

update guides set image_query = 'electronics shopping technology store' where slug = 'como-economizar-eletronicos-e-tecnologia';
update guides set image_query = 'clothes shopping fashion sale rack' where slug = 'vale-a-pena-comprar-roupa-em-promocao';
update guides set image_query = 'kitchen home appliances' where slug = 'hora-certa-de-comprar-eletrodomesticos-com-desconto';
update guides set image_query = 'home decor renovation interior' where slug = 'como-economizar-decorando-ou-reformando-a-casa';
update guides set image_query = 'beauty cosmetics skincare products' where slug = 'como-aproveitar-promocoes-de-produtos-de-beleza';
update guides set image_query = 'sports equipment fitness gym gear' where slug = 'equipamento-esportivo-em-oferta-o-que-considerar';
update guides set image_query = 'travel suitcase vacation airport' where slug = 'guia-de-economia-para-quem-vai-viajar';
update guides set image_query = 'discount coupon online shopping' where slug = 'como-funciona-um-cupom-de-desconto';
update guides set image_query = 'online payment credit card shopping' where slug = 'cupom-cashback-ou-promocao-qual-compensa-mais';
update guides set image_query = 'online shopping checkout laptop frustrated' where slug = 'erros-comuns-que-fazem-cupom-nao-funcionar';
update guides set image_query = 'sale shopping bags retail store' where slug = 'melhor-epoca-do-ano-para-comprar-com-desconto';
update guides set image_query = 'cyber security laptop online safety' where slug = 'como-comprar-com-seguranca-em-sites-desconhecidos';
