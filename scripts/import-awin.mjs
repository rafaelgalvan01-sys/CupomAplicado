import { createClient } from "@supabase/supabase-js";
import { matchCategory, ensureCategory } from "./category-utils.mjs";

const AWIN_API_TOKEN = process.env.AWIN_API_TOKEN;
const AWIN_PUBLISHER_ID = process.env.AWIN_PUBLISHER_ID;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!AWIN_API_TOKEN || !AWIN_PUBLISHER_ID || !SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error(
    "Faltam variáveis de ambiente: AWIN_API_TOKEN, AWIN_PUBLISHER_ID, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
const AWIN_BASE = "https://api.awin.com";

async function awinFetch(path, options = {}) {
  const res = await fetch(`${AWIN_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${AWIN_API_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Awin API ${path} -> ${res.status} ${body.slice(0, 300)}`);
  }
  return res.json();
}

// A API devolve o payload dentro de um objeto (ex: { promotions: [...] }) em
// algumas versões, e como array puro em outras. Normaliza os dois formatos.
function normalizeList(json) {
  if (Array.isArray(json)) return json;
  return json.promotions ?? json.data ?? json.programmes ?? [];
}

async function fetchJoinedProgrammes() {
  const json = await awinFetch(`/publishers/${AWIN_PUBLISHER_ID}/programmes?relationship=joined`);
  return normalizeList(json);
}

async function fetchVoucherPromotions() {
  const items = [];
  let page = 1;
  while (page <= 50) {
    const json = await awinFetch(`/publisher/${AWIN_PUBLISHER_ID}/promotions`, {
      method: "POST",
      body: JSON.stringify({
        filters: {
          membership: "joined",
          status: "active",
          type: "voucher",
        },
        pagination: { page, pageSize: 200 },
      }),
    });
    const batch = normalizeList(json);
    items.push(...batch);
    if (batch.length === 0) break;
    page += 1;
  }
  return items;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Algumas marcas na Awin também vêm com sufixo " BR" (ex: "Kabum BR") — não
// faz sentido pro negócio já que o site é só Brasil. Só limpa o nome de
// exibição; o slug continua vindo do nome original (ver chamada de slugify
// abaixo) pra não mudar URL de loja já indexada.
function cleanStoreName(name) {
  return name.replace(/\s+BR$/i, "").trim();
}

function parseDiscount(title) {
  const percent = title.match(/(\d+)\s*%/);
  if (percent) return { discount_type: "percentual", discount_value: Number(percent[1]) };

  const fixed = title.match(/R\$\s*(\d+(?:[.,]\d+)?)/i);
  if (fixed) return { discount_type: "fixo", discount_value: Number(fixed[1].replace(",", ".")) };

  if (/frete\s*gr[aá]tis|free\s*shipping/i.test(title)) {
    return { discount_type: "frete_gratis", discount_value: null };
  }

  return { discount_type: "outro", discount_value: null };
}

async function main() {
  console.log("Buscando lojas (programas) já aprovados na Awin...");
  const programmes = await fetchJoinedProgrammes();
  console.log(`${programmes.length} lojas aprovadas encontradas.`);
  const programmeById = new Map(programmes.map((p) => [p.id, p]));

  console.log("Buscando cupons/promoções ativas na Awin...");
  const promotions = await fetchVoucherPromotions();
  console.log(`${promotions.length} promoções encontradas.`);

  const usableAdvertiserIds = new Set(promotions.map((p) => p.advertiser?.id).filter(Boolean));

  const storeIdByAdvertiserId = new Map();

  for (const advertiserId of usableAdvertiserIds) {
    const programme = programmeById.get(advertiserId);
    const fallbackPromo = promotions.find((p) => p.advertiser?.id === advertiserId);
    const name = programme?.name ?? fallbackPromo?.advertiser?.name;
    if (!name) continue;

    const { data, error } = await supabase
      .from("stores")
      .upsert(
        {
          external_id: `awin-${advertiserId}`,
          source: "awin",
          name: cleanStoreName(name),
          slug: slugify(name),
          logo_url: programme?.logoUrl ?? null,
          description: programme?.description ?? null,
          affiliate_base_url: programme?.displayUrl
            ? `https://${programme.displayUrl.replace(/^https?:\/\//, "")}`
            : null,
          active: true,
        },
        { onConflict: "external_id" }
      )
      .select("id, category_id")
      .single();

    if (error) {
      console.error(`Erro ao gravar loja ${name}:`, error.message);
      continue;
    }
    storeIdByAdvertiserId.set(advertiserId, data.id);

    // Só infere/atribui categoria se a loja ainda não tiver uma — nunca
    // sobrescreve uma categoria já definida (manual ou de import anterior).
    if (!data.category_id) {
      const match = matchCategory(name, programme?.description ?? fallbackPromo?.advertiser?.name);
      if (match) {
        const categoryId = await ensureCategory(supabase, match.slug, match.name);
        if (categoryId) {
          await supabase.from("stores").update({ category_id: categoryId }).eq("id", data.id);
        }
      }
    }
  }

  let imported = 0;
  for (const promo of promotions) {
    const storeId = storeIdByAdvertiserId.get(promo.advertiser?.id);
    if (!storeId) continue;

    const code = promo.voucher?.code?.trim();
    if (!code) continue;

    const affiliateUrl = promo.urlTracking ?? promo.url;
    if (!affiliateUrl) continue;

    const { discount_type, discount_value } = parseDiscount(promo.title ?? "");

    const { error } = await supabase.from("coupons").upsert(
      {
        external_id: `awin-${promo.promotionId}`,
        source: "awin",
        store_id: storeId,
        title: promo.title ?? "Oferta especial",
        description: promo.description ?? null,
        code: promo.voucher?.code ?? null,
        discount_type,
        discount_value,
        affiliate_url: affiliateUrl,
        expires_at: promo.endDate ?? null,
        active: true,
        is_highlight: Boolean(promo.voucher?.exclusive),
      },
      { onConflict: "external_id" }
    );

    if (error) {
      console.error(`Erro ao gravar cupom ${promo.title}:`, error.message);
      continue;
    }
    imported += 1;
  }

  console.log(`Pronto! ${imported} cupons importados/atualizados de ${storeIdByAdvertiserId.size} lojas.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
