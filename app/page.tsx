import Link from "next/link";
import { getCategories, getStores } from "@/lib/data";
import { StoreCard } from "@/components/StoreCard";

export default async function Home() {
  const [categories, stores] = await Promise.all([getCategories(), getStores()]);

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-brand-dark">
          Cupons de desconto e promoções
        </h1>
        <p className="text-black/60">
          Economize nas suas compras com cupons verificados das melhores lojas.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-brand-dark">Categorias</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categoria/${category.slug}`}
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-brand-dark">Lojas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </section>
    </div>
  );
}
