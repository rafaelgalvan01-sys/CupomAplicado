import type { Metadata } from "next";
import { Star } from "lucide-react";
import { getFeaturedCoupons, getCouponsSorted, getTopStores, getActiveCouponsCount } from "@/lib/data";
import { CouponCard } from "@/components/CouponCard";
import { StoreCarousel } from "@/components/StoreCarousel";
import type { CouponWithStore, SortOption } from "@/lib/types";

type Props = {
  searchParams: Promise<{ q?: string; sort?: string }>;
};

// Buscas internas não têm conteúdo próprio pra indexar (é a mesma listagem
// filtrada) — a página "real" pro Google é sempre a home sem parâmetros.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    alternates: { canonical: "/" },
    ...(q && { robots: { index: false, follow: true } }),
  };
}

function toStoreProp(coupon: CouponWithStore) {
  return {
    name: coupon.stores?.name ?? "Loja",
    slug: coupon.stores?.slug ?? "",
    logo_url: coupon.stores?.logo_url ?? null,
  };
}

const VALID_SORTS: SortOption[] = ["novos", "populares", "expirando"];

export default async function Home({ searchParams }: Props) {
  const { q, sort } = await searchParams;
  const sortOption = VALID_SORTS.includes(sort as SortOption) ? (sort as SortOption) : "novos";

  const [featured, coupons, topStores, activeCount] = await Promise.all([
    q ? Promise.resolve([]) : getFeaturedCoupons(),
    getCouponsSorted({ sort: sortOption, query: q }),
    getTopStores(10),
    getActiveCouponsCount(),
  ]);

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="flex items-center gap-2 rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand-text">
          <span className="size-1.5 rounded-full bg-brand" />
          {activeCount} {activeCount === 1 ? "cupom ativo hoje" : "cupons ativos hoje"}
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Economize em cada compra
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Cupons verificados pela comunidade. Vote se funcionou para ajudar outros usuários.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <StoreCarousel stores={topStores} />
      </section>

      {featured.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <Star className="size-3.5 fill-current text-brand-text" />
            Destaques
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {featured.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} store={toStoreProp(coupon)} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {q ? `Resultados para "${q}"` : "Todos os cupons"}
        </h2>
        {coupons.length === 0 ? (
          <p className="text-muted-foreground">Nenhum cupom encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} store={toStoreProp(coupon)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
