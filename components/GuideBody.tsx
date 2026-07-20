import Link from "next/link";
import { Fragment, type ReactNode } from "react";

// Seções de guia podem trazer links internos contextuais gerados via
// scripts/generate-guide-content.mjs, usando a sintaxe markdown simples
// `[texto](/caminho)` — nunca HTML cru, pra manter o dado seguro de renderizar
// sem sanitização adicional. O script já valida que /caminho é uma rota real
// antes de salvar; aqui só interpretamos a sintaxe.
const LINK_PATTERN = /\[([^\]]+)\]\((\/[^\s)]+)\)/g;

export function GuideBody({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  // matchAll (diferente de exec) não muta o lastIndex do regex compartilhado
  // no módulo — cada chamada opera sobre uma cópia interna.
  for (const match of text.matchAll(LINK_PATTERN)) {
    const [full, label, href] = match;
    const index = match.index;
    if (index > lastIndex) {
      parts.push(<Fragment key={key++}>{text.slice(lastIndex, index)}</Fragment>);
    }
    parts.push(
      <Link
        key={key++}
        href={href}
        className="text-brand-text underline decoration-brand/40 underline-offset-2 hover:decoration-brand"
      >
        {label}
      </Link>
    );
    lastIndex = index + full.length;
  }
  if (lastIndex < text.length) {
    parts.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }

  return <>{parts}</>;
}
