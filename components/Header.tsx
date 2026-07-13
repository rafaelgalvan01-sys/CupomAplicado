"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const refocusTriggerRef = useRef(false);

  // O botão de gatilho só remonta depois do próximo commit do React, então o
  // focus() precisa esperar esse efeito em vez de rodar direto no onClick.
  useEffect(() => {
    if (!mobileSearchOpen && refocusTriggerRef.current) {
      searchTriggerRef.current?.focus();
      refocusTriggerRef.current = false;
    }
  }, [mobileSearchOpen]);

  function closeMobileSearch() {
    refocusTriggerRef.current = true;
    setMobileSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:py-4">
        {!mobileSearchOpen && (
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
            <Logo />
          </Link>
        )}

        <form action="/" method="get" className="relative ml-auto hidden w-full max-w-sm sm:block">
          <label htmlFor="header-search" className="sr-only">
            Buscar cupons ou lojas
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="header-search"
            type="search"
            name="q"
            placeholder="Buscar cupons, lojas..."
            className="pl-9"
          />
        </form>

        <div className={cn("flex items-center sm:hidden", mobileSearchOpen ? "flex-1" : "ml-auto")}>
          {mobileSearchOpen ? (
            <form action="/" method="get" className="relative flex w-full items-center gap-1">
              <label htmlFor="header-search-mobile" className="sr-only">
                Buscar cupons ou lojas
              </label>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="header-search-mobile"
                type="search"
                name="q"
                placeholder="Buscar cupons, lojas..."
                autoFocus
                className="pl-9"
                onKeyDown={(event) => {
                  if (event.key === "Escape") closeMobileSearch();
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Fechar busca"
                onClick={closeMobileSearch}
              >
                <X className="size-4" />
              </Button>
            </form>
          ) : (
            <Button
              ref={searchTriggerRef}
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Buscar cupons ou lojas"
              aria-expanded={mobileSearchOpen}
              aria-controls="header-search-mobile"
              onClick={() => setMobileSearchOpen(true)}
            >
              <Search className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
