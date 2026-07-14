import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";
import type { Coupon } from "@/lib/types";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CouponFooter } from "@/components/CouponFooter";
import { CopyCouponButton } from "@/components/CopyCouponButton";
import { TruncatedText } from "@/components/TruncatedText";
import { avatarBgColorFor } from "@/lib/badge-colors";
import { cn } from "@/lib/utils";

type CouponCardStore = {
  name: string;
  slug: string;
  logo_url: string | null;
};

function formatDiscount(coupon: Coupon) {
  if (coupon.discount_type === "percentual") return `${coupon.discount_value}% OFF`;
  if (coupon.discount_type === "fixo" && coupon.discount_value !== null) {
    return `R$${coupon.discount_value.toFixed(2).replace(".", ",")} OFF`;
  }
  if (coupon.discount_type === "frete_gratis") return "Frete Grátis";
  return "Oferta";
}

// Alguns cupons da Lomadee não têm um nome de campanha "humano" — o título
// vem igual ao próprio código. Nesses casos, mostramos uma frase genérica
// em vez de repetir o código como se fosse um título.
function displayTitle(coupon: Coupon) {
  const isTitleJustTheCode = coupon.code && coupon.title.trim().toLowerCase() === coupon.code.trim().toLowerCase();
  if (!isTitleJustTheCode) return coupon.title;
  if (coupon.discount_type === "outro") return "Confira esta oferta especial nesta loja.";
  return `Aproveite ${formatDiscount(coupon)} nesta loja.`;
}

function isDuplicateDescription(title: string, originalTitle: string, description: string | null): boolean {
  if (!description) return false;
  const normalize = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]/gu, "");
  const normDesc = normalize(description);
  return normDesc === normalize(title) || normDesc === normalize(originalTitle);
}


export function CouponCard({
  coupon,
  store,
  priority = false,
}: {
  coupon: Coupon;
  store: CouponCardStore;
  priority?: boolean;
}) {
  const avatarBg = avatarBgColorFor(store.name);

  return (
    <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/loja/${store.slug}`}
            className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-brand-text"
          >
            {store.logo_url ? (
              <span className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-white">
                <Image
                  src={store.logo_url}
                  alt={store.name}
                  fill
                  sizes="32px"
                  priority={priority}
                  className="object-contain p-1"
                />
              </span>
            ) : (
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white",
                  avatarBg
                )}
              >
                {store.name.charAt(0)}
              </span>
            )}
            {store.name}
          </Link>
          <Badge variant="brand" className="h-auto shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold">
            {formatDiscount(coupon)}
          </Badge>
        </div>

        {coupon.is_highlight && (
          <Badge variant="outline" className="w-fit gap-1 border-brand/40 text-brand-text">
            <Flame className="size-3" />
            Destaque
          </Badge>
        )}

        <TruncatedText text={displayTitle(coupon)} className="mt-1 text-sm text-description-foreground" />
        {coupon.description && !isDuplicateDescription(displayTitle(coupon), coupon.title, coupon.description) && (
          <TruncatedText text={coupon.description} className="text-sm text-description-foreground" />
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {coupon.code ? (
          <CopyCouponButton couponId={coupon.id} code={coupon.code} />
        ) : (
          <CardFooter className="border-t-0 bg-transparent p-0">
            <CopyCouponButton couponId={coupon.id} code={coupon.code} />
          </CardFooter>
        )}

        <CouponFooter
          couponId={coupon.id}
          initialHelpful={coupon.helpful_count}
          initialNotHelpful={coupon.not_helpful_count}
          expiresAt={coupon.expires_at}
          clicks={coupon.clicks}
        />
      </CardContent>
    </Card>
  );
}
