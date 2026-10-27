import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

/** Casca dos cards da dashboard: superfície sólida (dados nunca ficam sobre vidro). */
export function DashCard({
  title,
  subtitle,
  action,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-[22px] border border-[var(--mv-line)] bg-[var(--mv-surface)] p-4 shadow-[0_1px_2px_rgb(11_21_48/0.04)] sm:p-5 ${className}`}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[var(--mv-text)]">{title}</h2>
          {subtitle && <p className="text-sm text-[var(--mv-text-soft)]">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/** Totalizador. `highlight` = o único bloco sólido da marca na tela. */
export function KpiCard({
  label,
  value,
  detail,
  delta,
  meter,
  trend,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  detail?: string;
  delta?: { text: string; up: boolean };
  meter?: number; // 0..1
  trend?: { label: string; value: number; text: string }[]; // barrinhas estáticas; a última = período atual
  icon: LucideIcon;
  highlight?: boolean;
}) {
  const soft = highlight ? "text-white/80" : "text-[var(--mv-text-soft)]";
  const Trend = delta?.up ? TrendingUp : TrendingDown;

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-[22px] p-4 sm:p-5 ${
        highlight
          ? "bg-[linear-gradient(135deg,var(--mv-brand),color-mix(in_oklch,var(--mv-brand)_72%,black))] text-white shadow-[0_18px_40px_-20px_var(--mv-brand)]"
          : "border border-[var(--mv-line)] bg-[var(--mv-surface)] shadow-[0_1px_2px_rgb(11_21_48/0.04)]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`text-sm font-medium ${soft}`}>{label}</p>
        <span
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
            highlight
              ? "bg-white/15 text-white"
              : "bg-[var(--mv-brand-50)] text-[var(--mv-brand-700)]"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>

      <p
        className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${highlight ? "" : "text-[var(--mv-text)]"}`}
      >
        {value}
      </p>

      {trend && (
        <div
          role="img"
          aria-label={`Últimos ${trend.length} meses: ${trend.map((t) => t.text).join(", ")}`}
          className="mt-3 flex h-9 items-end gap-1.5"
        >
          {trend.map((t, i) => (
            <span
              key={t.label}
              title={t.text}
              className={`w-full max-w-5 rounded-t-[3px] ${
                i === trend.length - 1
                  ? highlight
                    ? "bg-white"
                    : "bg-[var(--mv-brand)]"
                  : highlight
                    ? "bg-white/30"
                    : "bg-[var(--mv-brand-200)]"
              }`}
              style={{ height: `${(t.value / Math.max(...trend.map((x) => x.value))) * 100}%` }}
            />
          ))}
        </div>
      )}

      {meter !== undefined && (
        <div
          className={`mt-3 h-1.5 overflow-hidden rounded-full ${highlight ? "bg-white/25" : "bg-[var(--mv-brand-100)]"}`}
        >
          <div
            className={`h-full rounded-full ${highlight ? "bg-white" : "bg-[var(--mv-brand)]"}`}
            style={{ width: `${Math.min(1, meter) * 100}%` }}
          />
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-xs sm:text-sm">
        {delta && (
          <span
            className={`flex items-center gap-1 font-semibold ${
              highlight ? "text-white" : delta.up ? "text-emerald-600" : "text-red-600"
            }`}
          >
            <Trend className="h-3.5 w-3.5" /> {delta.text}
          </span>
        )}
        {detail && <span className={soft}>{detail}</span>}
      </div>
    </div>
  );
}
