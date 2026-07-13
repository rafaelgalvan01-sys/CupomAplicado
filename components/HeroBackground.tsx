import { TicketPercent } from "lucide-react";

type IconConfig = {
  left: string;
  top: string;
  size: number;
  opacity: number;
  flip?: boolean;
  duration: number;
  delay: number;
};

// Posições/tamanhos fixos (sem Math.random) — decoração atrás do texto do
// hero, escondida no mobile por falta de espaço. O lado direito é o espelho
// do esquerdo (mesmas alturas/tamanhos, "flip" inverte a diagonal do ícone).
const ICONS: IconConfig[] = [
  { left: "26%", top: "33%", size: 44, opacity: 0.9, duration: 5, delay: 0 },
  { left: "15%", top: "58%", size: 108, opacity: 0.95, duration: 6, delay: -1.5 },
  { left: "24%", top: "80%", size: 46, opacity: 0.85, duration: 4.5, delay: -3 },
  { left: "74%", top: "32%", size: 44, opacity: 0.9, flip: true, duration: 5.5, delay: -2 },
  { left: "85%", top: "58%", size: 108, opacity: 0.95, flip: true, duration: 6.5, delay: -0.5 },
  { left: "76%", top: "77%", size: 46, opacity: 0.85, flip: true, duration: 4.8, delay: -4 },
];

export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block"
    >
      <div className="hero-glow absolute inset-0" />
      {ICONS.map(({ left, top, size, opacity, flip, duration, delay }, index) => (
        <TicketPercent
          key={index}
          strokeWidth={1.5}
          className="absolute text-brand"
          style={{
            left,
            top,
            width: size,
            height: size,
            opacity,
            ["--icon-flip" as string]: flip ? -1 : 1,
            animation: `hero-icon-float ${duration}s ease-in-out ${delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
