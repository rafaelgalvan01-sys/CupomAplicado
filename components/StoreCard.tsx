import Link from "next/link";
import Image from "next/image";
import type { Store } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { truncateText } from "@/lib/utils";

// Só usa seo_description (gerada por IA) — a description crua vinda da
// importação (ex: "Cupons de retail") não é conteúdo pra exibir pro usuário.
export function StoreCard({ store, priority = false }: { store: Store; priority?: boolean }) {
  const description = store.seo_description?.trim()
    ? truncateText(store.seo_description.trim(), 110)
    : null;

  return (
    <Link href={`/loja/${store.slug}`} className="block">
      <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand/40">
        <CardHeader>
          {store.logo_url && (
            <div className="relative mb-2 h-10 w-28 overflow-hidden rounded-md bg-white">
              <Image
                src={store.logo_url}
                alt={store.name}
                fill
                sizes="112px"
                priority={priority}
                className="object-contain p-1"
              />
            </div>
          )}
          <CardTitle className="text-foreground group-hover:text-brand-text">{store.name}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      </Card>
    </Link>
  );
}
