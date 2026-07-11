"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  couponId: string;
  initialHelpful: number;
  initialNotHelpful: number;
  expiresAt: string | null;
  clicks: number;
};

function barColor(percent: number) {
  if (percent >= 70) return "bg-brand";
  if (percent >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

function textColor(percent: number) {
  if (percent >= 70) return "text-brand-text";
  if (percent >= 40) return "text-yellow-500";
  return "text-red-500";
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function CouponFooter({ couponId, initialHelpful, initialNotHelpful, expiresAt, clicks }: Props) {
  const [helpful, setHelpful] = useState(initialHelpful);
  const [notHelpful, setNotHelpful] = useState(initialNotHelpful);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [loading, setLoading] = useState(false);

  const total = helpful + notHelpful;
  const percent = total > 0 ? Math.round((helpful / total) * 100) : 0;

  async function vote(isHelpful: boolean) {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId, isHelpful }),
      });
      if (res.ok) {
        const data = await res.json();
        setHelpful(data.helpful_count);
        setNotHelpful(data.not_helpful_count);
        setVoted(isHelpful ? "up" : "down");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs">
        <span className="shrink-0 text-muted-foreground">Funciona?</span>
        <div
          role="progressbar"
          aria-label="Porcentagem de avaliações positivas"
          aria-valuenow={total > 0 ? percent : undefined}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={total > 0 ? `${percent}%` : "Sem avaliações ainda"}
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
        >
          {total > 0 && (
            <div
              className={cn("h-full rounded-full transition-all", barColor(percent))}
              style={{ width: `${percent}%` }}
            />
          )}
        </div>
        <span className={cn("shrink-0 font-semibold", total > 0 ? textColor(percent) : "text-muted-foreground")}>
          {total > 0 ? `${percent}%` : "—"}
        </span>
      </div>

      <div data-slot="coupon-footer" className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Está funcionando"
            aria-pressed={voted === "up"}
            onClick={() => vote(true)}
            disabled={loading}
            className={cn(
              "flex items-center gap-1 rounded-full border border-border px-2 py-1 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
              voted === "up" && "border-brand/50 text-brand-text"
            )}
          >
            <ThumbsUp className="size-3.5" />
            {helpful}
          </button>
          <button
            type="button"
            aria-label="Não está funcionando"
            aria-pressed={voted === "down"}
            onClick={() => vote(false)}
            disabled={loading}
            className={cn(
              "flex items-center gap-1 rounded-full border border-border px-2 py-1 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
              voted === "down" && "border-destructive/50 text-destructive"
            )}
          >
            <ThumbsDown className="size-3.5" />
            {notHelpful}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {expiresAt && (
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDate(expiresAt)}
            </span>
          )}
          <span>{clicks > 0 ? `${clicks.toLocaleString("pt-BR")} usos` : "Novo"}</span>
        </div>
      </div>
    </div>
  );
}
