import { createClient } from "@supabase/supabase-js";

const LOMADEE_API_KEY = process.env.LOMADEE_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!LOMADEE_API_KEY || !SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error(
    "Faltam variáveis de ambiente: LOMADEE_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
const LOMADEE_BASE = "https://api.lomadee.com.br";

async function lomadeeFetch(path) {
  const res = await fetch(`${LOMADEE_BASE}${path}`, {
    headers: { "x-api-key": LOMADEE_API_KEY },
  });
  if (!res.ok) throw new Error(`Lomadee API ${path} -> ${res.status}`);
  return res.json();
}

// Retorna o que conseguiu buscar mesmo se uma página no meio do caminho
// falhar (a API da Lomadee já teve instabilidade real nisso — erro 500 em
// /affiliate/campaigns a partir da página 2). Antes, uma falha em qualquer
// página descartava TUDO, inclusive páginas anteriores que já tinham vindo
// certinho. `partial: true` sinaliza que a paginação não terminou — o
// chamador decide o que fazer com isso (aqui, seguir importando o parcial
// mas ainda assim reportar falha no final, pra não perder o alerta por
// e-mail do GitHub Actions quando a Lomadee está instável).
async function fetchAllPages(path) {
  const items = [];
  let page = 1;
  while (page <= 50) {
    const separator = path.includes("?") ? "&" : "?";
    let json;
    try {
      json = await lomadeeFetch(`${path}${separator}page=${page}`);
    } catch (err) {
      console.error(
        `Falha ao buscar página ${page} de ${path}: ${err.message}. Seguindo com os ${items.length} item(ns) já obtidos.`
      );
      return { items, partial: true };
    }
    const data = json.data ?? [];
    items.push(...data);
    if (data.length === 0) break;
    page += 1;
  }
  return { items, partial: false };
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseDiscount(name) {
  const percent = name.match(/(\d+)\s*%/);
  if (percent) return { discount_type: "percentual", discount_value: Number(percent[1]) };

  const fixed = name.match(/R\$\s*(\d+(?:[.,]\d+)?)/i);
  if (fixed) return { discount_type: "fixo", discount_value: Number(fixed[1].replace(",", ".")) };

  if (/frete\s*gr[aá]tis/i.test(name)) return { discount_type: "frete_gratis", discount_value: null };

  return { discount_type: "outro", discount_value: null };
}

async function main() {
  console.log("Buscando marcas na Lomadee...");
  const { items: brands, partial: brandsPartial } = await fetchAllPages("/affiliate/brands");
  console.log(`${brands.length} marcas encontradas.`);

  console.log("Buscando cupons/campanhas na Lomadee...");
  const { items: campaigns, partial: campaignsPartial } = await fetchAllPages("/affiliate/campaigns");
  console.log(`${campaigns.length} campanhas encontradas.`);

  const coupons = campaigns.filter(
    (c) =>
      (c.type === "GenericCoupon" || c.type === "PersonalCoupon") &&
      c.status === "onTime" &&
      c.code &&
      c.channels?.some((ch) => ch.shortUrls?.length)
  );
  console.log(`${coupons.length} cupons com código ativo e link pronto.`);

  const storeIdByExternalId = new Map();

  for (const brand of brands) {
    if (!coupons.some((c) => c.organizationId === brand.id)) continue;

    const { data, error } = await supabase
      .from("stores")
      .upsert(
        {
          external_id: brand.id,
          source: "lomadee",
          name: brand.name,
          slug: slugify(brand.name),
          logo_url: brand.logo ?? null,
          description: brand.segment ? `Cupons de ${brand.segment}` : null,
          affiliate_base_url: brand.site ? `https://${brand.site.replace(/^https?:\/\//, "")}` : null,
          active: true,
        },
        { onConflict: "external_id" }
      )
      .select("id")
      .single();

    if (error) {
      console.error(`Erro ao gravar loja ${brand.name}:`, error.message);
      continue;
    }
    storeIdByExternalId.set(brand.id, data.id);
  }

  let imported = 0;
  for (const coupon of coupons) {
    const storeId = storeIdByExternalId.get(coupon.organizationId);
    if (!storeId) continue;

    const shortUrl = coupon.channels.find((ch) => ch.shortUrls?.length)?.shortUrls[0];
    const { discount_type, discount_value } = parseDiscount(coupon.name);

    const { error } = await supabase.from("coupons").upsert(
      {
        external_id: coupon.id,
        source: "lomadee",
        store_id: storeId,
        title: coupon.name,
        code: coupon.code,
        discount_type,
        discount_value,
        affiliate_url: shortUrl,
        expires_at: coupon.period?.endAt ?? null,
        active: true,
        is_highlight: Boolean(coupon.isHighlight),
      },
      { onConflict: "external_id" }
    );

    if (error) {
      console.error(`Erro ao gravar cupom ${coupon.name}:`, error.message);
      continue;
    }
    imported += 1;
  }

  console.log(`Pronto! ${imported} cupons importados/atualizados.`);

  // Mesmo importando o que deu, uma paginação incompleta significa que a
  // Lomadee está instável — o job continua marcado como falho (ver
  // AGENTS.md) pra não perder o alerta por e-mail do GitHub Actions.
  if (brandsPartial || campaignsPartial) {
    throw new Error(
      "Importação parcial: uma ou mais páginas da API da Lomadee falharam (ver logs acima). Os dados já obtidos foram importados mesmo assim."
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
