// Emoji por slug de categoria — fonte única compartilhada entre a listagem
// (/categorias, via CategoryCard) e a seção de categorias da home
// (HomeCategories), pra os dois nunca divergirem.
const categoryIcons: Record<string, string> = {
  moda: "👗",
  eletronicos: "💻",
  eletrodomesticos: "🏠",
  "casa-e-decoracao": "🛋️",
  beleza: "💄",
  esportes: "🏋️",
  brinquedos: "🧸",
  bebidas: "🍷",
  automotivo: "🚗",
  viagem: "✈️",
};

const DEFAULT_CATEGORY_ICON = "🛍️";

export function categoryIconFor(slug: string): string {
  return categoryIcons[slug] ?? DEFAULT_CATEGORY_ICON;
}
