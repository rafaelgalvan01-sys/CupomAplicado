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
        "Parágrafo de abertura (60-100 palavras) em português do Brasil. A PRIMEIRA frase precisa responder sozinha, sem depender do resto do parágrafo, à pergunta central do título do guia — pensada pra ser citável isoladamente por um mecanismo de busca com IA (Google AI Overviews, Perplexity, ChatGPT). O resto do parágrafo contextualiza brevemente o que o guia vai cobrir. Sem markdown, sem título.",
    },
    sections: {
      type: "array",
      minItems: 3,
      maxItems: 5,
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
              "Parágrafo de 80-150 palavras. Começa com a informação/dica principal da seção numa frase direta e autocontida, antes de elaborar — não começa com contexto/introdução. Sem markdown, sem inventar dados/preços/percentuais específicos que não foram dados.",
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

function buildPrompt(guide, categoryName) {
  const contextLine = categoryName
    ? `Esse guia deve, quando fizer sentido, mencionar de forma natural que o Cupom Aplicado tem cupons de desconto na categoria "${categoryName}" — sem forçar a menção em toda seção.`
    : `Esse guia é sobre um assunto geral de economia/cupons, não preso a uma categoria de produto específica.`;

  return `Você escreve conteúdo editorial para o site de cupons "Cupom Aplicado". O objetivo desse texto NÃO é falar de uma loja específica — é ajudar alguém que ainda está decidindo o que/como comprar, antes de escolher onde.

Título do guia: "${guide.title}"
${contextLine}

Escreva:
1. Um parágrafo de abertura (60-100 palavras) que já responde a essência do título logo na primeira frase.
2. Entre 3 e 5 seções, cada uma com um subtítulo curto e um parágrafo próprio, cobrindo aspectos práticos e diferentes do tema (não repita a mesma ideia em seções diferentes).
3. Entre 4 e 5 perguntas frequentes sobre o tema do guia, cada resposta começando pela resposta direta em si, sem enrolação antes.

Tom natural, direto, sem promessas exageradas, sem inventar números/preços/percentuais específicos que não foram dados. Responda apenas com o JSON pedido.`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateForGuide(guide, categoryName) {
  const prompt = buildPrompt(guide, categoryName);

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

async function main() {
  let query = supabase.from("guides").select("id, slug, title, related_category_slug, intro");
  if (!FORCE) {
    query = query.is("intro", null);
  }

  const { data: guides, error } = await query;
  if (error) throw error;

  if (!guides || guides.length === 0) {
    console.log(FORCE ? "Nenhum guia encontrado." : "Todos os guias já têm conteúdo. Use --force pra regerar.");
    return;
  }

  console.log(`Gerando conteúdo para ${guides.length} guia(s)...`);

  let done = 0;
  let failed = 0;

  for (const guide of guides) {
    try {
      const categoryName = await fetchCategoryName(guide.related_category_slug);
      const { intro, sections, faq } = await generateForGuide(guide, categoryName);

      const { error: updateError } = await supabase
        .from("guides")
        .update({ intro, sections, faq })
        .eq("id", guide.id);

      if (updateError) throw updateError;

      done += 1;
      console.log(`[${done}/${guides.length}] OK — ${guide.title}`);
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
