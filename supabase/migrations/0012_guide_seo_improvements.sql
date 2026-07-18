-- Três melhorias de SEO nos guias (achadas em auditoria jul/2026):
-- 1. image_alt: descrição real da imagem (estava vazia) — ajuda a foto a
--    aparecer na busca de imagens do Google.
-- 2. related_link_href/label: link pra dentro do site nos guias que não têm
--    categoria relacionada (antes ficavam sem nenhum link no corpo do texto).
--    Os dois guias que se sobrepõem com /como-usar-cupom-de-desconto linkam
--    pra lá especificamente, em vez de link genérico.

alter table guides add column if not exists image_alt text;
alter table guides add column if not exists related_link_href text;
alter table guides add column if not exists related_link_label text;

update guides set image_alt = 'Pessoa organizando compras de eletrônicos e tecnologia' where slug = 'como-economizar-eletronicos-e-tecnologia';
update guides set image_alt = 'Araras de roupas em uma loja durante liquidação' where slug = 'vale-a-pena-comprar-roupa-em-promocao';
update guides set image_alt = 'Cozinha equipada com eletrodomésticos modernos' where slug = 'hora-certa-de-comprar-eletrodomesticos-com-desconto';
update guides set image_alt = 'Sala decorada com poucos móveis e boa iluminação' where slug = 'como-economizar-decorando-ou-reformando-a-casa';
update guides set image_alt = 'Produtos de beleza e cosméticos organizados sobre uma mesa' where slug = 'como-aproveitar-promocoes-de-produtos-de-beleza';
update guides set image_alt = 'Equipamentos esportivos e acessórios de academia' where slug = 'equipamento-esportivo-em-oferta-o-que-considerar';
update guides set image_alt = 'Mala de viagem pronta ao lado de acessórios de bordo' where slug = 'guia-de-economia-para-quem-vai-viajar';
update guides set image_alt = 'Pessoa digitando um código de cupom durante uma compra online' where slug = 'como-funciona-um-cupom-de-desconto';
update guides set image_alt = 'Pagamento online com cartão de crédito em um notebook' where slug = 'cupom-cashback-ou-promocao-qual-compensa-mais';
update guides set image_alt = 'Pessoa frustrada olhando para a tela do computador durante uma compra' where slug = 'erros-comuns-que-fazem-cupom-nao-funcionar';
update guides set image_alt = 'Sacolas de compras coloridas durante liquidação' where slug = 'melhor-epoca-do-ano-para-comprar-com-desconto';
update guides set image_alt = 'Notebook com ícone de cadeado simbolizando segurança online' where slug = 'como-comprar-com-seguranca-em-sites-desconhecidos';

update guides set related_link_href = '/como-usar-cupom-de-desconto', related_link_label = 'Veja o passo a passo completo de como aplicar'
  where slug = 'como-funciona-um-cupom-de-desconto';
update guides set related_link_href = '/como-usar-cupom-de-desconto', related_link_label = 'Veja o passo a passo pra aplicar certo'
  where slug = 'erros-comuns-que-fazem-cupom-nao-funcionar';
update guides set related_link_href = '/lojas', related_link_label = 'Ver todas as lojas parceiras'
  where slug in ('cupom-cashback-ou-promocao-qual-compensa-mais', 'melhor-epoca-do-ano-para-comprar-com-desconto', 'como-comprar-com-seguranca-em-sites-desconhecidos');
