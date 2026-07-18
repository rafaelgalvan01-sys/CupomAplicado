import type { Metadata } from "next";
import Image from "next/image";
import { Star } from "lucide-react";
import {
  getFeaturedCoupons,
  getCoupons,
  getCouponsCount,
  getTopStores,
  getActiveCouponsCount,
  COUPONS_PAGE_SIZE,
} from "@/lib/data";
import { CouponCard } from "@/components/CouponCard";
import { StoreCarousel } from "@/components/StoreCarousel";
import { HeroBackground } from "@/components/HeroBackground";
import { JsonLd } from "@/components/JsonLd";
import iconMark from "@/app/icon.png";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion";
import { Pagination } from "@/components/ui/pagination";
import { SITE_URL } from "@/lib/site";
import type { CouponWithStore } from "@/lib/types";

const HOME_FAQ = [
  {
    question: "Como funciona o Cupom Aplicado?",
    answer:
      "Reunimos cupons de desconto de várias lojas parceiras num só lugar. Você escolhe o cupom, copia o código e é redirecionado direto pro site da loja pra finalizar a compra com o desconto aplicado.",
  },
  {
    question: "Os cupons de desconto são verificados?",
    answer:
      "Sim. Cada cupom tem um indicador \"Funciona?\" baseado nos votos da própria comunidade — quem usa o cupom confirma se o desconto foi aplicado ou não, ajudando outros usuários a escolher com mais segurança.",
  },
  {
    question: "É grátis usar o Cupom Aplicado?",
    answer:
      "Sim, o uso é sempre gratuito e não exige cadastro. Ganhamos uma pequena comissão das lojas parceiras quando um cupom é usado, sem nenhum custo extra pra você.",
  },
  {
    question: "Como eu aplico um cupom de desconto?",
    answer:
      "Clique em \"Copiar\" no cupom desejado — o código vai pra sua área de transferência e você é levado direto pro site da loja. Na finalização da compra, cole o código no campo de cupom antes de fechar o pedido.",
  },
];

type Props = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

// Buscas internas não têm conteúdo próprio pra indexar (é a mesma listagem
// filtrada) — a página "real" pro Google é sempre a home sem parâmetros.
// Páginas seguintes (?page=2, 3...) são conteúdo genuinamente diferente da
// página 1 (outros cupons), então continuam indexáveis, cada uma com seu
// próprio canonical — só busca (?q=) fica de fora do índice.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, page } = await searchParams;
  const pageNumber = Number(page) || 1;
  const canonical = pageNumber > 1 ? `/?page=${pageNumber}` : "/";
  return {
    alternates: { canonical },
    ...(q && { robots: { index: false, follow: true } }),
  };
}

function toStoreProp(coupon: CouponWithStore) {
  return {
    name: coupon.stores?.name ?? "Loja",
    slug: coupon.stores?.slug ?? "",
    logo_url: coupon.stores?.logo_url ?? null,
  };
}

export default async function Home({ searchParams }: Props) {
  const { q, page } = await searchParams;
  const currentPage = Math.max(Number(page) || 1, 1);

  const [featured, coupons, couponsTotal, topStores, activeCount] = await Promise.all([
    q || currentPage > 1 ? Promise.resolve([]) : getFeaturedCoupons(),
    getCoupons({ query: q, page: currentPage }),
    getCouponsCount(q),
    getTopStores(10),
    getActiveCouponsCount(),
  ]);
  const totalPages = Math.max(Math.ceil(couponsTotal / COUPONS_PAGE_SIZE), 1);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cupom Aplicado",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  // Cupom não tem página própria ainda, então cada item da lista aponta pra
  // página da loja — mesmo padrão de fallback já usado noutras ItemList do
  // site quando a entidade não tem URL individual.
  const couponsListJsonLd = coupons.length > 0 && {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: coupons.map((coupon, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: coupon.title,
      url: `${SITE_URL}/loja/${coupon.stores?.slug ?? ""}`,
    })),
  };

  return (
    <div className="flex flex-col gap-8">
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={faqJsonLd} />
      {couponsListJsonLd && <JsonLd data={couponsListJsonLd} />}

      <section className="relative isolate flex flex-col items-center gap-2 overflow-hidden py-6 text-center sm:py-10">
        <HeroBackground />
        <div className="relative z-10 flex flex-col items-center gap-2 px-4">
          <Image src={iconMark} alt="" width={40} height={40} className="hero-logo-mark" priority />
          <span className="flex items-center gap-2 rounded-full border border-brand/22 bg-brand/15 px-3 py-1 text-xs font-medium text-brand-text">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 rounded-full bg-brand" style={{ animation: "badge-dot-pulse 2.5s ease-out infinite" }} />
              <span className="relative size-1.5 rounded-full bg-brand" />
            </span>
            {activeCount} {activeCount === 1 ? "cupom ativo hoje" : "cupons ativos hoje"}
          </span>
          <h1 className="max-w-2xl text-3xl tracking-tight text-foreground sm:text-5xl">
            <span className="block font-semibold">Cupons de desconto</span>
            <span className="block whitespace-nowrap text-xl font-light text-brand-text sm:text-4xl md:text-5xl">
              para economizar em cada compra
            </span>
          </h1>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 pb-14 flex flex-col gap-8">
        <StoreCarousel stores={topStores} title="Lojas parceiras" viewAllHref="/lojas" />

        {featured.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              <Star className="size-3.5 fill-current text-brand-text" />
              Destaques
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {featured.map((coupon, index) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  store={toStoreProp(coupon)}
                  priority={index === 0}
                />
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {q ? `Resultados para "${q}"` : "Todos os cupons"}
          </h2>
          {coupons.length === 0 ? (
            <p className="text-muted-foreground">Nenhum cupom encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {coupons.map((coupon, index) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  store={toStoreProp(coupon)}
                  priority={featured.length === 0 && index === 0}
                />
              ))}
            </div>
          )}
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/" params={{ q }} />
        </section>

        <section className="flex flex-col gap-3 border-t border-border pt-8">
          <h2 className="text-xl font-semibold text-foreground">Perguntas frequentes</h2>
          <Accordion className="rounded-lg border border-border bg-card px-4">
            {HOME_FAQ.map((item, index) => (
              <AccordionItem key={item.question} value={index}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionPanel>
                  <p className="text-muted-foreground">{item.answer}</p>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
