"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, Store, BookOpen, Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  // Fecha o menu ao pressionar Escape
  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Trava o scroll do body quando o menu mobile está aberto
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  function closeMobileSearch() {
    refocusTriggerRef.current = true;
    setMobileSearchOpen(false);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:py-4">
        {!mobileSearchOpen && (
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
            <Logo />
          </Link>
        )}

        <div className="hidden sm:flex flex-1 justify-center">
          <form action="/" method="get" className="relative max-w-sm w-full">
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
        </div>

        <nav className="hidden md:flex items-center gap-0.5 shrink-0" aria-label="Navegação principal">
          <Button variant="ghost" size="sm" render={<Link href="/lojas" />}>
            <Store className="size-4" />
            Lojas parceiras
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/como-usar-cupom-de-desconto" />}>
            <BookOpen className="size-4" />
            Como usar
          </Button>
        </nav>

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
            <>
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Abrir menu"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Gaveta de navegação mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={closeMenu} aria-hidden="true" />
          <div className="absolute right-0 top-0 bottom-0 flex w-64 max-w-[80vw] flex-col bg-background shadow-xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Link href="/" className="shrink-0" onClick={closeMenu}>
                <Logo />
              </Link>
              <Button type="button" variant="ghost" size="icon" aria-label="Fechar menu" onClick={closeMenu}>
                <X className="size-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-0.5 p-3">
              <Link href="/lojas" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <Store className="size-5 text-muted-foreground shrink-0" />
                Lojas parceiras
              </Link>
              <Link href="/como-usar-cupom-de-desconto" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <BookOpen className="size-5 text-muted-foreground shrink-0" />
                Como usar cupom de desconto
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
