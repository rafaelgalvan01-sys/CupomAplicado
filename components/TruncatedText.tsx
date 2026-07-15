"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TruncatedText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) setOverflowing(el.scrollWidth > el.clientWidth + 1);
  }, [text]);

  return (
    <p data-slot="truncated-text" className={cn("flex min-w-0 items-baseline gap-1.5", className)}>
      <span ref={ref} className={cn("min-w-0 flex-1", !expanded && "truncate")}>
        {text}
      </span>
      {(overflowing || expanded) && (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => setExpanded((e) => !e)}
          className="h-auto shrink-0 p-0 text-xs"
        >
          {expanded ? "ler menos" : "ler mais"}
        </Button>
      )}
    </p>
  );
}
