"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";

const NO_TRACK_KEY = "cupom-no-track";

// Visitar o site com ?no-track=1 na URL marca este navegador pra nunca mais
// mandar dado pro Vercel Analytics (fica salvo em localStorage, então vale
// pra sempre nesse navegador até ?no-track=0 ser usado). Não afeta o Google
// Search Console — ele só registra cliques vindos de uma busca no Google de
// verdade, nunca visitas diretas por URL, então não há nada pra excluir lá.
export function AnalyticsGate() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("no-track") === "1") {
      localStorage.setItem(NO_TRACK_KEY, "1");
    } else if (params.get("no-track") === "0") {
      localStorage.removeItem(NO_TRACK_KEY);
    }
  }, []);

  return (
    <Analytics
      beforeSend={(event) => (localStorage.getItem(NO_TRACK_KEY) ? null : event)}
    />
  );
}
