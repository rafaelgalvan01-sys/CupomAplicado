import Link from "next/link";
import type { Category } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

export function CategoryCard({
  category,
  storeCount,
}: {
  category: Category;
  storeCount: number;
}) {
  const icon = categoryIcons[category.slug] ?? "🛍️";

  return (
    <Link href={`/categoria/${category.slug}`} className="block">
      <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand/40">
        <CardHeader>
          <div className="mb-2 text-3xl" aria-hidden>
            {icon}
          </div>
          <CardTitle className="text-foreground group-hover:text-brand-text">
            {category.name}
          </CardTitle>
          <CardDescription>
            {storeCount} {storeCount === 1 ? "loja" : "lojas"}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
