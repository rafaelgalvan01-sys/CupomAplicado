import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getStoresByCategory } from "@/lib/data";
import { StoreCard } from "@/components/StoreCard";
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

// Não depende de searchParams/cookies — pode ser gerada estaticamente por
// slug e revalidada em segundo plano.
export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const stores = await getStoresByCategory(category.id);
  const description = `Cupons de desconto e promoções de ${stores.length} loja${stores.length === 1 ? "" : "s"} de ${category.name}, verificados pela comunidade do Cupom Aplicado.`;

  return {
    title: `Cupons de ${category.name} — Cupom Aplicado`,
    description,
    alternates: { canonical: `/categoria/${category.slug}` },
    openGraph: {
      title: `Cupons de ${category.name}`,
      description,
      url: `${SITE_URL}/categoria/${category.slug}`,
    },
    ...(stores.length === 0 && { robots: { index: false, follow: true } }),
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const stores = await getStoresByCategory(category.id);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${SITE_URL}/categoria/${category.slug}`,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-8">
      <JsonLd data={breadcrumbJsonLd} />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{category.name}</h1>
        <p className="text-muted-foreground">Lojas com cupons de desconto na categoria {category.name}.</p>
      </section>

      <section className="flex flex-col gap-4">
        {stores.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma loja nesta categoria ainda.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {stores.map((store, index) => (
              <StoreCard key={store.id} store={store} priority={index === 0} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
