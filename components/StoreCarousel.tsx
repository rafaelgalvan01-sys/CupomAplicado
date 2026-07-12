"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Store } from "@/lib/types";
import { avatarColorFor } from "@/lib/badge-colors";
import { cn } from "@/lib/utils";

export function StoreCarousel({ stores }: { stores: Store[] }) {
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
    <div data-slot="store-carousel" className="relative">
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Anterior"
        disabled={!canScrollLeft}
        className="absolute top-1/2 left-0 z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-card-border bg-card text-foreground shadow-md outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth px-1 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {stores.map((store, index) => (
          <Link
            key={store.id}
            href={`/loja/${store.slug}`}
            className="flex w-48 shrink-0 flex-col items-center gap-3 rounded-2xl border border-card-border bg-card px-4 py-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            {store.logo_url ? (
              <span className="relative size-16 overflow-hidden rounded-xl bg-white">
                <Image
                  src={store.logo_url}
                  alt={store.name}
                  fill
                  sizes="64px"
                  priority={index < 4}
                  className="object-contain p-2"
                />
              </span>
            ) : (
              <span
                className={cn(
                  "flex size-16 items-center justify-center rounded-xl bg-white text-2xl font-bold",
                  avatarColorFor(store.name)
                )}
              >
                {store.name.charAt(0)}
              </span>
            )}
            <span className="line-clamp-1 text-sm font-medium text-foreground">{store.name}</span>
            <span className="rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">Ver cupons</span>
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Próximo"
        disabled={!canScrollRight}
        className="absolute top-1/2 right-0 z-10 flex size-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-card-border bg-card text-foreground shadow-md outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
