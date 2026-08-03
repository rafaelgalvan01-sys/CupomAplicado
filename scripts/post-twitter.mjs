import { createClient } from "@supabase/supabase-js";
import { TwitterApi } from "twitter-api-v2";

const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

// URL do site (pra montar o link do post). Cai no domínio de produção se não
// vier de env, igual ao lib/site.ts.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cupomaplicado.com.br").replace(/\/$/, "");
// Quantos cupons postar por execução. 1 é o padrão seguro pra caber com folga
// na cota gratuita do X (~500 posts/mês). Ajuste por env se subir de plano.
const POSTS_PER_RUN = Math.max(1, Number(process.env.POSTS_PER_RUN) || 1);

if (
  !TWITTER_API_KEY ||
  !TWITTER_API_SECRET ||
  !TWITTER_ACCESS_TOKEN ||
  !TWITTER_ACCESS_SECRET ||
  !SUPABASE_URL ||
  !SUPABASE_SECRET_KEY
) {
  console.error(
    "Faltam variáveis de ambiente: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
const twitter = new TwitterApi({
  appKey: TWITTER_API_KEY,
  appSecret: TWITTER_API_SECRET,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_SECRET,
});

// Mesmo formato de desconto usado no card do site (components/CouponCard.tsx),
// pra o texto do post falar a mesma língua do que o usuário vê no site.
function formatDiscount(coupon) {
  if (coupon.discount_type === "percentual") return `${coupon.discount_value}% OFF`;
  if (coupon.discount_type === "fixo" && coupon.discount_value != null) {
    return `R$${Number(coupon.discount_value).toFixed(2).replace(".", ",")} OFF`;
  }
  if (coupon.discount_type === "frete_gratis") return "Frete grátis";
  return "Oferta especial";
}

// Aberturas variadas: o X rejeita dois posts com texto idêntico. Rotacionar a
// abertura garante que um cupom reaproveitado (modo recycle) nunca saia com o
// texto exatamente igual ao da vez anterior.
const OPENERS = [
  "Aproveite",
  "Corre que tem",
  "Desconto novo:",
  "Economize com",
  "Oferta imperdível:",
  "Novo cupom:",
];

function storeHashtag(name) {
  const clean = name.replace(/[^\p{L}\p{N}]/gu, "");
  return clean ? `#${clean}` : "";
}

function composeTweet(coupon, variant) {
  const store = coupon.stores;
  const opener = OPENERS[variant % OPENERS.length];
  const discount = formatDiscount(coupon);
  const url = `${SITE_URL}/loja/${store.slug}`;
  const tags = ["#cupom", "#desconto", storeHashtag(store.name)].filter(Boolean).join(" ");

  // Blocos em ordem de prioridade. Se estourar 280, a gente derruba o código
  // (é o único bloco realmente opcional; o link leva pro cupom no site mesmo).
  const withCode = [
    `${opener} ${discount} na ${store.name}!`,
    "",
    `Cupom: ${coupon.code}`,
    url,
    "",
    tags,
  ].join("\n");

  if (withCode.length <= 280) return withCode;

  return [`${opener} ${discount} na ${store.name}!`, "", url, "", tags].join("\n");
}

// O X conta URLs como 23 caracteres fixos (t.co), então textos com link podem
// ter "comprimento real" maior que 280 e ainda assim serem aceitos. Detecta o
// erro de duplicado pra pular sem derrubar o job inteiro.
function isDuplicateError(err) {
  const msg = `${err?.data?.detail ?? ""} ${err?.message ?? ""}`.toLowerCase();
  return msg.includes("duplicate");
}

async function fetchCandidates(recycle) {
  // stores!inner + stores.active: cupom de loja inativa não deve ir pro ar.
  // Filtro de não-expirado igual ao do site (expires_at nulo OU no futuro).
  let query = supabase
    .from("coupons")
    .select("id, title, code, discount_type, discount_value, expires_at, is_highlight, stores!inner(name, slug, active)")
    .eq("active", true)
    .eq("stores.active", true)
    .not("code", "is", null)
    .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`);

  if (recycle) {
    // Nenhum cupom novo pra postar: reaproveita o que foi postado há mais tempo,
    // pra conta não ficar parada. Ordena pelo tweeted_at mais antigo.
    query = query.not("tweeted_at", "is", null).order("tweeted_at", { ascending: true });
  } else {
    // Prioriza destaques e, dentro disso, os mais recentes ainda não postados.
    query = query
      .is("tweeted_at", null)
      .order("is_highlight", { ascending: false })
      .order("created_at", { ascending: false });
  }

  // Pega alguns a mais que o necessário pra ter folga se algum for pulado
  // (código vazio, duplicado, etc.).
  const { data, error } = await query.limit(POSTS_PER_RUN * 4);
  if (error) throw error;
  return (data ?? []).filter((c) => c.code && c.code.trim());
}

async function main() {
  let candidates = await fetchCandidates(false);
  let recycled = false;
  if (candidates.length === 0) {
    console.log("Nenhum cupom novo pra postar — reaproveitando os mais antigos.");
    candidates = await fetchCandidates(true);
    recycled = true;
  }

  if (candidates.length === 0) {
    console.log("Nenhum cupom elegível pra postar. Nada a fazer.");
    return;
  }

  let posted = 0;
  let firstError = null;
  // A variante do texto muda por dia + por post, pra reaproveitamentos nunca
  // saírem idênticos ao histórico recente.
  const dayOfYear = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000);

  for (const coupon of candidates) {
    if (posted >= POSTS_PER_RUN) break;
    const text = composeTweet(coupon, dayOfYear + posted);

    try {
      await twitter.v2.tweet(text);
    } catch (err) {
      if (isDuplicateError(err)) {
        // Já saiu texto igual: marca como postado mesmo assim pra sair da fila
        // e não travar aqui na próxima execução.
        console.warn(`Cupom ${coupon.id} pulado (texto duplicado no X).`);
        await supabase.from("coupons").update({ tweeted_at: new Date().toISOString() }).eq("id", coupon.id);
        continue;
      }
      // Erro real (auth, cota, rede): guarda pra reportar falha no fim, mas
      // segue tentando os próximos — igual ao padrão das importações.
      console.error(`Erro ao postar cupom ${coupon.id}:`, err?.message ?? err);
      firstError = firstError ?? err;
      continue;
    }

    const { error: updateError } = await supabase
      .from("coupons")
      .update({ tweeted_at: new Date().toISOString() })
      .eq("id", coupon.id);
    if (updateError) {
      // Postou mas não conseguiu marcar: reporta pra não arriscar repostar o
      // mesmo cupom sem parar.
      console.error(`Postou o cupom ${coupon.id} mas falhou ao marcar tweeted_at:`, updateError.message);
      firstError = firstError ?? new Error(updateError.message);
    }

    posted += 1;
    console.log(`Postado (${recycled ? "reaproveitado" : "novo"}): ${coupon.stores.name} — ${coupon.code}`);
  }

  console.log(`Pronto! ${posted} post(s) publicado(s) no X.`);

  // Só lança o erro no final, depois de já ter postado o que deu — assim o
  // alerta por e-mail do GitHub Actions dispara sem perder o trabalho feito.
  if (firstError) throw firstError;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
