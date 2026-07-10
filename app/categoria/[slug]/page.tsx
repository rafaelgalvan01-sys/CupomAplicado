import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getStoresByCategory } from "@/lib/data";
import { StoreCard } from "@/components/StoreCard";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `Cupons de ${category.name} — Cupom Aplicado`,
    description: `Cupons de desconto e promoções de lojas de ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const stores = await getStoresByCategory(category.id);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-brand-dark">{category.name}</h1>
        <p className="text-black/60">Lojas com cupons de desconto na categoria {category.name}.</p>
      </section>

      <section className="flex flex-col gap-4">
        {stores.length === 0 ? (
          <p className="text-black/60">Nenhuma loja nesta categoria ainda.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
