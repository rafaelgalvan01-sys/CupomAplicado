// Mapeamento de palavras-chave → categoria.
// A regra vencedora é a que tiver a palavra-chave mais específica (mais
// longa) entre TODAS que baterem no texto — não a primeira do array (ver
// matchCategory abaixo). A ordem aqui não afeta o resultado, mas mantemos
// agrupado por categoria pra ficar legível.
const CATEGORY_RULES = [
  {
    keywords: ["automotivo", "pneu", "auto peça", "autopeça", "carro", "moto", "automóvel"],
    slug: "automotivo",
    name: "Automotivo",
  },
  {
    keywords: ["bebida", "vinho", "cerveja", "bebida alcoólica", "refrigerante", "vinícola", "destilado"],
    slug: "bebidas",
    name: "Bebidas",
  },
  {
    keywords: ["beleza", "cosmético", "maquiagem", "perfume", "cabelo", "skincare", "estética", "cosmetics", "beleza"],
    slug: "beleza",
    name: "Beleza e Cosméticos",
  },
  {
    keywords: ["brinquedo", "hobby", "jogo", "boneca", "lego", "brincar", "infantil", "criança"],
    slug: "brinquedos",
    name: "Brinquedos e Hobbies",
  },
  {
    keywords: ["casa", "decoração", "móvel", "cadeira", "mesa", "sofá", "cama", "cozinha", "banheiro",
               "construção", "reforma", "ferramenta", "decora", "iluminação", "tapete", "cortina",
               "organização", "utilidade doméstica", "brinox", "spicy", "balaroti", "coza", "homedock",
               "gazin", "carraro"],
    slug: "casa-e-decoracao",
    name: "Casa e Decoração",
  },
  {
    keywords: ["eletrodoméstico", "eletrodomestico", "geladeira", "fogão", "lavadora", "micro-ondas",
               "refrigerador", "lavar", "secar", "eletroportátil", "arno", "electrolux", "brastemp",
               "consul", "cozinha equipamento"],
    slug: "eletrodomesticos",
    name: "Eletrodomésticos",
  },
  {
    keywords: ["eletrônico", "informática", "tecnologia", "computador", "notebook", "smartphone",
               "celular", "games", "gamer", "kabum", "hardware", "software", "periférico", "monitor",
               "tv", "áudio", "fone", "tablet", "apple", "samsung", "xiaomi", "dell", "hp", "lenovo",
               "intel", "amd", "nvidia", "placa de vídeo", "processador", "ssd", "hd externo"],
    slug: "eletronicos",
    name: "Eletrônicos e Tecnologia",
  },
  {
    keywords: ["esporte", "fitness", "academia", "suplemento", "atleta", "esportivo", "treino",
               "musculação", "corrida", "ciclismo", "futebol", "centauro", "nike", "adidas", "under armour",
               "casa do fitness", "decathlon"],
    slug: "esportes",
    name: "Esportes e Fitness",
  },
  {
    keywords: ["moda", "roupa", "calçado", "acessório", "jeans", "vestuário", "camisa", "camisaria",
               "tênis", "sapato", "bolsa", "cintura", "feminino", "masculino", "plus size",
               "c&a", "ce&a", "colombo", "malwee", "zinco", "skeptic", "iodice", "morena rosa",
               "maria valentina", "hering", "renner", "riachuelo", "marisa", "zara", "dafiti"],
    slug: "moda",
    name: "Moda",
  },
  {
    keywords: ["viagem", "hotel", "passagem", "turismo", "reserva", "hospedagem", "voo",
               "booking", "decolar", "cvc", "hoteis", "airbnb"],
    slug: "viagem",
    name: "Viagem",
  },
];

// Tenta inferir a categoria de uma loja com base no nome + descrição.
// Retorna { slug, name } ou null se não encontrar match.
//
// Usa a palavra-chave mais longa entre todas que baterem, não a primeira
// regra da lista — testado com "Casa do Fitness": a palavra "casa" (regra de
// Casa e Decoração) bate primeiro, mas "casa do fitness" (regra de Esportes)
// é mais específica e deve vencer. Corrigido jul/2026 depois de confirmar que
// a versão "primeira que bater" categorizava essa loja errado.
export function matchCategory(storeName, description = "") {
  const text = `${storeName} ${description}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let best = null;
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      const normalizedKw = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (text.includes(normalizedKw) && (!best || normalizedKw.length > best.keywordLength)) {
        best = { slug: rule.slug, name: rule.name, keywordLength: normalizedKw.length };
      }
    }
  }
  return best ? { slug: best.slug, name: best.name } : null;
}

// Garante que a categoria existe no banco e retorna o ID.
// Cria automaticamente se não existir.
export async function ensureCategory(supabase, slug, name) {
  // Tenta buscar existente
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return existing.id;

  // Cria nova
  const { data: created, error } = await supabase
    .from("categories")
    .upsert({ name, slug }, { onConflict: "slug" })
    .select("id")
    .single();

  if (error) {
    console.error(`Erro ao criar categoria ${slug}:`, error.message);
    return null;
  }
  console.log(`  → Categoria "${name}" criada automaticamente`);
  return created.id;
}
