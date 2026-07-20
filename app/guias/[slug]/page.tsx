import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuideBySlug, getGuideSlugs, getCategoryBySlug } from "@/lib/data";
import { JsonLd } from "@/components/JsonLd";
import { GuideBody } from "@/components/GuideBody";
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
  const guides = await getGuideSlugs();
  return guides.map((guide) => ({ slug: guide.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return {};

  // Título completo (guide.title) fica só no H1 visível na página — a tag
  // <title> (o que o Google mostra) usa a versão curta (seo_title) quando
  // existir, pra não passar de ~60 caracteres e ser cortada na busca.
  const title = `${guide.seo_title ?? guide.title} — Cupom Aplicado`;
  const description = guide.intro?.trim()
    ? truncateText(guide.intro.trim(), 155)
    : `Guia de compra e economia do Cupom Aplicado: ${guide.title}.`;

  return {
    title,
    description,
    alternates: { canonical: `/guias/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/guias/${slug}`,
      ...(guide.image_url && { images: [guide.image_url] }),
    },
    // Guia ainda sem conteúdo gerado (ver scripts/generate-guide-content.mjs)
    // — mesmo tratamento já usado pra categoria/loja vazia (ver AGENTS.md).
    ...(!guide.intro && { robots: { index: false, follow: true } }),
  };
}

export default async function GuiaPage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const relatedCategory = guide.related_category_slug
    ? await getCategoryBySlug(guide.related_category_slug)
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guias", item: `${SITE_URL}/guias` },
      { "@type": "ListItem", position: 3, name: guide.title, item: `${SITE_URL}/guias/${slug}` },
    ],
  };

  const faq = guide.faq ?? [];
  const faqJsonLd = faq.length > 0 && {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  // Article JSON-LD: avisa o Google que isso é conteúdo editorial (com
  // imagem e datas), não só uma lista de perguntas — habilita elegibilidade
  // pra lugares como o Google Discover.
  const articleJsonLd = guide.intro && {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.intro,
    ...(guide.image_url && { image: [guide.image_url] }),
    datePublished: guide.created_at,
    dateModified: guide.updated_at,
    author: { "@type": "Organization", name: "Cupom Aplicado" },
    publisher: { "@type": "Organization", name: "Cupom Aplicado" },
    mainEntityOfPage: `${SITE_URL}/guias/${slug}`,
  };

  // Toda página de guia precisa de pelo menos um link pra dentro do site —
  // categoria relacionada tem prioridade; sem categoria, cai no link
  // específico definido na migração (ex: cruzar com /como-usar-cupom-de-
  // desconto pra guias com tema parecido) ou some se nenhum dos dois existir.
  const relatedLink = relatedCategory
    ? { href: `/categoria/${relatedCategory.slug}`, label: `Ver cupons de ${relatedCategory.name}` }
    : guide.related_link_href && guide.related_link_label
      ? { href: guide.related_link_href, label: guide.related_link_label }
      : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 flex flex-col gap-8">
      <JsonLd data={breadcrumbJsonLd} />
      {articleJsonLd && <JsonLd data={articleJsonLd} />}
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/guias">Guias</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{guide.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{guide.title}</h1>

      {guide.image_url && (
        <figure className="flex flex-col gap-1.5">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={guide.image_url}
              alt={guide.image_alt ?? ""}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              priority
              className="object-cover"
            />
          </div>
          {guide.photographer_name && (
            <figcaption className="text-xs text-muted-foreground">
              Foto:{" "}
              {guide.photographer_url ? (
                <a href={guide.photographer_url} target="_blank" rel="noopener noreferrer nofollow" className="hover:underline">
                  {guide.photographer_name}
                </a>
              ) : (
                guide.photographer_name
              )}
              {" "}via Pexels
            </figcaption>
          )}
        </figure>
      )}

      {!guide.intro ? (
        <p className="text-muted-foreground">Esse guia ainda está sendo preparado — volte em breve.</p>
      ) : (
        <>
          <p className="whitespace-pre-line text-lg text-muted-foreground">{guide.intro}</p>

          {relatedLink && (
            <Link
              href={relatedLink.href}
              className="flex items-center justify-between gap-3 rounded-xl border border-brand/22 bg-brand/10 px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand/15"
            >
              {relatedLink.label}
              <span aria-hidden>→</span>
            </Link>
          )}

          <div className="flex flex-col gap-6">
            {guide.sections.map((section) => (
              <section key={section.heading} className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
                <p className="whitespace-pre-line text-muted-foreground">
                  <GuideBody text={section.body} />
                </p>
              </section>
            ))}
          </div>

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
        </>
      )}
    </div>
  );
}
