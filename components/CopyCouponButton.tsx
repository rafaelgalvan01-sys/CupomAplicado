"use client";

import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  couponId: string;
  code: string | null;
};

type Status = "idle" | "copied" | "error";

// Código só fica visível (sem blur) depois do clique — igual ao padrão dos
// concorrentes (Cuponomia, Pelando). O texto real continua no DOM o tempo
// todo (bom pra SEO/acessibilidade), só o blur é removido ao revelar.
export function CopyCouponButton({ couponId, code }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [revealed, setRevealed] = useState(false);

  async function handleClick() {
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        setStatus("copied");
      } catch {
        setStatus("error");
      }
      setRevealed(true);
      setTimeout(() => setStatus("idle"), 2000);
    }

    const url = `/ir/${couponId}`;
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (!popup) {
      // Popup bloqueado pelo navegador — navega na aba atual para o usuário
      // ainda conseguir chegar na oferta em vez de o clique não fazer nada.
      window.location.href = url;
    }
  }

  const label = status === "copied" ? "Copiado!" : status === "error" ? "Erro ao copiar" : code ? "Copiar" : "Ver oferta";

  const button = (
    <Button variant="brand" size="lg" className="h-9 shrink-0" onClick={handleClick} aria-live="polite">
      {status === "copied" && <Check className="size-4" />}
      {status === "error" && <AlertTriangle className="size-4" />}
      {status === "idle" && <Copy className="size-4" />}
      {label}
    </Button>
  );

  if (!code) return button;

  return (
    <div data-slot="coupon-code" className="flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2 overflow-hidden rounded-md border border-dashed border-border bg-muted px-3 py-2 font-mono text-sm font-semibold">
        <Copy className="size-3.5 shrink-0 text-muted-foreground" />
        <span className={cn("truncate transition-[filter] duration-200", !revealed && "select-none blur-[5px]")}>
          {code}
        </span>
      </div>
      {button}
    </div>
  );
}
