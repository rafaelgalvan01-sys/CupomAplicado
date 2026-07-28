import Link from "next/link";
import type { Category } from "@/lib/types";
import { categoryIconFor } from "@/lib/category-icons";

type Props = {
  categories: Pick<Category, "id" | "name" | "slug">[];
};

// Faixa de categorias na home. Chips de navegação no mesmo padrão das "Lojas
// populares" do not-found (Link estilizado em pill), com o emoji da categoria
// e hover na cor da marca. O objetivo é SEO: dar um link direto da home pra
// cada /categoria/[slug], que antes só era alcançável via /categorias.
export function HomeCategories({ categories }: Props) {
  if (categories.length === 0) return null;

  return (
    <section data-slot="home-categories" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Explorar por categoria
        </h2>
        <Link href="/categorias" className="text-xs font-medium text-brand-text hover:underline">
          Ver todas
        </Link>
      </div>

      <ul className="flex flex-wrap gap-2.5">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/categoria/${category.slug}`}
              className="flex items-center gap-2 rounded-full border border-card-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand/45 hover:bg-brand/10 hover:text-brand-text focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="text-base leading-none" aria-hidden>
                {categoryIconFor(category.slug)}
              </span>
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
