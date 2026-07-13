import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

const VOTER_COOKIE = "voter_id";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const couponId = body?.couponId;
  const isHelpful = body?.isHelpful;

  if (typeof couponId !== "string" || (typeof isHelpful !== "boolean" && isHelpful !== null)) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const cookieStore = await cookies();
  let voterId = cookieStore.get(VOTER_COOKIE)?.value;
  if (!voterId) {
    voterId = crypto.randomUUID();
    cookieStore.set(VOTER_COOKIE, voterId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  // isHelpful === null significa "desfazer o voto" (clicou de novo no botão já ativo).
  const { data, error } =
    isHelpful === null
      ? await supabase.rpc("remove_coupon_vote", { p_coupon_id: couponId, p_voter_id: voterId }).single()
      : await supabase
          .rpc("cast_coupon_vote", {
            p_coupon_id: couponId,
            p_voter_id: voterId,
            p_is_helpful: isHelpful,
          })
          .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
