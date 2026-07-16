import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Corta na última palavra inteira (evita truncar no meio de uma palavra em
// metas/cards) e acrescenta reticências.
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…"
}

// Frescor real ("Atualizado há X") a partir de um updated_at genuíno (ver
// migração 0006) — nunca uma data fixa/decorativa.
export function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  if (diffMinutes < 1) return "agora"
  if (diffMinutes < 60) return `há ${diffMinutes} min`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return diffHours === 1 ? "há 1h" : `há ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return diffDays === 1 ? "há 1 dia" : `há ${diffDays} dias`
  const diffMonths = Math.floor(diffDays / 30)
  return diffMonths === 1 ? "há 1 mês" : `há ${diffMonths} meses`
}
