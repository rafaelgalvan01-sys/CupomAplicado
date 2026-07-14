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

// Tempo que o usuário tem pra ver o código revelado antes da aba já aberta
// navegar pra loja.
const REDIRECT_DELAY_MS = 700;

// Código só aparece depois do clique — igual ao padrão dos concorrentes
// (Cuponomia, Pelando). Antes disso mostramos pontinhos no lugar do texto
// real (não é blur: o código não fica no DOM até ser revelado).
export function CopyCouponButton({ couponId, code }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [revealed, setRevealed] = useState(false);

  function handleClick() {
    const url = `/ir/${couponId}`;

    if (!code) {
      const popup = window.open(url, "_blank", "noopener,noreferrer");
      if (!popup) window.location.href = url;
      return;
    }

    // Copia PRIMEIRO, enquanto a aba atual ainda está em foco — a Clipboard
    // API exige documento focado pra copiar sem pedir permissão explícita; se
    // abríssemos a aba nova antes, o foco sai daqui bem na hora da cópia e o
    // navegador (visto no Brave) passa a exibir um prompt de permissão em vez
    // de copiar direto.
    setRevealed(true);
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setStatus("copied");
        toast.success("Código do cupom copiado com sucesso");
      })
      .catch(() => setStatus("error"));
    setTimeout(() => setStatus("idle"), 2000);

    // A aba é aberta em branco logo em seguida, ainda de forma síncrona (sem
    // `await` entre o clique e esta chamada) — é a única forma de garantir
    // que o navegador nunca trate isso como bloqueio de pop-up (uma chamada a
    // window.open atrasada por setTimeout, mesmo que curta, já causou esse
    // exato bug: o navegador ficava em dúvida se vinha de um clique direto e
    // deixava a aba abrir de qualquer jeito enquanto nosso próprio fallback
    // já tinha rodado achando bloqueado — resultado, abria dobrado). Sem
    // "noopener"/"noreferrer" aqui porque as duas fazem o retorno ser sempre
    // null, o que impediria guardar essa referência pra navegar nela depois;
    // zeramos popup.opener manualmente logo em seguida pra ter a mesma
    // proteção contra reverse tabnabbing sem perder a referência.
    const popup = window.open("", "_blank");
    if (popup) popup.opener = null;

    // Só uma navegação acontece aqui: ou a aba já aberta (sem nova checagem
    // de bloqueio, é só um `.location.href` numa janela que já é nossa), ou,
    // se ela não existir/tiver sido fechada nesse meio tempo, a aba atual.
    setTimeout(() => {
      if (popup && !popup.closed) {
        popup.location.href = url;
      } else {
        window.location.href = url;
      }
    }, REDIRECT_DELAY_MS);
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
