import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function pageHref(basePath: string, params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

// Lista compacta de páginas com reticências: sempre a primeira e a última, mais
// a atual e uma vizinha de cada lado (ex: 1 … 5 6 7 … 11). Evita uma fileira de
// N botões que estoura a largura no mobile quando há muitas páginas.
function getPageItems(current: number, total: number): (number | "ellipsis")[] {
  const items: (number | "ellipsis")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) items.push("ellipsis");
  for (let page = left; page <= right; page++) items.push(page);
  if (right < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  params = {},
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const items = getPageItems(currentPage, totalPages);

  return (
    <nav aria-label="Paginação" className="flex flex-wrap items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage <= 1}
        aria-label="Página anterior"
        render={currentPage > 1 ? <Link href={pageHref(basePath, params, currentPage - 1)} /> : undefined}
      >
        <ChevronLeft className="size-4" />
      </Button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden
            className="flex size-8 items-center justify-center text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            variant="outline"
            size="icon"
            aria-current={item === currentPage ? "page" : undefined}
            className={cn(item === currentPage && "border-brand bg-brand/15 text-brand-text")}
            render={item !== currentPage ? <Link href={pageHref(basePath, params, item)} /> : undefined}
          >
            {item}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage >= totalPages}
        aria-label="Próxima página"
        render={currentPage < totalPages ? <Link href={pageHref(basePath, params, currentPage + 1)} /> : undefined}
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
