"use client";

import { useEffect, useRef, useState } from "react";
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
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 rounded text-xs font-medium text-brand-text outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {expanded ? "ler menos" : "ler mais"}
        </button>
      )}
    </p>
  );
}
