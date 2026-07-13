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
// hero. O H1 tem max-w-2xl, então a partir de lg (1024px, quando os ícones
// aparecem) sempre sobra pelo menos ~150px de cada lado pro texto — as
// posições abaixo ficam bem dentro dessa margem. O lado direito é o espelho
// do esquerdo ("flip" inverte a diagonal do ícone). A máscara é só uma rede
// de segurança extra, caso o texto cresça mais que o previsto.
const ICONS: IconConfig[] = [
  { left: "12%", top: "33%", size: 40, opacity: 0.9, duration: 5, delay: 0 },
  { left: "5%", top: "58%", size: 100, opacity: 0.95, duration: 6, delay: -1.5 },
  { left: "11%", top: "80%", size: 42, opacity: 0.85, duration: 4.5, delay: -3 },
  { left: "88%", top: "32%", size: 40, opacity: 0.9, flip: true, duration: 5.5, delay: -2 },
  { left: "95%", top: "58%", size: 100, opacity: 0.95, flip: true, duration: 6.5, delay: -0.5 },
  { left: "89%", top: "77%", size: 42, opacity: 0.85, flip: true, duration: 4.8, delay: -4 },
];

export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -top-8 bottom-0 z-0 hidden overflow-hidden lg:block"
      style={{
        maskImage:
          "linear-gradient(to right, black 0%, black 22%, transparent 32%, transparent 68%, black 78%, black 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, black 0%, black 22%, transparent 32%, transparent 68%, black 78%, black 100%)",
      }}
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
