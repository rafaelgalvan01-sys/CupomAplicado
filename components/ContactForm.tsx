"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Chave PÚBLICA do Web3Forms (por design vai no HTML do formulário — não é
// segredo). O serviço recebe o envio e encaminha pra contato@cupomaplicado.com.br.
const WEB3FORMS_ACCESS_KEY = "24e28967-f5ec-49cf-91c9-8fd0b8ac3ee7";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(form);
    formData.append("access_key", WEB3FORMS_ACCESS_KEY);
    formData.append("from_name", "Contato — Cupom Aplicado");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorMessage(
          data.message ?? "Não foi possível enviar agora. Tente de novo em instantes."
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage(
        "Não foi possível enviar agora. Confira sua conexão e tente de novo."
      );
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-xl border border-brand/22 bg-brand/10 px-5 py-6 text-brand-text"
      >
        <div className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="size-5 shrink-0" />
          Mensagem enviada
        </div>
        <p className="text-sm text-muted-foreground">
          Recebemos sua mensagem e respondemos em até 2 dias úteis. Obrigado pelo contato.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => setStatus("idle")}>
          Enviar outra mensagem
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Honeypot: campo escondido que só robô preenche. O Web3Forms trata
          qualquer envio com "botcheck" marcado como spam. */}
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-name" className="text-sm font-medium text-foreground">
            Nome
          </label>
          <Input id="contact-name" name="name" type="text" required autoComplete="name" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-email" className="text-sm font-medium text-foreground">
            E-mail
          </label>
          <Input id="contact-email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-subject" className="text-sm font-medium text-foreground">
          Assunto
        </label>
        <Input id="contact-subject" name="subject" type="text" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-sm font-medium text-foreground">
          Mensagem
        </label>
        <Textarea id="contact-message" name="message" required />
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        variant="brand"
        size="lg"
        disabled={status === "submitting"}
        className="w-full sm:w-fit"
      >
        <Send className="size-4" />
        {status === "submitting" ? "Enviando…" : "Enviar mensagem"}
      </Button>
    </form>
  );
}
