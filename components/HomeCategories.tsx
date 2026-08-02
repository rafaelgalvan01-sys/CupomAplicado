"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@/lib/types";
import { categoryIconFor } from "@/lib/category-icons";
import { useHorizontalScroll } from "@/lib/use-horizontal-scroll";
import { Button } from "@/components/ui/button";

type Props = {
  categories: Pick<Category, "id" | "name" | "slug">[];
};

// Carrossel de categorias na home, mesmo padrão do StoreCarousel (setas +
// rolagem horizontal). Cada chip aponta direto pra /categoria/[slug] — o
// objetivo é SEO: dar link direto da home pra essas páginas, que antes só
// eram alcançáveis via /categorias.
export function HomeCategories({ categories }: Props) {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } =
    useHorizontalScroll<HTMLUListElement>(categories);

  if (categories.length === 0) return null;

  return (
    <section data-slot="home-categories" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Explorar por categoria
        </h2>
        <div className="flex items-center gap-3">
          <Link href="/categorias" className="text-xs font-medium text-brand-text hover:underline">
            Ver todas
          </Link>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scroll(-1, 240)}
              aria-label="Anterior"
              disabled={!canScrollLeft}
              className="size-9 rounded-full"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scroll(1, 240)}
              aria-label="Próximo"
              disabled={!canScrollRight}
              className="size-9 rounded-full"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <ul
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto scroll-smooth px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => (
          <li key={category.id} className="shrink-0">
            <Link
              href={`/categoria/${category.slug}`}
              className="flex min-h-11 items-center gap-2 rounded-full border border-card-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand/45 hover:bg-brand/10 hover:text-brand-text focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
