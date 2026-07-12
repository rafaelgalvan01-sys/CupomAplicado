import Link from "next/link";
import Image from "next/image";
import type { Store } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/loja/${store.slug}`} className="block">
      <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand/40">
        <CardHeader>
          {store.logo_url && (
            <div className="relative mb-2 h-10 w-28 overflow-hidden rounded-md">
              <Image
                src={store.logo_url}
                alt={store.name}
                fill
                sizes="112px"
                className="object-contain object-left"
              />
            </div>
          )}
          <CardTitle className="text-foreground group-hover:text-brand-text">{store.name}</CardTitle>
          {store.description && <CardDescription>{store.description}</CardDescription>}
        </CardHeader>
      </Card>
    </Link>
  );
}
