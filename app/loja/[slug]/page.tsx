import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoreBySlug, getCouponsByStore } from "@/lib/data";
import { CouponCard } from "@/components/CouponCard";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return {};
  return {
    title: `Cupons ${store.name} — Cupom Aplicado`,
    description: store.description ?? `Cupons de desconto para ${store.name}.`,
  };
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const coupons = await getCouponsByStore(store.id);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-brand-dark">{store.name}</h1>
        {store.description && <p className="text-black/60">{store.description}</p>}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-brand-dark">
          Cupons ativos ({coupons.length})
        </h2>
        {coupons.length === 0 ? (
          <p className="text-black/60">Nenhum cupom ativo no momento para esta loja.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
