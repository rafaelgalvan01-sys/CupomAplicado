import { TicketPercent } from "lucide-react";

type IconConfig = {
  left: string;
  top: string;
  size: number;
  opacity: number;
};

// Posições/tamanhos fixos (sem animação, sem Math.random) — decoração
// estática atrás do texto do hero, escondida no mobile por falta de espaço.
const ICONS: IconConfig[] = [
  { left: "7%", top: "52%", size: 96, opacity: 0.35 },
  { left: "26%", top: "38%", size: 56, opacity: 0.25 },
  { left: "93%", top: "52%", size: 96, opacity: 0.35 },
  { left: "74%", top: "38%", size: 56, opacity: 0.25 },
];

export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block"
    >
      <div className="hero-glow absolute inset-0" />
      {ICONS.map(({ left, top, size, opacity }, index) => (
        <TicketPercent
          key={index}
          strokeWidth={1.5}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-brand"
          style={{ left, top, width: size, height: size, opacity }}
        />
      ))}
    </div>
  );
}
