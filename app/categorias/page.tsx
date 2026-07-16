import type { Metadata } from "next";
import { getCategories, getStores } from "@/lib/data";
import { CategoryCard } from "@/components/CategoryCard";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const revalidate = 300;

const TITLE = "Categorias de cupons de desconto — Cupom Aplicado";
const DESCRIPTION =
  "Navegue por categorias para encontrar cupons de desconto nas lojas que você mais gosta: moda, eletrônicos, casa, beleza, esportes e muito mais.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/categorias" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/categorias`,
  },
};

export default async function CategoriasPage() {
  const [categories, stores] = await Promise.all([getCategories(), getStores()]);

  const storeCountByCategory = new Map<string, number>();
  for (const store of stores) {
    if (store.category_id) {
      storeCountByCategory.set(
        store.category_id,
        (storeCountByCategory.get(store.category_id) ?? 0) + 1
      );
    }
  }

  const categoriesWithStores = categories
    .map((cat) => ({
      ...cat,
      storeCount: storeCountByCategory.get(cat.id) ?? 0,
    }))
    .filter((cat) => cat.storeCount > 0);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Categorias", item: `${SITE_URL}/categorias` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: categoriesWithStores.map((cat, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cat.name,
      url: `${SITE_URL}/categoria/${cat.slug}`,
    })),
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 flex flex-col gap-8">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={itemListJsonLd} />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Categorias</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Categorias de cupons de desconto
        </h1>
        <p className="text-muted-foreground">
          {categoriesWithStores.length} categorias. Escolha uma para ver as lojas disponíveis e economizar em cada compra.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        {categoriesWithStores.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma categoria disponível no momento.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categoriesWithStores.map((cat) => (
              <CategoryCard key={cat.id} category={cat} storeCount={cat.storeCount} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
