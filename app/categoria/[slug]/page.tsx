import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug, getStoresByCategory } from "@/lib/data";
import { StoreCard } from "@/components/StoreCard";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { truncateText } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion";

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
  const description = category.seo_description?.trim()
    ? truncateText(category.seo_description.trim(), 155)
    : `Encontre os melhores cupons de desconto em ${category.name}. Economize em suas lojas favoritas com cupons verificados pela comunidade.`;

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

  const itemListJsonLd = stores.length > 0 && {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: stores.map((store, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: store.name,
      url: `${SITE_URL}/loja/${store.slug}`,
    })),
  };

  const faq = category.faq ?? [];
  const faqJsonLd = faq.length > 0 && {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 flex flex-col gap-8">
      <JsonLd data={breadcrumbJsonLd} />
      {itemListJsonLd && <JsonLd data={itemListJsonLd} />}
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

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

      {category.seo_description && (
        <section className="flex flex-col gap-3 border-t border-border pt-8">
          <h2 className="text-xl font-semibold text-foreground">
            Sobre cupons de {category.name}
          </h2>
          <p className="whitespace-pre-line text-muted-foreground">{category.seo_description}</p>
        </section>
      )}

      {category.how_to_use_content && (
        <section className="flex flex-col gap-3 border-t border-border pt-8">
          <h2 className="text-xl font-semibold text-foreground">
            Como escolher o melhor cupom de {category.name}
          </h2>
          <p className="whitespace-pre-line text-muted-foreground">{category.how_to_use_content}</p>
        </section>
      )}

      {faq.length > 0 && (
        <section className="flex flex-col gap-3 border-t border-border pt-8">
          <h2 className="text-xl font-semibold text-foreground">Perguntas frequentes</h2>
          <Accordion className="rounded-lg border border-border bg-card px-4">
            {faq.map((item, index) => (
              <AccordionItem key={item.question} value={index}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionPanel>
                  <p className="text-muted-foreground">{item.answer}</p>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}
    </div>
  );
}
