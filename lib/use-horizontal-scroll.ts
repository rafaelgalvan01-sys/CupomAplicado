"use client";

import { useEffect, useRef, useState } from "react";

// Lógica de rolagem horizontal com setas, compartilhada entre os carrosséis da
// home (StoreCarousel e HomeCategories). Devolve a ref do container rolável, se
// ainda dá pra rolar pra cada lado (pra habilitar/desabilitar as setas) e a
// função de rolar. `dep` é a lista de itens: quando ela muda, o estado das
// setas é recalculado.
export function useHorizontalScroll<T extends HTMLElement>(dep: unknown) {
  const scrollRef = useRef<T>(null);
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
  }, [dep]);

  function scroll(direction: 1 | -1, amount: number) {
    scrollRef.current?.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return { scrollRef, canScrollLeft, canScrollRight, scroll };
}
