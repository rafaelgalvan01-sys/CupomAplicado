import { TicketPercent } from "lucide-react";

type IconConfig = {
  left: string;
  top: string;
  size: number;
  opacity: number;
  flip?: boolean;
  fill?: string;
  duration: number;
  delay: number;
};

// Cor da marca (#1DB761) a 10% de opacidade, usada só no preenchimento dos
// dois ícones grandes.
const LARGE_ICON_FILL = "rgba(29, 183, 97, 0.1)";

// Posições/tamanhos fixos (sem Math.random) — decoração atrás do texto do
// hero. O H1 tem max-w-2xl, então a partir de lg (1024px, quando os ícones
// aparecem) sempre sobra margem suficiente pro texto sem precisar de máscara
// (a máscara foi removida porque também cortava o brilho de fundo, que é
// renderizado fora deste container agora). O lado direito é o espelho do
// esquerdo ("flip" inverte a diagonal do ícone).
const ICONS: IconConfig[] = [
  { left: "17%", top: "33%", size: 38, opacity: 0.9, duration: 3.5, delay: 0 },
  { left: "7%", top: "58%", size: 92, opacity: 0.95, fill: LARGE_ICON_FILL, duration: 4.2, delay: -1.5 },
  { left: "16%", top: "80%", size: 40, opacity: 0.85, duration: 3.2, delay: -3 },
  { left: "83%", top: "32%", size: 38, opacity: 0.9, flip: true, duration: 3.9, delay: -2 },
  { left: "93%", top: "58%", size: 92, opacity: 0.95, flip: true, fill: LARGE_ICON_FILL, duration: 4.6, delay: -0.5 },
  { left: "84%", top: "77%", size: 40, opacity: 0.85, flip: true, duration: 3.4, delay: -4 },
];

export function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-8 bottom-0 z-0">
      <div className="hero-glow absolute inset-0" />
      <div className="absolute inset-0 hidden overflow-hidden lg:block">
        {ICONS.map(({ left, top, size, opacity, flip, fill, duration, delay }, index) => (
          <TicketPercent
            key={index}
            strokeWidth={1.5}
            fill={fill ?? "none"}
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
    </div>
  );
}
