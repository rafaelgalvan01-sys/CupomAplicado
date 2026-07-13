import { NextRequest, NextResponse, after } from "next/server";
import { supabase } from "@/lib/supabase";

type Params = {
  params: Promise<{ couponId: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  const { couponId } = await params;

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("affiliate_url")
    .eq("id", couponId)
    .eq("active", true)
    .maybeSingle();

  if (error || !coupon) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  // Roda depois do redirecionamento já ter sido enviado: contar o clique é
  // best-effort e não pode atrasar (nem, em caso de falha, impedir) o
  // usuário de chegar na oferta.
  after(() => supabase.rpc("increment_coupon_clicks", { coupon_id: couponId }));

  return NextResponse.redirect(coupon.affiliate_url, 302);
}
