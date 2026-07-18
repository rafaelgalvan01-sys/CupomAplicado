import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getStoreBySlug, getCouponsByStore, getStores, getRelatedStores, getGuideByCategorySlug } from "@/lib/data";
import { CouponCard } from "@/components/CouponCard";
import { StoreCard } from "@/components/StoreCard";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { truncateText, formatRelativeTime } from "@/lib/utils";
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

// Loja não depende de searchParams/cookies, então essa página pode ser
// gerada estaticamente por slug e revalidada em segundo plano — em vez de
// recalcular tudo a cada requisição.
export const revalidate = 300;

export async function generateStaticParams() {
  const stores = await getStores();
  return stores.map((store) => ({ slug: store.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return {};

  const coupons = await getCouponsByStore(store.id);
  const description = store.seo_description?.trim()
    ? truncateText(store.seo_description.trim(), 155)
    : (store.description ??
      `${coupons.length} cupom${coupons.length === 1 ? "" : "s"} de desconto ativo${coupons.length === 1 ? "" : "s"} para ${store.name}, verificados pela comunidade do Cupom Aplicado.`);

  return {
    title: `Cupons ${store.name} — Cupom Aplicado`,
    description,
    alternates: { canonical: `/loja/${store.slug}` },
    openGraph: {
      title: `Cupons ${store.name}`,
      description,
      url: `${SITE_URL}/loja/${store.slug}`,
      // Sem "images" aqui de propósito: deixa o Next.js usar o
      // opengraph-image.tsx deste segmento de rota (imagem de marca
      // 1200x630) em vez da logo crua da loja.
    },
    ...(coupons.length === 0 && { robots: { index: false, follow: true } }),
  };
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const [coupons, relatedStores, relatedGuide] = await Promise.all([
    getCouponsByStore(store.id),
    store.category_id ? getRelatedStores(store.category_id, store.id) : Promise.resolve([]),
    store.categories?.slug ? getGuideByCategorySlug(store.categories.slug) : Promise.resolve(null),
  ]);

  // Frescor real (não decorativo): a data mais recente entre os cupons
  // ativos, não uma data fixa — reflete quando essa listagem realmente
  // mudou pela última vez (import/geração de conteúdo).
  const mostRecentUpdate = coupons.reduce<string | null>(
    (latest, c) => (!latest || c.updated_at > latest ? c.updated_at : latest),
    null
  );

  const category = store.categories ?? null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: category.name,
              item: `${SITE_URL}/categoria/${category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: category ? 3 : 2,
        name: store.name,
        item: `${SITE_URL}/loja/${store.slug}`,
      },
    ],
  };

  const offersJsonLd = coupons.length > 0 && {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: coupons.map((coupon, index) => ({
      "@type": "Offer",
      position: index + 1,
      name: coupon.title,
      description: coupon.description ?? coupon.title,
      url: `${SITE_URL}/ir/${coupon.id}`,
      ...(coupon.expires_at && { validThrough: coupon.expires_at }),
      seller: { "@type": "Organization", name: store.name },
    })),
  };

  // ?? [] cobre o período entre um deploy e a migração 0003 ser aplicada no
  // Supabase (a coluna ainda não existe, então store.faq vem undefined).
  const faq = store.faq ?? [];
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
      {offersJsonLd && <JsonLd data={offersJsonLd} />}
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
          {category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/categoria/${category.slug}`}>{category.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{store.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="flex items-center gap-4 py-2">
        {store.logo_url && (
          <Image
            src={store.logo_url}
            alt={store.name}
            width={64}
            height={64}
            priority
            className="h-16 w-16 rounded-lg object-contain ring-1 ring-border"
          />
        )}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{store.name}</h1>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="text-xl font-semibold text-foreground">
            Cupons ativos ({coupons.length})
          </h2>
          {mostRecentUpdate && (
            <span className="text-xs text-muted-foreground">
              Atualizado {formatRelativeTime(mostRecentUpdate)}
            </span>
          )}
        </div>
        {coupons.length === 0 ? (
          <p className="text-muted-foreground">Nenhum cupom ativo no momento para esta loja.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                store={{ name: store.name, slug: store.slug, logo_url: store.logo_url }}
              />
            ))}
          </div>
        )}
      </section>

      {relatedGuide && (
        <Link
          href={`/guias/${relatedGuide.slug}`}
          className="flex items-center justify-between gap-3 rounded-xl border border-brand/22 bg-brand/10 px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand/15"
        >
          Leia o guia: {relatedGuide.title}
          <span aria-hidden>→</span>
        </Link>
      )}

      {store.seo_description && (
        <section className="flex flex-col gap-3 border-t border-border pt-8">
          <h2 className="text-xl font-semibold text-foreground">Sobre os cupons {store.name}</h2>
          <p className="whitespace-pre-line text-muted-foreground">{store.seo_description}</p>
        </section>
      )}

      {store.how_to_use_content && (
        <section className="flex flex-col gap-3 border-t border-border pt-8">
          <h2 className="text-xl font-semibold text-foreground">
            Como usar cupom de desconto {store.name}
          </h2>
          <p className="whitespace-pre-line text-muted-foreground">{store.how_to_use_content}</p>
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

      {category && relatedStores.length > 0 && (
        <section className="flex flex-col gap-4 border-t border-border pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Mais lojas de {category.name}</h2>
            <Link href={`/categoria/${category.slug}`} className="text-xs font-medium text-brand-text hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {relatedStores.map((relatedStore) => (
              <StoreCard key={relatedStore.id} store={relatedStore} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
