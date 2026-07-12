import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getStoreBySlug, getCouponsByStore } from "@/lib/data";
import { CouponCard } from "@/components/CouponCard";
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

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return {};

  const coupons = await getCouponsByStore(store.id);
  const description =
    store.description ??
    `${coupons.length} cupom${coupons.length === 1 ? "" : "s"} de desconto ativo${coupons.length === 1 ? "" : "s"} para ${store.name}, verificados pela comunidade do Cupom Aplicado.`;

  return {
    title: `Cupons ${store.name} — Cupom Aplicado`,
    description,
    alternates: { canonical: `/loja/${store.slug}` },
    openGraph: {
      title: `Cupons ${store.name}`,
      description,
      url: `${SITE_URL}/loja/${store.slug}`,
      images: store.logo_url ? [store.logo_url] : undefined,
    },
    ...(coupons.length === 0 && { robots: { index: false, follow: true } }),
  };
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const coupons = await getCouponsByStore(store.id);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      ...(store.categories
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: store.categories.name,
              item: `${SITE_URL}/categoria/${store.categories.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: store.categories ? 3 : 2,
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

  return (
    <div className="flex flex-col gap-8">
      <JsonLd data={breadcrumbJsonLd} />
      {offersJsonLd && <JsonLd data={offersJsonLd} />}

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
          {store.categories && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/categoria/${store.categories.slug}`}>
                  {store.categories.name}
                </BreadcrumbLink>
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
            className="h-16 w-16 rounded-lg object-contain ring-1 ring-border"
          />
        )}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{store.name}</h1>
          {store.description && <p className="text-muted-foreground">{store.description}</p>}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-foreground">
          Cupons ativos ({coupons.length})
        </h2>
        {coupons.length === 0 ? (
          <p className="text-muted-foreground">Nenhum cupom ativo no momento para esta loja.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
    </div>
  );
}
