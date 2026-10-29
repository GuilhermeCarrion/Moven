import type { LucideIcon } from "lucide-react";

const toneColor = {
  brand: "var(--mv-brand)",
  cyan: "#06b6d4",
  amber: "#f59e0b",
} as const;

/**
 * Totalizador das telas: vidro, rótulo e número à esquerda, ícone como marca d'água
 * (cortado só embaixo) com uma fumaça bem sutil atrás. Use em toda tela com totais.
 */
export function StatTile({
  icon: Icon,
  label,
  value,
  tone = "brand",
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  tone?: keyof typeof toneColor;
}) {
  const color = toneColor[tone];
  // Ícone e fumaça usam a mesma posição/tamanho, então a fumaça fica sempre atrás do ícone
  const spot = "absolute -bottom-4 right-1 h-20 w-20 sm:-bottom-6 sm:right-5 sm:h-32 sm:w-32";

  return (
    <div className="mv-glass relative overflow-hidden rounded-[22px] p-3 sm:p-5">
      {/* Fumaça: ajuste aqui → tamanho (scale-75), desfoque (blur-xl) e intensidade (12%) */}
      <div
        aria-hidden
        className={`${spot} pointer-events-none scale-75 rounded-full blur-xl`}
        style={{ background: `color-mix(in oklch, ${color} 12%, transparent)` }}
      />
      {/* Ícone: intensidade em opacity-[0.14] */}
      <Icon aria-hidden strokeWidth={1.75} className={`${spot} opacity-[0.14]`} style={{ color }} />

      <p className="relative text-xs font-medium text-[var(--mv-text-soft)] sm:text-sm">{label}</p>
      <p className="relative mt-1 text-3xl font-bold leading-none tracking-tight text-[var(--mv-text)] sm:mt-2 sm:text-5xl">
        {value}
      </p>
    </div>
  );
}
