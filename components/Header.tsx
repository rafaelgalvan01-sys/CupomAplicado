import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:gap-4 sm:py-4">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
          <Logo />
        </Link>

        <form
          action="/"
          method="get"
          className="relative order-3 w-full basis-full sm:order-none sm:ml-auto sm:w-auto sm:max-w-sm sm:basis-auto"
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
      </div>
    </header>
  );
}
