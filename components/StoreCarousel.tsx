"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Store } from "@/lib/types";
import { avatarColorFor } from "@/lib/badge-colors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  stores: Store[];
  title: string;
  viewAllHref: string;
};

export function StoreCarousel({ stores, title, viewAllHref }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [stores]);

  if (stores.length === 0) return null;

  function scroll(direction: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  return (
    <section data-slot="store-carousel" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">{title}</h2>
        <div className="flex items-center gap-3">
          <Link href={viewAllHref} className="text-xs font-medium text-brand-text hover:underline">
            Ver todas
          </Link>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scroll(-1)}
              aria-label="Anterior"
              disabled={!canScrollLeft}
              className="size-7 rounded-full"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scroll(1)}
              aria-label="Próximo"
              disabled={!canScrollRight}
              className="size-7 rounded-full"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth px-1 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {stores.map((store, index) => (
          <Link
            key={store.id}
            href={`/loja/${store.slug}`}
            className="group w-48 shrink-0 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Card size="sm" className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <CardContent className="flex items-center gap-3">
                {store.logo_url ? (
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-white">
                    <Image
                      src={store.logo_url}
                      alt={store.name}
                      fill
                      sizes="40px"
                      priority={index < 4}
                      className="object-contain p-1"
                    />
                  </span>
                ) : (
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg text-base font-bold",
                      avatarColorFor(store.name)
                    )}
                  >
                    {store.name.charAt(0)}
                  </span>
                )}
                <CardTitle className="line-clamp-1 text-sm">
                  <span className="group-hover/card:hidden group-focus-visible:hidden">{store.name}</span>
                  <span className="hidden text-brand-text group-hover/card:inline group-focus-visible:inline">
                    Ver cupons
                  </span>
                </CardTitle>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
