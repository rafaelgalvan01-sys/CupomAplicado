import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error(
    "Faltam variáveis de ambiente: GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY"
  );
  process.exit(1);
}

// Passe --force pra regerar guias que já têm conteúdo.
const FORCE = process.argv.includes("--force");
// Passe --only=slug1,slug2 pra regerar só guias específicos (sempre implica --force pra esses).
const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const ONLY_SLUGS = onlyArg ? onlyArg.slice("--only=".length).split(",").filter(Boolean) : null;
// Ver comentário em scripts/generate-seo-content.mjs sobre a troca de modelo.
const MODEL = "gemini-flash-lite-latest"; // free tier

const REQUEST_INTERVAL_MS = 13000;
const MAX_ATTEMPTS_ON_RATE_LIMIT = 3;
const RATE_LIMIT_BACKOFF_MS = 20000;

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    intro: {
      type: "string",
      description:
        "Parágrafo de abertura (90-130 palavras) em português do Brasil. A PRIMEIRA frase precisa responder sozinha, sem depender do resto do parágrafo, à pergunta central do título do guia — pensada pra ser citável isoladamente por um mecanismo de busca com IA (Google AI Overviews, Perplexity, ChatGPT). O resto do parágrafo contextualiza o que o guia vai cobrir. Sem markdown, sem título, sem links.",
    },
    sections: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      description: "Seções do guia, cada uma com um subtítulo e um parágrafo de desenvolvimento.",
      items: {
        type: "object",
        properties: {
          heading: {
            type: "string",
            description: "Subtítulo curto e direto da seção (até 8 palavras), sem numeração.",
          },
          body: {
            type: "string",
            description:
              "Parágrafo de 130-190 palavras. Começa com a informação/dica principal da seção numa frase direta e autocontida, antes de elaborar — não começa com contexto/introdução, e a primeira frase nunca tem link. Sem markdown exceto, quando fizer sentido genuíno no meio/fim do parágrafo, um link interno no formato [texto âncora](/caminho) usando só os caminhos fornecidos na lista de links disponíveis. Sem inventar dados/preços/percentuais específicos que não foram dados.",
          },
        },
        required: ["heading", "body"],
      },
    },
    faq: {
      type: "array",
      minItems: 4,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
      },
    },
  },
  required: ["intro", "sections", "faq"],
};

function buildPrompt(guide, categoryName, usedQuestions, candidateLinks) {
  const contextLine = categoryName
    ? `Esse guia é sobre a categoria "${categoryName}", mas NÃO cite o nome "Cupom Aplicado" nem faça qualquer menção promocional à plataforma em nenhum momento do texto — nem na abertura, nem nas seções, nem no FAQ. A página já mostra um link pra categoria separadamente; o texto deve ser 100% informativo, sem citar o site.`
    : `Esse guia é sobre um assunto geral de economia/cupons, não preso a uma categoria de produto específica. NÃO cite o nome "Cupom Aplicado" nem faça qualquer menção promocional à plataforma em nenhum momento do texto — o texto deve ser 100% informativo.`;

  const avoidQuestionsBlock =
    usedQuestions.length > 0
      ? `\n\nOutros guias do site já usaram estas perguntas de FAQ — NÃO repita nenhuma delas nem crie uma pergunta muito parecida (mesmo assunto, palavras diferentes):\n${usedQuestions.map((q) => `- ${q}`).join("\n")}`
      : "";

  const linksBlock =
    candidateLinks.length > 0
      ? `\n\nLinks internos disponíveis pra usar DENTRO do parágrafo de alguma(s) seção(ões) (nunca na abertura, nunca na primeira frase de uma seção) — sintaxe [texto âncora natural](caminho), só com os caminhos abaixo, no máximo 3 no total, nunca repita o mesmo caminho duas vezes, e só insira um link quando fizer sentido genuíno na frase (não force em toda seção):\n${candidateLinks.map((l) => `- ${l.path}: ${l.label}`).join("\n")}`
      : "";

  return `Você escreve conteúdo editorial para um site de cupons. O objetivo desse texto NÃO é falar de uma loja específica nem promover o site — é ajudar alguém que ainda está decidindo o que/como comprar, antes de escolher onde, com conteúdo puramente informativo.

Título do guia: "${guide.title}"
${contextLine}

Escreva:
1. Um parágrafo de abertura (90-130 palavras) que já responde a essência do título logo na primeira frase.
2. Entre 4 e 6 seções, cada uma com um subtítulo curto e um parágrafo próprio de 130-190 palavras, cobrindo aspectos práticos e diferentes do tema (não repita a mesma ideia em seções diferentes).
3. Entre 4 e 5 perguntas frequentes sobre o tema do guia, específicas o suficiente pra não se confundir com o tema de outro guia, cada resposta começando pela resposta direta em si, sem enrolação antes.${avoidQuestionsBlock}${linksBlock}

Tom natural, direto, sem promessas exageradas, sem inventar números/preços/percentuais específicos que não foram dados. Responda apenas com o JSON pedido.`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateForGuide(guide, categoryName, usedQuestions, candidateLinks) {
  const prompt = buildPrompt(guide, categoryName, usedQuestions, candidateLinks);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS_ON_RATE_LIMIT; attempt++) {
    try {
      const interaction = await ai.interactions.create({
        model: MODEL,
        input: prompt,
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: RESPONSE_SCHEMA,
        },
      });
      return JSON.parse(interaction.output_text);
    } catch (err) {
      const isRateLimit = err?.status === 429;
      if (!isRateLimit || attempt === MAX_ATTEMPTS_ON_RATE_LIMIT) throw err;
      console.log(
        `  Cota excedida, tentativa ${attempt}/${MAX_ATTEMPTS_ON_RATE_LIMIT} — aguardando ${RATE_LIMIT_BACKOFF_MS / 1000}s...`
      );
      await sleep(RATE_LIMIT_BACKOFF_MS);
    }
  }
}

