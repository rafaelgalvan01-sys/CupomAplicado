-- Permite desfazer um voto (clicar de novo no botão já ativo), em vez de só
-- trocar entre positivo/negativo. Mesmo padrão security definer da
-- cast_coupon_vote, mas removendo a linha em vez de fazer upsert.

create or replace function remove_coupon_vote(p_coupon_id uuid, p_voter_id text)
returns table (helpful_count integer, not_helpful_count integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from coupon_votes where coupon_id = p_coupon_id and voter_id = p_voter_id;

  update coupons c set
    helpful_count = (select count(*) from coupon_votes v where v.coupon_id = p_coupon_id and v.is_helpful = true),
    not_helpful_count = (select count(*) from coupon_votes v where v.coupon_id = p_coupon_id and v.is_helpful = false)
  where c.id = p_coupon_id;

  return query select c.helpful_count, c.not_helpful_count from coupons c where c.id = p_coupon_id;
end;
$$;

grant execute on function remove_coupon_vote(uuid, text) to anon, authenticated;
