import Link from "next/link";
import type { Category } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { categoryIconFor } from "@/lib/category-icons";

export function CategoryCard({
  category,
  storeCount,
}: {
  category: Category;
  storeCount: number;
}) {
  const icon = categoryIconFor(category.slug);

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
