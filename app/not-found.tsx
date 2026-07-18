import type { Metadata } from "next";
import Link from "next/link";
import { Search, Home, Store, Tags, Lightbulb } from "lucide-react";
import { getTopStores } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Página não encontrada — Cupom Aplicado",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const stores = await getTopStores(8);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 py-20 text-center">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold tracking-widest text-brand-text uppercase">Erro 404</span>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Essa página não existe (ou saiu do ar)
        </h1>
        <p className="text-muted-foreground">
          Pode ser um link quebrado ou um cupom que já expirou. Busca de novo ou escolhe um caminho abaixo.
        </p>
      </div>

      <form action="/" method="get" className="relative w-full max-w-sm">
        <label htmlFor="not-found-search" className="sr-only">
          Buscar cupons ou lojas
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="not-found-search"
          type="search"
          name="q"
          placeholder="Buscar cupons, lojas..."
          className="pl-9"
        />
      </form>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" render={<Link href="/" />}>
          <Home className="size-4" />
          Início
        </Button>
        <Button variant="outline" size="sm" render={<Link href="/lojas" />}>
          <Store className="size-4" />
          Lojas
        </Button>
        <Button variant="outline" size="sm" render={<Link href="/categorias" />}>
          <Tags className="size-4" />
          Categorias
        </Button>
        <Button variant="outline" size="sm" render={<Link href="/guias" />}>
          <Lightbulb className="size-4" />
          Guias
        </Button>
      </div>

      {stores.length > 0 && (
        <div className="flex w-full flex-col gap-3">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Lojas populares
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/loja/${store.slug}`}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                {store.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
