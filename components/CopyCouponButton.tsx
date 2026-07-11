"use client";

import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  couponId: string;
  code: string | null;
};

type Status = "idle" | "copied" | "error";

export function CopyCouponButton({ couponId, code }: Props) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleClick() {
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        setStatus("copied");
      } catch {
        setStatus("error");
      }
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

  return (
    <Button variant="brand" size="lg" className="h-9 shrink-0" onClick={handleClick} aria-live="polite">
      {status === "copied" && <Check className="size-4" />}
      {status === "error" && <AlertTriangle className="size-4" />}
      {status === "idle" && <Copy className="size-4" />}
      {label}
    </Button>
  );
}
