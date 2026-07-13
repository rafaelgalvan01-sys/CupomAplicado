import type { Metadata } from "next";
import { Copy, ShieldCheck, Wallet } from "lucide-react";
import { getStores, getActiveCouponsCount } from "@/lib/data";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Página institucional estática, sem searchParams — pode ser gerada uma vez
// e revalidada em segundo plano (mesmo padrão da página de loja).
export const revalidate = 300;

const TITLE = "Sobre o Cupom Aplicado — Cupons de desconto verificados";
const DESCRIPTION =
  "Conheça o Cupom Aplicado: como funciona, por que o uso é sempre gratuito e como a comunidade ajuda a verificar cada cupom de desconto antes de você aplicar na compra.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/sobre" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/sobre`,
  },
};

const STEPS = [
  {
    icon: Copy,
    title: "Escolha e copie o cupom",
    description:
      "Navegue pelas lojas parceiras e copie o código do cupom de desconto que quiser usar. Não precisa de cadastro.",
  },
  {
    icon: ShieldCheck,
    title: "Veja se funciona antes de usar",
    description:
      "Cada cupom mostra o percentual \"Funciona?\", calculado a partir dos votos de quem já usou — assim você sabe o que esperar antes de tentar.",
  },
  {
    icon: Wallet,
    title: "Aplique na loja e economize",
    description:
      "Ao copiar o cupom você é redirecionado direto pro site da loja parceira. Cole o código no carrinho antes de fechar o pedido e o desconto é aplicado.",
  },
];

export default async function SobrePage() {
  const [stores, activeCoupons] = await Promise.all([getStores(), getActiveCouponsCount()]);

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${SITE_URL}/sobre`,
    name: TITLE,
    description: DESCRIPTION,
    mainEntity: {
      "@type": "Organization",
      name: "Cupom Aplicado",
      url: SITE_URL,
      description: DESCRIPTION,
      logo: `${SITE_URL}/icon.png`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Sobre", item: `${SITE_URL}/sobre` },
    ],
  };

  return (
    <div className="flex flex-col gap-10">
      <JsonLd data={aboutJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Sobre</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Sobre o Cupom Aplicado
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          O Cupom Aplicado reúne cupons de desconto de lojas parceiras num só lugar, com um
          diferencial: cada cupom é avaliado pela própria comunidade, então você sabe se o desconto
          realmente funciona antes de tentar usar.
        </p>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="rounded-full bg-brand/15 px-3 py-1 font-medium text-brand-text">
            {activeCoupons} {activeCoupons === 1 ? "cupom ativo" : "cupons ativos"}
          </span>
          <span className="rounded-full bg-muted px-3 py-1 font-medium">
            {stores.length} {stores.length === 1 ? "loja parceira" : "lojas parceiras"}
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-foreground">Como funciona</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card key={step.title}>
              <CardHeader>
                <step.icon className="size-5 text-brand-text" />
                <CardTitle className="mt-2">
                  {index + 1}. {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-foreground">Cupons verificados pela comunidade</h2>
        <p className="max-w-2xl text-muted-foreground">
          Diferente de listas de cupons genéricas, no Cupom Aplicado quem usou o cupom conta se ele
          funcionou. Esses votos formam o indicador &quot;Funciona?&quot; em cada card — uma forma
          simples de filtrar cupons de desconto expirados ou que pararam de valer, sem depender só da
          data de validade informada pela loja.
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-foreground">Sempre gratuito, sem cadastro</h2>
        <p className="max-w-2xl text-muted-foreground">
          Usar o Cupom Aplicado não custa nada e não exige criar conta. Quando um cupom de desconto é
          usado através do nosso site, recebemos uma pequena comissão da loja parceira — o mesmo valor
          que você pagaria de qualquer forma, sem nenhum custo extra pra você. É assim que mantemos o
          site no ar.
        </p>
      </section>
    </div>
  );
}
