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

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage <= 1}
        aria-label="Página anterior"
        render={currentPage > 1 ? <Link href={pageHref(basePath, params, currentPage - 1)} /> : undefined}
      >
        <ChevronLeft className="size-4" />
      </Button>

      {pages.map((page) => (
        <Button
          key={page}
          variant="outline"
          size="icon"
          aria-current={page === currentPage ? "page" : undefined}
          className={cn(page === currentPage && "border-brand bg-brand/15 text-brand-text")}
          render={page !== currentPage ? <Link href={pageHref(basePath, params, page)} /> : undefined}
        >
          {page}
        </Button>
      ))}

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
