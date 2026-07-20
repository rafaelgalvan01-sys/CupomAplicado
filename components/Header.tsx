"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, Store, BookOpen, Tags, Lightbulb, Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetHeader,
} from "@/components/ui/sheet";
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

        {/* Logo + navegação ficam juntas à esquerda (identidade e pra onde
            ir são a mesma "unidade"); a busca é uma ferramenta à parte,
            ancorada à direita via ml-auto. Antes a busca ficava centralizada
            no vão entre logo e nav — como a nav é bem mais larga que a logo,
            esse vão não coincidia com o centro real da tela, e a busca
            aparecia visivelmente deslocada. Nav e busca também usam o mesmo
            breakpoint (md) agora — antes a busca aparecia sozinha (sm) numa
            faixa de largura em que a nav (md) e o menu mobile (sm:hidden)
            ficavam os dois escondidos ao mesmo tempo. */}
        <nav className="hidden md:flex items-center gap-0.5 shrink-0" aria-label="Navegação principal">
          <Button variant="ghost" size="sm" render={<Link href="/lojas" />}>
            <Store className="size-4" />
            Lojas
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/categorias" />}>
            <Tags className="size-4" />
            Categorias
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/como-usar-cupom-de-desconto" />}>
            <BookOpen className="size-4" />
            Como usar
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/guias" />}>
            <Lightbulb className="size-4" />
            Guias
          </Button>
        </nav>

        <form action="/" method="get" className="group relative ml-auto hidden w-full max-w-56 md:block">
          <label htmlFor="header-search" className="sr-only">
            Buscar cupons ou lojas
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-brand-text opacity-70 transition-opacity group-focus-within:opacity-100"
          />
          <Input
            id="header-search"
            type="search"
            name="q"
            placeholder="Buscar cupom ou loja"
            className="h-10 rounded-full border-card-border bg-card pl-9 transition-colors hover:border-brand/45"
          />
        </form>

        <div className={cn("flex items-center md:hidden", mobileSearchOpen ? "flex-1" : "ml-auto")}>
          {mobileSearchOpen ? (
            <form action="/" method="get" className="group relative flex w-full items-center gap-1">
              <label htmlFor="header-search-mobile" className="sr-only">
                Buscar cupons ou lojas
              </label>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-brand-text opacity-70 transition-opacity group-focus-within:opacity-100"
              />
              <Input
                id="header-search-mobile"
                type="search"
                name="q"
                placeholder="Buscar cupom ou loja"
                autoFocus
                className="h-10 rounded-full border-card-border bg-card pl-9"
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
                <Search aria-hidden="true" className="size-4" />
              </Button>
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Abrir menu" />}>
                  <Menu className="size-4" />
                </SheetTrigger>
                <SheetContent side="right" className="w-64 md:hidden">
                  <SheetHeader className="border-b border-border px-5 py-4">
                    <Link href="/" onClick={closeMenu}>
                      <Logo />
                    </Link>
                  </SheetHeader>
                  <nav className="flex flex-col gap-0.5 p-3">
                    <SheetClose render={<Link href="/lojas" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors" />}>
                      <Store className="size-5 text-muted-foreground shrink-0" />
                      Lojas
                    </SheetClose>
                    <SheetClose render={<Link href="/categorias" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors" />}>
                      <Tags className="size-5 text-muted-foreground shrink-0" />
                      Categorias
                    </SheetClose>
                    <SheetClose render={<Link href="/como-usar-cupom-de-desconto" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors" />}>
                      <BookOpen className="size-5 text-muted-foreground shrink-0" />
                      Como usar cupom de desconto
                    </SheetClose>
                    <SheetClose render={<Link href="/guias" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors" />}>
                      <Lightbulb className="size-5 text-muted-foreground shrink-0" />
                      Guias
                    </SheetClose>
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
