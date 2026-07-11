import Link from "next/link";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { Logo } from "@/components/Logo";
import { HeaderNav } from "@/components/HeaderNav";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-4">
        <Link href="/" className="shrink-0 justify-self-start transition-opacity hover:opacity-80">
          <Logo />
        </Link>

        <form
          action="/"
          method="get"
          className="relative order-3 mx-auto w-full max-w-sm basis-full sm:order-none sm:basis-auto sm:justify-self-center"
        >
          <label htmlFor="header-search" className="sr-only">
            Buscar cupons ou lojas
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="header-search"
            type="search"
            name="q"
            placeholder="Buscar cupons, lojas..."
            className="w-full rounded-lg border border-border bg-muted py-2 pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand"
          />
        </form>

        <Suspense
          fallback={<nav className="order-2 flex items-center gap-1 text-sm sm:order-none sm:justify-self-end" />}
        >
          <Suspense
          fallback={<nav className="order-2 flex items-center gap-1 text-sm sm:order-none sm:justify-self-end" />}
        >
          <HeaderNav />
        </Suspense>
        </Suspense>
      </div>
    </header>
  );
}
