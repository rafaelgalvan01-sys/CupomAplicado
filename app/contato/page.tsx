import type { Metadata } from "next";
import Link from "next/link";
import { Mail, TicketPercent, Store, HelpCircle, ShieldCheck } from "lucide-react";
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
import { ContactForm } from "@/components/ContactForm";

// Página institucional estática, sem dado dinâmico — mesmo padrão de /sobre.
export const revalidate = 300;

const CONTACT_EMAIL = "contato@cupomaplicado.com.br";

const TITLE = "Contato — Cupom Aplicado";
const DESCRIPTION =
  "Fale com o Cupom Aplicado pelo e-mail contato@cupomaplicado.com.br: reporte um cupom que não funcionou, sugira ou anuncie uma loja, proponha uma parceria ou tire dúvidas sobre seus dados.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contato" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/contato`,
  },
};

const REASONS = [
  {
    icon: TicketPercent,
    title: "Um cupom não funcionou",
    description:
      "Avise qual loja e qual cupom — a gente verifica e atualiza o mais rápido possível pra não atrapalhar quem vem depois.",
  },
  {
    icon: Store,
    title: "Sugerir ou anunciar uma loja",
    description:
      "É lojista e quer aparecer aqui, ou quer indicar uma loja que faz falta? Manda pra gente.",
  },
  {
    icon: HelpCircle,
    title: "Dúvidas gerais",
    description:
      "Qualquer pergunta sobre como o site funciona, como usar os cupons ou como a comunidade avalia cada um.",
  },
  {
    icon: ShieldCheck,
    title: "Privacidade e seus dados",
    description:
      "Pedidos relacionados aos seus dados pessoais (LGPD) também são por aqui. Veja também a Política de Privacidade.",
  },
];

export default function ContatoPage() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${SITE_URL}/contato`,
    name: TITLE,
    description: DESCRIPTION,
    mainEntity: {
      "@type": "Organization",
      name: "Cupom Aplicado",
      url: SITE_URL,
      email: CONTACT_EMAIL,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Contato", item: `${SITE_URL}/contato` },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 flex flex-col gap-10">
      <JsonLd data={contactJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Contato</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Contato
        </h1>
        <p className="text-lg text-muted-foreground">
          Preencha o formulário abaixo que a gente responde por e-mail, normalmente em até 2 dias
          úteis. Não temos telefone nem endereço físico de atendimento: todo o suporte é feito por
          e-mail.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-foreground">Envie uma mensagem</h2>
        <ContactForm />
        <p className="text-sm text-muted-foreground">
          Prefere e-mail direto? Escreva para{" "}
          <Link
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-1 font-medium text-brand-text hover:underline"
          >
            <Mail className="size-4" />
            {CONTACT_EMAIL}
          </Link>
          .
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-foreground">No que podemos ajudar</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {REASONS.map((reason) => (
            <Card key={reason.title} className="h-full">
              <CardHeader>
                <reason.icon className="size-5 text-brand-text" />
                <CardTitle className="mt-2">{reason.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {reason.description}
                  {reason.title === "Privacidade e seus dados" && (
                    <>
                      {" "}
                      <Link
                        href="/politica-de-privacidade"
                        className="font-medium text-brand-text hover:underline"
                      >
                        Ver Política de Privacidade
                      </Link>
                      .
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
