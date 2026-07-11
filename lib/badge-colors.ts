// Paleta variada pra iniciais de loja, no estilo do protótipo em Figma Make
// — cor escolhida de forma estável a partir do nome.

const AVATAR_PALETTE = [
  "text-brand",
  "text-blue-600",
  "text-red-600",
  "text-orange-600",
  "text-violet-600",
  "text-cyan-600",
  "text-pink-600",
  "text-emerald-600",
];

const AVATAR_BG_PALETTE = [
  "bg-brand",
  "bg-blue-600",
  "bg-red-600",
  "bg-orange-600",
  "bg-violet-600",
  "bg-cyan-600",
  "bg-pink-600",
  "bg-emerald-600",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function avatarColorFor(label: string) {
  return AVATAR_PALETTE[hashString(label) % AVATAR_PALETTE.length];
}

export function avatarBgColorFor(label: string) {
  return AVATAR_BG_PALETTE[hashString(label) % AVATAR_BG_PALETTE.length];
}
