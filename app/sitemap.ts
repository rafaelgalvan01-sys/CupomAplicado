import type { MetadataRoute } from "next";
import { getSitemapStores, getCategories } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // getSitemapStores já exclui lojas sem cupom ativo (essas ficam noindex
  // na própria página — não faz sentido oferecê-las pro Google aqui).
  const [stores, categories] = await Promise.all([getSitemapStores(), getCategories()]);

  const storeUrls: MetadataRoute.Sitemap = stores.map((store) => ({
    url: `${SITE_URL}/loja/${store.slug}`,
    lastModified: store.lastModified,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/categoria/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
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
    ...categoryUrls,
    ...storeUrls,
  ];
}
