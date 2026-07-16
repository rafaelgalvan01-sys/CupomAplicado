"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { cn, formatRelativeTime } from "@/lib/utils";

type Props = {
  couponId: string;
  initialHelpful: number;
  initialNotHelpful: number;
  expiresAt: string | null;
  clicks: number;
  updatedAt: string;
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

export function CouponFooter({ couponId, initialHelpful, initialNotHelpful, expiresAt, clicks, updatedAt }: Props) {
  const [helpful, setHelpful] = useState(initialHelpful);
  const [notHelpful, setNotHelpful] = useState(initialNotHelpful);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [loading, setLoading] = useState(false);

  const total = helpful + notHelpful;
  const percent = total > 0 ? Math.round((helpful / total) * 100) : 0;

  async function vote(isHelpful: boolean) {
    if (loading) return;
    const isUndo = voted === (isHelpful ? "up" : "down");
    setLoading(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId, isHelpful: isUndo ? null : isHelpful }),
      });
      if (res.ok) {
        const data = await res.json();
        setHelpful(data.helpful_count);
        setNotHelpful(data.not_helpful_count);
        setVoted(isUndo ? null : isHelpful ? "up" : "down");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs">
        <span className="shrink-0 text-muted-foreground">Funciona?</span>
        <Progress
          value={total > 0 ? percent : null}
          aria-label="Porcentagem de avaliações positivas"
          getAriaValueText={(_, value) => (value === null ? "Sem avaliações ainda" : `${value}%`)}
          className="flex-1"
        >
          <ProgressTrack className="h-1.5">
            <ProgressIndicator
              className={cn("rounded-full transition-all", total > 0 ? barColor(percent) : "w-0")}
            />
          </ProgressTrack>
        </Progress>
        <span className={cn("shrink-0 font-semibold", total > 0 ? textColor(percent) : "text-muted-foreground")}>
          {total > 0 ? `${percent}%` : "—"}
        </span>
      </div>

      <div data-slot="coupon-footer" className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Está funcionando"
            aria-pressed={voted === "up"}
            onClick={() => vote(true)}
            disabled={loading}
            className={cn(
              "rounded-full border border-border px-2 py-1",
              voted === "up" && "border-brand/50 text-brand-text"
            )}
          >
            <ThumbsUp className="size-3.5" />
            {helpful}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Não está funcionando"
            aria-pressed={voted === "down"}
            onClick={() => vote(false)}
            disabled={loading}
            className={cn(
              "rounded-full border border-border px-2 py-1",
              voted === "down" && "border-destructive/50 text-destructive"
            )}
          >
            <ThumbsDown className="size-3.5" />
            {notHelpful}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {updatedAt && (
            <span className="flex items-center gap-1" title="Baseado na última importação/atualização real deste cupom">
              <Clock className="size-3" />
              Atualizado {formatRelativeTime(updatedAt)}
            </span>
          )}
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