async function fetchCategoryName(categorySlug) {
  if (!categorySlug) return null;
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", categorySlug)
    .maybeSingle();
  if (error) throw error;
  return data?.name ?? null;
}

// Menu de links internos válidos pra oferecer ao modelo — só categorias com
// pelo menos uma loja ativa (senão a página de categoria vira noindex, ver
// AGENTS.md) e só guias que já existem como registro (com ou sem conteúdo
// ainda, já que o slug/título não muda). Buscado uma vez só, reaproveitado
// pra todos os guias da rodada.
async function fetchLinkCandidates() {
  const { data: categoriesData, error: catError } = await supabase
    .from("categories")
    .select("slug, name, stores!inner(id)")
    .eq("stores.active", true);
  if (catError) throw catError;

  const categoryMap = new Map();
  for (const row of categoriesData ?? []) categoryMap.set(row.slug, row.name);
  const categories = [...categoryMap.entries()].map(([slug, name]) => ({
    path: `/categoria/${slug}`,
    label: `cupons de ${name}`,
    slug,
  }));

  const { data: allGuides, error: guidesError } = await supabase.from("guides").select("slug, title");
  if (guidesError) throw guidesError;
  const guideLinks = (allGuides ?? []).map((g) => ({
    path: `/guias/${g.slug}`,
    label: g.title,
    slug: g.slug,
  }));

  const staticLinks = [
    { path: "/como-usar-cupom-de-desconto", label: "como usar um cupom de desconto passo a passo" },
    { path: "/lojas", label: "lista completa de lojas parceiras" },
  ];

  return { categories, guideLinks, staticLinks };
}

function candidateLinksForGuide(guide, { categories, guideLinks, staticLinks }) {
  return [
    ...categories.filter((c) => c.slug !== guide.related_category_slug),
    ...guideLinks.filter((g) => g.slug !== guide.slug),
    ...staticLinks.filter((s) => s.path !== guide.related_link_href),
  ];
}

// Nunca confia cegamente no que o modelo devolveu: só mantém um link
// [label](/caminho) se o caminho estiver na lista oferecida (evita URL
// inventada) e se ainda não tiver sido usado nesse mesmo guia (evita
// repetição, mesmo que o modelo ignore a instrução); qualquer outro caso vira
// texto puro (mantém só o label, sem quebrar a leitura).
const LINK_RE = /\[([^\]]+)\]\((\/[^\s)]+)\)/g;

function sanitizeGuideLinks(sections, allowedPaths) {
  const seen = new Set();
  let stripped = 0;

  const sanitized = sections.map((section) => ({
    ...section,
    body: section.body.replace(LINK_RE, (full, label, href) => {
      if (allowedPaths.has(href) && !seen.has(href)) {
        seen.add(href);
        return full;
      }
      stripped += 1;
      return label;
    }),
  }));

  return { sections: sanitized, linkCount: seen.size, stripped };
}

async function main() {
  let query = supabase
    .from("guides")
    .select("id, slug, title, related_category_slug, related_link_href, intro");
  if (ONLY_SLUGS) {
    query = query.in("slug", ONLY_SLUGS);
  } else if (!FORCE) {
    query = query.is("intro", null);
  }

  const { data: guides, error } = await query;
  if (error) throw error;

  if (!guides || guides.length === 0) {
    console.log(FORCE ? "Nenhum guia encontrado." : "Todos os guias já têm conteúdo. Use --force pra regerar.");
    return;
  }

  const linkCandidates = await fetchLinkCandidates();

  console.log(`Gerando conteúdo para ${guides.length} guia(s)...`);

  let done = 0;
  let failed = 0;
  // Acumula as perguntas de FAQ já usadas nesta rodada pra evitar pergunta
  // repetida/quase-idêntica entre guias diferentes (achado real jul/2026:
  // "Como saber se um cupom de desconto ainda é válido?" saiu igual em dois
  // guias distintos na primeira geração).
  const usedQuestions = [];

  for (const guide of guides) {
    try {
      const categoryName = await fetchCategoryName(guide.related_category_slug);
      const candidateLinks = candidateLinksForGuide(guide, linkCandidates);
      const { intro, sections: rawSections, faq } = await generateForGuide(
        guide,
        categoryName,
        usedQuestions,
        candidateLinks
      );

      const allowedPaths = new Set(candidateLinks.map((l) => l.path));
      const { sections, linkCount, stripped } = sanitizeGuideLinks(rawSections, allowedPaths);

      const { error: updateError } = await supabase
        .from("guides")
        .update({ intro, sections, faq })
        .eq("id", guide.id);

      if (updateError) throw updateError;

      usedQuestions.push(...faq.map((item) => item.question));
      done += 1;
      const linkNote = stripped > 0 ? `, ${linkCount} link(s) válido(s), ${stripped} removido(s)` : `, ${linkCount} link(s)`;
      console.log(`[${done}/${guides.length}] OK — ${guide.title}${linkNote}`);
    } catch (err) {
      failed += 1;
      console.error(`Erro ao gerar conteúdo para ${guide.title}:`, err.message ?? err);
    }

    await sleep(REQUEST_INTERVAL_MS);
  }

  console.log(`Pronto! ${done} guia(s) atualizados, ${failed} falha(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
