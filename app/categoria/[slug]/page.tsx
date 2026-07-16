import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug, getStoresByCategory } from "@/lib/data";
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

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const stores = await getStoresByCategory(slug);

  const title = `Cupons de desconto em ${category.name} — Cupom Aplicado`;
  const description = `Encontre os melhores cupons de desconto em ${category.name}. Economize em suas lojas favoritas com cupons verificados pela comunidade.`;

  return {
    title,
    description,
    alternates: { canonical: `/categoria/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/categoria/${slug}` },
    // Categoria sem loja nenhuma é conteúdo vazio — mesmo tratamento já usado
    // em /loja/[slug] pra loja sem cupom ativo (ver AGENTS.md).
    ...(stores.length === 0 && { robots: { index: false, follow: true } }),
  };
}

export default async function CategoriaPage({ params }: Props) {
  const { slug } = await params;
  const [category, stores] = await Promise.all([
    getCategoryBySlug(slug),
    getStoresByCategory(slug),
  ]);

  if (!category) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Categorias", item: `${SITE_URL}/categorias` },
      { "@type": "ListItem", position: 3, name: category.name, item: `${SITE_URL}/categoria/${slug}` },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 flex flex-col gap-8">
      <JsonLd data={breadcrumbJsonLd} />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/categorias">Categorias</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Cupons de desconto em {category.name}
        </h1>
        <p className="text-muted-foreground">
          {stores.length} {stores.length === 1 ? "loja disponível" : "lojas disponíveis"} em{" "}
          {category.name}. Escolha uma loja para ver os cupons de desconto.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        {stores.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma loja disponível nesta categoria no momento.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {stores.map((store, index) => (
              <StoreCard key={store.id} store={store} priority={index < 4} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
