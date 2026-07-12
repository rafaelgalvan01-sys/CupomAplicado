import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /ir/ é só um redirecionamento de clique (sem conteúdo próprio) e
      // /api/ são rotas de dados — nenhum dos dois tem valor de indexação.
      disallow: ["/ir/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
