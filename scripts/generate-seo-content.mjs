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

// Passe --force pra regerar lojas que já têm seo_description.
const FORCE = process.argv.includes("--force");
const MODEL = "gemini-3.5-flash"; // free tier

// O free tier desse modelo permite só 5 requisições por minuto (confirmado
// via erro 429 real da API — o comentário antigo aqui assumia um limite bem
// maior). 13s de intervalo mantém ritmo de ~4,6/min, com margem de segurança.
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
        "Texto de 200 a 300 palavras em português do Brasil sobre a loja e seus cupons, para SEO. Sem markdown, sem título.",
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
  required: ["seo_description", "faq"],
};

function buildPrompt(store, couponTitles) {
  const couponsList =
    couponTitles.length > 0
      ? couponTitles.map((t) => `- ${t}`).join("\n")
      : "(nenhum cupom ativo no momento)";

  return `Você escreve conteúdo de SEO para o site de cupons "Cupom Aplicado".

Loja: ${store.name}
Categoria: ${store.category ?? "não informada"}
Cupons ativos hoje:
${couponsList}

Escreva:
1. Um texto de SEO (200-300 palavras) descrevendo a loja, o tipo de produto que ela vende, e como usar os cupons dela no Cupom Aplicado. Tom natural, direto, sem promessas exageradas ("melhor loja do Brasil"), sem inventar dados que não foram dados (números de desconto específicos, prazos). Não repita o nome da loja em excesso.
2. Entre 4 e 5 perguntas frequentes (FAQ) que um comprador teria sobre cupons dessa loja especificamente (ex: como aplicar o cupom, se acumula com outras promoções, se funciona pra frete grátis) com respostas curtas e objetivas em português.

Responda apenas com o JSON pedido.`;
}

async function fetchActiveCouponTitles(storeId) {
  const { data, error } = await supabase
    .from("coupons")
    .select("title")
    .eq("store_id", storeId)
    .eq("active", true)
    .limit(15);
  if (error) throw error;
  return (data ?? []).map((c) => c.title);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateForStore(store) {
  const couponTitles = await fetchActiveCouponTitles(store.id);
  const prompt = buildPrompt(store, couponTitles);

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
  let query = supabase.from("stores").select("id, name, faq, seo_description, categories(name)").eq("active", true);
  if (!FORCE) {
    query = query.is("seo_description", null);
  }

  const { data: stores, error } = await query;
  if (error) throw error;

  if (!stores || stores.length === 0) {
    console.log(FORCE ? "Nenhuma loja encontrada." : "Todas as lojas já têm seo_description. Use --force pra regerar.");
    return;
  }

  console.log(`Gerando conteúdo SEO para ${stores.length} loja(s)...`);

  let done = 0;
  let failed = 0;

  for (const store of stores) {
    try {
      const { seo_description, faq } = await generateForStore({
        id: store.id,
        name: store.name,
        category: store.categories?.name,
      });

      const { error: updateError } = await supabase
        .from("stores")
        .update({ seo_description, faq })
        .eq("id", store.id);

      if (updateError) throw updateError;

      done += 1;
      console.log(`[${done}/${stores.length}] OK — ${store.name}`);
    } catch (err) {
      failed += 1;
      console.error(`Erro ao gerar conteúdo para ${store.name}:`, err.message ?? err);
    }

    await sleep(REQUEST_INTERVAL_MS);
  }

  console.log(`Pronto! ${done} loja(s) atualizadas, ${failed} falha(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
