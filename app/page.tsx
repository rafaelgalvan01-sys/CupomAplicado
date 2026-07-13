import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  getFeaturedCoupons,
  getCoupons,
  getTopStores,
  getActiveCouponsCount,
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
  searchParams: Promise<{ q?: string }>;
};

// Buscas internas não têm conteúdo próprio pra indexar (é a mesma listagem
// filtrada) — a página "real" pro Google é sempre a home sem parâmetros.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    alternates: { canonical: "/" },
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
  const { q } = await searchParams;

  const [featured, coupons, topStores, activeCount] = await Promise.all([
    q ? Promise.resolve([]) : getFeaturedCoupons(),
    getCoupons({ query: q }),
    getTopStores(10),
    getActiveCouponsCount(),
  ]);

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

  return (
    <div className="flex flex-col gap-14">
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={faqJsonLd} />

      <section className="relative -mt-8 flex flex-col items-center gap-3 overflow-hidden pt-14 pb-6 text-center sm:pt-18 sm:pb-10">
        <HeroBackground />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Image src={iconMark} alt="" width={48} height={48} className="hero-logo-mark mb-1" priority />
          <span className="flex items-center gap-2 rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand-text">
            <span className="size-1.5 rounded-full bg-brand" />
            {activeCount} {activeCount === 1 ? "cupom ativo hoje" : "cupons ativos hoje"}
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            <span className="block">Cupons de desconto</span>
            <span className="block text-brand-text">para economizar em cada compra</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Verificados pela comunidade. Vote se funcionou para ajudar outros usuários.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Lojas parceiras
          </h2>
          <Link href="/lojas" className="text-xs font-medium text-brand-text hover:underline">
            Ver todas
          </Link>
        </div>
        <StoreCarousel stores={topStores} />
      </section>

      {featured.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <Star className="size-3.5 fill-current text-brand-text" />
            Destaques
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
  );
}
