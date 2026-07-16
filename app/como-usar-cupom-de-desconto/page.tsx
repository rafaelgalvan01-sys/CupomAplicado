import type { Metadata } from "next";
import { Search, Copy, ShoppingCart } from "lucide-react";
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
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion";

// Página de conteúdo evergreen (não depende de dado dinâmico nenhum) — pode
// ser estática e revalidada em segundo plano como /sobre.
export const revalidate = 300;

const TITLE = "Como usar cupom de desconto: passo a passo — Cupom Aplicado";
const DESCRIPTION =
  "Aprenda a aplicar um cupom de desconto do jeito certo: onde copiar o código, como colar na loja e por que ele às vezes não funciona.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/como-usar-cupom-de-desconto" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/como-usar-cupom-de-desconto`,
  },
};

const STEPS = [
  {
    icon: Search,
    title: "Encontre o cupom da loja",
    description:
      "Procure a loja onde você vai comprar (pelo campo de busca ou navegando pelas lojas parceiras) e veja os cupons ativos disponíveis pra ela.",
  },
  {
    icon: Copy,
    title: "Copie o código",
    description:
      "Clique em \"Copiar\" no cupom escolhido. O código vai direto pra sua área de transferência e você é levado pro site da loja.",
  },
  {
    icon: ShoppingCart,
    title: "Cole o código no carrinho",
    description:
      "Na página de pagamento da loja, procure o campo \"cupom\", \"código promocional\" ou \"cupom de desconto\", cole o código e confirme antes de fechar o pedido.",
  },
];

const REASONS_NOT_WORKING = [
  "Valor mínimo de compra não atingido.",
  "Cupom válido só pra primeira compra na loja.",
  "Categoria de produto excluída da promoção (comum em eletrônicos e itens já em liquidação).",
  "Cupom esgotado antes da data de validade informada.",
];

const FAQ = [
  {
    question: "Por que meu cupom de desconto não funcionou?",
    answer:
      "Os motivos mais comuns são: o cupom exige um valor mínimo de compra, é exclusivo pra clientes novos, já expirou, ou não vale pra alguma categoria específica de produto. Veja o percentual \"Funciona?\" do cupom antes de tentar — ele é calculado com base em quem já usou.",
  },
  {
    question: "Posso usar mais de um cupom na mesma compra?",
    answer:
      "Normalmente não. A maioria das lojas permite aplicar só um código promocional por pedido, mesmo que você tenha vários cupons diferentes.",
  },
  {
    question: "O cupom de desconto expira?",
    answer:
      "Sim, todo cupom tem uma validade definida pela própria loja. Quando ela é informada, mostramos a data no cartão do cupom — mas mesmo dentro do prazo, a loja pode encerrar a promoção antes.",
  },
  {
    question: "Preciso me cadastrar no Cupom Aplicado pra usar um cupom?",
    answer:
      "Não. Copiar e usar um código de desconto é sempre gratuito e não exige criar conta. O cadastro, se existir, é só da loja onde você está comprando.",
  },
  {
    question: "O código não aparece no campo de cupom da loja, e agora?",
    answer:
      "Confirme se copiou o código certo (sem espaço em branco antes ou depois) e se o campo é realmente de \"cupom\"/\"código promocional\" e não de CEP ou vale-presente, que costumam ficar próximos no checkout.",
  },
];

export default function ComoUsarCupomDeDescontoPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Como usar cupom de desconto",
        item: `${SITE_URL}/como-usar-cupom-de-desconto`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 flex flex-col gap-10">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Como usar cupom de desconto</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Como usar cupom de desconto: passo a passo
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Um cupom de desconto é um código que, aplicado no carrinho de uma loja online, reduz o
          valor da compra ou libera um benefício como frete grátis. O processo é simples, mas alguns
          detalhes fazem a diferença entre o desconto ser aplicado ou não.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-foreground">Passo a passo</h2>
        <ol className="grid list-none grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full">
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
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-foreground">
          Por que um cupom de desconto às vezes não funciona
        </h2>
        <p className="max-w-2xl text-muted-foreground">
          Um cupom deixa de funcionar quando a compra não atende a alguma regra definida pela
          própria loja — não tem relação com o Cupom Aplicado. Os motivos mais comuns:
        </p>
        <ul className="max-w-2xl list-disc space-y-1 pl-5 text-muted-foreground">
          {REASONS_NOT_WORKING.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        <p className="max-w-2xl text-muted-foreground">
          Por isso cada cupom no site mostra o indicador &quot;Funciona?&quot;, baseado nos votos de
          quem já tentou usar — um jeito rápido de saber se vale a pena tentar antes de ir até o
          checkout da loja.
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-foreground">Perguntas frequentes</h2>
        <Accordion className="rounded-lg border border-border bg-card px-4">
          {FAQ.map((item, index) => (
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
