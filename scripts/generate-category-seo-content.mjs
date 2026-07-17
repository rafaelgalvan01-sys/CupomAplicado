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

// Passe --force pra regerar categorias que já têm conteúdo.
const FORCE = process.argv.includes("--force");
// Ver comentário em scripts/generate-seo-content.mjs — gemini-3.5-flash tinha
// cota gratuita diária de só 20 req/dia, compartilhada entre os dois scripts.
// Trocado pra gemini-flash-lite-latest jul/2026.
const MODEL = "gemini-flash-lite-latest"; // free tier

const REQUEST_INTERVAL_MS = 13000;
const MAX_ATTEMPTS_ON_RATE_LIMIT = 3;
const RATE_LIMIT_BACKOFF_MS = 20000;

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    seo_description: {
      type: "string",
      description:
        "Texto de 200 a 300 palavras em português do Brasil sobre a categoria e o tipo de cupom de desconto que ela reúne, para SEO. A PRIMEIRA frase precisa responder sozinha, sem depender do resto do parágrafo, à pergunta 'o que são cupons dessa categoria e o que esperar deles' — pensada pra ser citável isoladamente por um mecanismo de busca com IA (Google AI Overviews, Perplexity, ChatGPT), não só por um leitor humano que vai ler o parágrafo inteiro. O resto do texto elabora depois dessa frase inicial. Não invente números/percentuais de desconto específicos. Sem markdown, sem título.",
    },
    how_to_use_content: {
      type: "string",
      description:
        "Texto de 100 a 180 palavras em português do Brasil explicando COMO ESCOLHER a melhor loja/cupom dentro dessa categoria (ex: comparar o desconto entre as lojas listadas, olhar o indicador \"Funciona?\" antes de tentar, verificar se o cupom exige valor mínimo de compra). Comece com uma frase direta e autocontida antes de elaborar — não comece com contexto/introdução. Se houver mais de um critério, prefira listar cada um em frase curta própria em vez de encadear tudo numa frase só longa. Sem markdown, sem título, sem inventar prazos/percentuais.",
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
  required: ["seo_description", "how_to_use_content", "faq"],
};

function buildPrompt(category, storeNames) {
  const storesList =
    storeNames.length > 0
      ? storeNames.map((n) => `- ${n}`).join("\n")
      : "(nenhuma loja cadastrada no momento)";

  return `Você escreve conteúdo de SEO para o site de cupons "Cupom Aplicado".

Categoria: ${category.name}
Lojas parceiras nessa categoria hoje:
${storesList}

Escreva:
1. Um texto de SEO (200-300 palavras) descrevendo a categoria "${category.name}" e o tipo de cupom de desconto que os compradores encontram nela no Cupom Aplicado. Tom natural, direto, sem promessas exageradas ("os melhores cupons do Brasil"), sem inventar dados que não foram dados (percentuais específicos, prazos). Pode citar 2-3 das lojas listadas como exemplo, sem repetir a lista toda.
2. Um texto separado (100-180 palavras) especificamente sobre COMO ESCOLHER o melhor cupom dentro dessa categoria — não repita o texto do item 1, é uma seção própria da página da categoria.
3. Entre 4 e 5 perguntas frequentes (FAQ) que um comprador teria sobre cupons dessa categoria especificamente (ex: quais tipos de produto entram, se cupom de uma loja da categoria funciona em outra, como saber se o cupom ainda é válido). Cada resposta começa com a resposta direta em si na primeira frase, sem enrolação antes — pensado pra ser lido isoladamente, fora do contexto da pergunta, e ainda fazer sentido completo.

Responda apenas com o JSON pedido.`;
}

async function fetchActiveStoreNames(categoryId) {
  const { data, error } = await supabase
    .from("stores")
    .select("name")
    .eq("category_id", categoryId)
    .eq("active", true)
    .limit(15);
  if (error) throw error;
  return (data ?? []).map((s) => s.name);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateForCategory(category) {
  const storeNames = await fetchActiveStoreNames(category.id);
  const prompt = buildPrompt(category, storeNames);

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

async function main() {
  let query = supabase.from("categories").select("id, name, faq, seo_description, how_to_use_content");
  if (!FORCE) {
    query = query.is("how_to_use_content", null);
  }

  const { data: categories, error } = await query;
  if (error) throw error;

  if (!categories || categories.length === 0) {
    console.log(FORCE ? "Nenhuma categoria encontrada." : "Todas as categorias já têm conteúdo SEO completo. Use --force pra regerar.");
    return;
  }

  console.log(`Gerando conteúdo SEO para ${categories.length} categoria(s)...`);

  let done = 0;
  let failed = 0;

  for (const category of categories) {
    try {
      const { seo_description, how_to_use_content, faq } = await generateForCategory(category);

      const { error: updateError } = await supabase
        .from("categories")
        .update({ seo_description, how_to_use_content, faq })
        .eq("id", category.id);

      if (updateError) throw updateError;

      done += 1;
      console.log(`[${done}/${categories.length}] OK — ${category.name}`);
    } catch (err) {
      failed += 1;
      console.error(`Erro ao gerar conteúdo para ${category.name}:`, err.message ?? err);
    }

    await sleep(REQUEST_INTERVAL_MS);
  }

  console.log(`Pronto! ${done} categoria(s) atualizadas, ${failed} falha(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
