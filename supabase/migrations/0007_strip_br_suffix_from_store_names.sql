-- Remove o sufixo " BR" do nome de exibição das lojas (ex: "Kabum BR" ->
-- "Kabum") — vem assim da Lomadee/Awin, mas não faz sentido pro negócio já
-- que o site é só para o Brasil. Idempotente: rodar de novo não faz nada,
-- já que depois da primeira vez nenhum nome termina mais em " BR".
-- Não mexe em `slug` de propósito — as URLs já indexadas continuam as
-- mesmas, só o nome exibido muda.

update stores
set name = regexp_replace(name, '\s+BR$', '', 'i')
where name ~* '\s+BR$';
