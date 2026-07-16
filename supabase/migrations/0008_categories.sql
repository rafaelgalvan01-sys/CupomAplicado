-- Categorias de lojas + atribuição inicial das lojas existentes.
-- A importação automática vai usar inferCategory() pra definir a categoria
-- de novas lojas; esta migration só cobre o estado atual do banco.

-- Expande as categorias existentes e adiciona as novas
insert into categories (name, slug) values
  ('Eletrônicos e Tecnologia', 'eletronicos'),
  ('Eletrodomésticos', 'eletrodomesticos'),
  ('Casa e Decoração', 'casa-e-decoracao'),
  ('Beleza e Cosméticos', 'beleza'),
  ('Esportes e Fitness', 'esportes'),
  ('Brinquedos e Hobbies', 'brinquedos'),
  ('Bebidas', 'bebidas'),
  ('Automotivo', 'automotivo'),
  ('Viagem', 'viagem')
on conflict (slug) do update set name = excluded.name;

-- Atribui categorias às lojas existentes
update stores set category_id = (select id from categories where slug = 'moda')
where name in ('C&A', 'Camisaria Colombo', 'Iodice', 'Malwee', 'Maria Valentina', 'Morena Rosa', 'Skeptic', 'Zinco');

update stores set category_id = (select id from categories where slug = 'eletronicos')
where name in ('Kabum');

update stores set category_id = (select id from categories where slug = 'eletrodomesticos')
where name in ('Arno', 'Electrolux');

update stores set category_id = (select id from categories where slug = 'casa-e-decoracao')
where name in ('BALAROTI', 'Brinox', 'Coza', 'Gazin', 'Homedock', 'Móveis Carraro', 'Spicy');

update stores set category_id = (select id from categories where slug = 'beleza')
where name in ('Lojas REDE');

update stores set category_id = (select id from categories where slug = 'esportes')
where name in ('Casa do Fitness');

update stores set category_id = (select id from categories where slug = 'brinquedos')
where name in ('Lego');

update stores set category_id = (select id from categories where slug = 'bebidas')
where name in ('Vinícola Jolimont');

update stores set category_id = (select id from categories where slug = 'automotivo')
where name in ('Pneu Store');
