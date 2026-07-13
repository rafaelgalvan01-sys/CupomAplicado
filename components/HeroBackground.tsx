import type { LucideIcon } from "lucide-react";
import { BadgePercent, Percent, Tag, Ticket } from "lucide-react";

type IconConfig = {
  Icon: LucideIcon;
  left: number;
  size: number;
  opacity: number;
  blur: number;
  duration: number;
  delay: number;
  rotate: number;
};

// Posições, tamanhos e tempos fixos (não Math.random()) pra renderizar igual
// em todo request — evita layout shift entre re-render do Server Component.
const ICONS: IconConfig[] = [
  { Icon: Tag, left: 3, size: 26, opacity: 0.16, blur: 0, duration: 17, delay: -4, rotate: -12 },
  { Icon: Percent, left: 10, size: 42, opacity: 0.08, blur: 2, duration: 24, delay: -15, rotate: 8 },
  { Icon: Ticket, left: 17, size: 20, opacity: 0.18, blur: 0, duration: 15, delay: -9, rotate: -6 },
  { Icon: BadgePercent, left: 24, size: 34, opacity: 0.1, blur: 1, duration: 21, delay: -1, rotate: 15 },
  { Icon: Tag, left: 32, size: 48, opacity: 0.06, blur: 3, duration: 27, delay: -19, rotate: -18 },
  { Icon: Percent, left: 68, size: 22, opacity: 0.16, blur: 0, duration: 16, delay: -11, rotate: 10 },
  { Icon: Ticket, left: 75, size: 38, opacity: 0.09, blur: 2, duration: 23, delay: -6, rotate: -9 },
  { Icon: BadgePercent, left: 82, size: 24, opacity: 0.15, blur: 0, duration: 18, delay: -17, rotate: 4 },
  { Icon: Tag, left: 89, size: 44, opacity: 0.07, blur: 3, duration: 26, delay: -2, rotate: 20 },
  { Icon: Percent, left: 95, size: 20, opacity: 0.17, blur: 0, duration: 14, delay: -13, rotate: -14 },
  { Icon: Ticket, left: 55, size: 30, opacity: 0.11, blur: 1, duration: 20, delay: -8, rotate: 12 },
  { Icon: BadgePercent, left: 45, size: 20, opacity: 0.14, blur: 0, duration: 16, delay: -20, rotate: -5 },
];

export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        contain: "layout paint",
        maskImage:
          "radial-gradient(ellipse 55% 60% at 50% 50%, transparent 0%, transparent 35%, black 75%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 55% 60% at 50% 50%, transparent 0%, transparent 35%, black 75%)",
      }}
    >
      {ICONS.map(({ Icon, left, size, opacity, blur, duration, delay, rotate }, index) => (
        <Icon
          key={index}
          className="absolute top-[-15%] text-brand will-change-transform"
          style={{
            left: `${left}%`,
            width: size,
            height: size,
            opacity,
            filter: blur ? `blur(${blur}px)` : undefined,
            animation: `hero-icon-fall ${duration}s linear ${delay}s infinite`,
            ["--icon-rotate" as string]: `${rotate}deg`,
            transform: `rotate(${rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
