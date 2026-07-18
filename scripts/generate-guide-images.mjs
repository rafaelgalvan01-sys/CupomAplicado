import { createClient } from "@supabase/supabase-js";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!PEXELS_API_KEY || !SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error(
    "Faltam variáveis de ambiente: PEXELS_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY"
  );
  process.exit(1);
}

// Passe --force pra buscar imagem de novo pros guias que já têm uma.
const FORCE = process.argv.includes("--force");
const REQUEST_INTERVAL_MS = 500;

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchPexelsPhoto(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
  if (!res.ok) {
    throw new Error(`Pexels respondeu ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const photo = data.photos?.[0];
  if (!photo) return null;
  return {
    image_url: photo.src.large,
    photographer_name: photo.photographer,
    photographer_url: photo.photographer_url,
  };
}

async function main() {
  let query = supabase.from("guides").select("id, slug, title, image_query, image_url");
  if (!FORCE) {
    query = query.is("image_url", null);
  }

  const { data: guides, error } = await query;
  if (error) throw error;

  if (!guides || guides.length === 0) {
    console.log(FORCE ? "Nenhum guia encontrado." : "Todos os guias já têm imagem. Use --force pra buscar de novo.");
    return;
  }

  console.log(`Buscando imagem pra ${guides.length} guia(s)...`);

  let done = 0;
  let failed = 0;

  for (const guide of guides) {
    try {
      if (!guide.image_query) {
        throw new Error("guia sem image_query definido (ver migração 0011)");
      }

      const photo = await searchPexelsPhoto(guide.image_query);
      if (!photo) {
        throw new Error(`nenhuma foto encontrada pra "${guide.image_query}"`);
      }

      const { error: updateError } = await supabase.from("guides").update(photo).eq("id", guide.id);
      if (updateError) throw updateError;

      done += 1;
      console.log(`[${done}/${guides.length}] OK — ${guide.title} (foto de ${photo.photographer_name})`);
    } catch (err) {
      failed += 1;
      console.error(`Erro ao buscar imagem para ${guide.title}:`, err.message ?? err);
    }

    await sleep(REQUEST_INTERVAL_MS);
  }

  console.log(`Pronto! ${done} guia(s) atualizados, ${failed} falha(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
