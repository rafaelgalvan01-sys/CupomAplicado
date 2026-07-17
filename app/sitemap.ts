import type { MetadataRoute } from "next";
import { getSitemapCategories, getSitemapStores, getGuides } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // getSitemapStores já exclui lojas sem cupom ativo (essas ficam noindex
  // na própria página — não faz sentido oferecê-las pro Google aqui).
  const stores = await getSitemapStores();

  const storeUrls: MetadataRoute.Sitemap = stores.map((store) => ({
    url: `${SITE_URL}/loja/${store.slug}`,
    lastModified: store.lastModified,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // getSitemapCategories já exclui categorias sem nenhuma loja ativa (essas
  // ficam noindex na própria página — ver app/categoria/[slug]/page.tsx).
  const categories = await getSitemapCategories();
  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/categoria/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // getGuides já só retorna guias com conteúdo gerado (intro preenchido) —
  // os pendentes ficam de fora do sitemap até o texto existir de verdade.
  const guides = await getGuides();
  const guideUrls: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${SITE_URL}/guias/${guide.slug}`,
    lastModified: new Date(guide.updated_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/como-usar-cupom-de-desconto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/lojas`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/categorias`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guias`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...categoryUrls,
    ...storeUrls,
    ...guideUrls,
  ];
}
