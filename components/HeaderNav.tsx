"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Flame, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeaderNav() {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort");

  return (
    <nav className="order-2 flex items-center gap-1 text-sm sm:order-none sm:justify-self-end">
      <Button
        variant="ghost"
        nativeButton={false}
        aria-current={sort === "populares" ? "page" : undefined}
        className={cn(sort === "populares" && "bg-muted text-foreground")}
        render={<Link href="/?sort=populares" />}
      >
        <Flame data-icon="inline-start" className="text-muted-foreground" />
        Populares
      </Button>
      <Button
        variant="ghost"
        nativeButton={false}
        aria-current={sort === "expirando" ? "page" : undefined}
        className={cn(sort === "expirando" && "bg-muted text-foreground")}
        render={<Link href="/?sort=expirando" />}
      >
        <Clock data-icon="inline-start" className="text-muted-foreground" />
        Expirando
      </Button>
    </nav>
  );
}
