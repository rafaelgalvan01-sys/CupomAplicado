-- Título curto só pra tag <title> (o que o Google mostra na busca) — o
-- título completo (H1, visível na página) continua sem mudar. Achado na
-- auditoria: título + " — Cupom Aplicado" passava de 70-96 caracteres em
-- quase todos os guias, quando o ideal é ficar por volta de 50-60.

alter table guides add column if not exists seo_title text;

update guides set seo_title = 'Como economizar comprando eletrônicos' where slug = 'como-economizar-eletronicos-e-tecnologia';
update guides set seo_title = 'Vale a pena comprar roupa em promoção?' where slug = 'vale-a-pena-comprar-roupa-em-promocao';
update guides set seo_title = 'Hora certa de comprar eletrodomésticos' where slug = 'hora-certa-de-comprar-eletrodomesticos-com-desconto';
update guides set seo_title = 'Como economizar decorando a casa' where slug = 'como-economizar-decorando-ou-reformando-a-casa';
update guides set seo_title = 'Como aproveitar promoções de beleza' where slug = 'como-aproveitar-promocoes-de-produtos-de-beleza';
update guides set seo_title = 'O que considerar em equipamento esportivo' where slug = 'equipamento-esportivo-em-oferta-o-que-considerar';
update guides set seo_title = 'Guia de economia pra quem vai viajar' where slug = 'guia-de-economia-para-quem-vai-viajar';
update guides set seo_title = 'Como funciona um cupom de desconto' where slug = 'como-funciona-um-cupom-de-desconto';
update guides set seo_title = 'Cupom x cashback: qual compensa mais?' where slug = 'cupom-cashback-ou-promocao-qual-compensa-mais';
update guides set seo_title = 'Por que um cupom não funciona' where slug = 'erros-comuns-que-fazem-cupom-nao-funcionar';
update guides set seo_title = 'Melhor época pra comprar com desconto' where slug = 'melhor-epoca-do-ano-para-comprar-com-desconto';
update guides set seo_title = 'Como comprar com segurança em sites novos' where slug = 'como-comprar-com-seguranca-em-sites-desconhecidos';
