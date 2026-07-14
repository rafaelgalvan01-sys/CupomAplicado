"use client";

import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  couponId: string;
  code: string | null;
};

type Status = "idle" | "copied" | "error";

// Tempo que o usuário tem pra ver o código revelado antes de trocarmos de
// aba pra loja — abaixo de ~1s ainda conta como resposta direta ao clique
// pros navegadores (não bloqueiam o window.open por isso).
const REDIRECT_DELAY_MS = 700;

// Código só aparece depois do clique — igual ao padrão dos concorrentes
// (Cuponomia, Pelando). Antes disso mostramos pontinhos no lugar do texto
// real (não é blur: o código não fica no DOM até ser revelado).
export function CopyCouponButton({ couponId, code }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [revealed, setRevealed] = useState(false);

  function openStore() {
    const url = `/ir/${couponId}`;
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (!popup) {
      // Popup bloqueado pelo navegador — navega na aba atual para o usuário
      // ainda conseguir chegar na oferta em vez de o clique não fazer nada.
      window.location.href = url;
    }
  }

  function handleClick() {
    if (!code) {
      openStore();
      return;
    }

    setRevealed(true);
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setStatus("copied");
        toast.success("Código do cupom copiado com sucesso");
      })
      .catch(() => setStatus("error"));
    setTimeout(() => setStatus("idle"), 2000);

    // window.open só roda uma vez, depois de um atraso curto e proposital —
    // nunca depois de um `await` (ex: clipboard) direto no clique. Isso já
    // causou um bug em que o navegador atrasava a decisão do popup enquanto
    // nosso `if (!popup)` já tinha rodado achando bloqueado: resultado, a
    // aba nova abria E a aba atual TAMBÉM navegava pro site. Com um único
    // setTimeout controlado por nós, só existe uma checagem, sem essa corrida.
    setTimeout(openStore, REDIRECT_DELAY_MS);
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
        <span className="truncate">{revealed ? code : "•".repeat(code.length)}</span>
      </div>
      {button}
    </div>
  );
}
