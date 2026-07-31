import type { Metadata } from "next";
import Link from "next/link";
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

// Página institucional estática, sem dado dinâmico — mesmo padrão de /sobre.
export const revalidate = 300;

const CONTACT_EMAIL = "contato@cupomaplicado.com.br";
const LAST_UPDATED = "31 de julho de 2026";

const TITLE = "Política de Privacidade — Cupom Aplicado";
const DESCRIPTION =
  "Como o Cupom Aplicado trata seus dados: não exigimos cadastro nem coletamos dados pessoais pra usar o site. Entenda cookies, analytics, redes de afiliados e seus direitos pela LGPD.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/politica-de-privacidade" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/politica-de-privacidade`,
  },
};

export default function PoliticaDePrivacidadePage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Política de Privacidade",
        item: `${SITE_URL}/politica-de-privacidade`,
      },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 flex flex-col gap-8">
      <JsonLd data={breadcrumbJsonLd} />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Política de Privacidade</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Política de Privacidade
        </h1>
        <p className="text-lg text-muted-foreground">
          O Cupom Aplicado não exige cadastro e não coleta seu nome, e-mail ou outros dados pessoais
          para você usar o site. Esta política explica os poucos dados que são tratados quando você
          navega pelo cupomaplicado.com.br, por que isso acontece e quais são os seus direitos.
        </p>
        <p className="text-sm text-muted-foreground">Última atualização: {LAST_UPDATED}.</p>
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-foreground">Quais dados tratamos</h2>
        <p className="text-muted-foreground">
          Como não há login nem cadastro, não pedimos nem guardamos dados que identifiquem você
          pessoalmente. Os únicos dados envolvidos são:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Dados de navegação (anônimos):</span>{" "}
            estatísticas de uso do site (páginas visitadas, dispositivo, região aproximada), coletadas
            de forma agregada e sem identificar você, apenas para entender o que é útil e melhorar o
            site.
          </li>
          <li>
            <span className="font-medium text-foreground">Cookie de votação:</span> quando você vota
            se um cupom &quot;Funciona?&quot;, guardamos no seu navegador um código aleatório (um cookie
            chamado <span className="font-medium text-foreground">voter_id</span>) e registramos o seu
            voto ligado a esse código, apenas para evitar voto duplicado. Esse código não identifica
            você.
          </li>
          <li>
            <span className="font-medium text-foreground">Cookies de redes de afiliados:</span> ao
            clicar em um cupom e ser levado para a loja, a rede de afiliados pode registrar um cookie
            para reconhecer que o clique veio do Cupom Aplicado — é isso que nos permite receber uma
            comissão da loja, sem custo extra para você.
          </li>
          <li>
            <span className="font-medium text-foreground">Mensagens de contato:</span> quando você usa
            o formulário de contato ou escreve para {CONTACT_EMAIL}, tratamos os dados que você
            informa (nome, e-mail, assunto e mensagem), usados apenas para responder você. O envio do
            formulário é processado pelo serviço Web3Forms, que entrega a mensagem no nosso e-mail.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-foreground">Como usamos esses dados</h2>
        <p className="text-muted-foreground">
          Os dados são usados só para manter e melhorar o serviço, nunca para vender ou perfilar você.
          Em concreto:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Manter o site funcionando e entender quais cupons e páginas são mais úteis.</li>
          <li>
            Registrar que um clique em cupom partiu daqui, para receber a comissão da loja parceira.
          </li>
          <li>Responder às mensagens que você envia por e-mail.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-foreground">Cookies</h2>
        <p className="text-muted-foreground">
          Cookies são pequenos arquivos guardados pelo navegador. O Cupom Aplicado usa dois tipos: os
          de estatística (para a medição de uso anônima) e os das redes de afiliados (ativados quando
          você vai para a loja). Você pode bloquear ou apagar cookies a qualquer momento nas
          configurações do seu navegador — o site continua funcionando normalmente, e a medição de uso
          também respeita o sinal de &quot;não rastrear&quot; do navegador.
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-foreground">Com quem os dados são compartilhados</h2>
        <p className="text-muted-foreground">
          Não vendemos nem alugamos seus dados. Eles passam apenas pelos serviços necessários para o
          site existir:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Vercel:</span> hospedagem do site e medição
            de uso anônima.
          </li>
          <li>
            <span className="font-medium text-foreground">Redes de afiliados (como Awin e Lomadee):</span>{" "}
            processam o clique nos cupons para creditar a comissão. Cada uma tem a própria política de
            privacidade, aplicada a partir do momento em que você entra no site da loja.
          </li>
          <li>
            <span className="font-medium text-foreground">Web3Forms:</span> processa o envio do
            formulário de contato e entrega a sua mensagem no nosso e-mail.
          </li>
        </ul>
        <p className="text-muted-foreground">
          Alguns desses serviços ficam fora do Brasil, então os dados podem ser tratados no exterior
          (transferência internacional). Escolhemos serviços que seguem padrões reconhecidos de
          proteção de dados.
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-foreground">Seus direitos (LGPD)</h2>
        <p className="text-muted-foreground">
          Pela Lei Geral de Proteção de Dados, você pode a qualquer momento pedir para confirmar,
          acessar, corrigir ou excluir dados seus que estejam conosco, além de retirar consentimentos.
          Como não guardamos dados pessoais de quem só navega, na prática isso costuma se aplicar às
          mensagens enviadas por e-mail. Para exercer qualquer direito, escreva para{" "}
          <Link
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-brand-text hover:underline"
          >
            {CONTACT_EMAIL}
          </Link>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-foreground">Alterações nesta política</h2>
        <p className="text-muted-foreground">
          Podemos atualizar esta política quando o site mudar ou quando a legislação exigir. A data de
          &quot;última atualização&quot; no topo sempre indica a versão vigente.
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-foreground">Contato</h2>
        <p className="text-muted-foreground">
          Dúvidas sobre esta Política de Privacidade ou sobre seus dados? Fale com a gente pelo{" "}
          <Link
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-brand-text hover:underline"
          >
            {CONTACT_EMAIL}
          </Link>{" "}
          ou pela página de{" "}
          <Link href="/contato" className="font-medium text-brand-text hover:underline">
            Contato
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
