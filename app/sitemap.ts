import type { MetadataRoute } from "next";
import { getStores, getCategories } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stores, categories] = await Promise.all([getStores(), getCategories()]);

  const storeUrls: MetadataRoute.Sitemap = stores.map((store) => ({
    url: `${SITE_URL}/loja/${store.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/categoria/${category.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    ...categoryUrls,
    ...storeUrls,
  ];
}
