import type { Metadata } from "next";
import { getStores } from "@/lib/data";
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

// Não depende de searchParams/cookies — pode ser gerada estaticamente e
// revalidada em segundo plano (mesmo padrão da página de loja).
export const revalidate = 300;

const TITLE = "Todas as lojas com cupom de desconto — Cupom Aplicado";
const DESCRIPTION =
  "Veja todas as lojas parceiras do Cupom Aplicado e encontre cupons de desconto verificados pela comunidade para sua loja favorita.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/lojas" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/lojas`,
  },
};

export default async function LojasPage() {
  const stores = await getStores();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Lojas", item: `${SITE_URL}/lojas` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: stores.map((store, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: store.name,
      url: `${SITE_URL}/loja/${store.slug}`,
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
            <BreadcrumbPage>Lojas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Todas as lojas com cupom de desconto
        </h1>
        <p className="text-muted-foreground">
          {stores.length} {stores.length === 1 ? "loja parceira" : "lojas parceiras"}. Escolha uma
          loja pra ver os cupons de desconto verificados pela comunidade.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        {stores.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma loja disponível no momento.</p>
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
