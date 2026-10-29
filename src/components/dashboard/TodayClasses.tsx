import { CheckCheck } from "lucide-react";
import Link from "next/link";
import { DashCard } from "./DashCard";
import { dashboardMock } from "./mock";

type Klass = (typeof dashboardMock.today)[number];

export function TodayClasses({ classes, className }: { classes: readonly Klass[]; className?: string }) {
  return (
    <DashCard
      title="Aulas de hoje"
      subtitle={`${classes.length} aulas · ${classes.filter((c) => c.booked >= c.capacity).length} lotadas`}
      action={
        <Link
          href="/agendamentos"
          className="flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-[var(--mv-brand-700)] transition-colors hover:bg-[var(--mv-brand-50)]"
        >
          Ver agenda
        </Link>
      }
      className={className}
    >
      <ul className="-mx-1 divide-y divide-[var(--mv-line)]">
        {classes.map((c) => {
          const full = c.booked >= c.capacity;
          return (
            <li
              key={c.time}
              className={`flex items-center gap-3 px-1 py-3 ${c.state === "done" ? "opacity-55" : ""}`}
            >
              <span className="w-12 flex-shrink-0 text-sm font-bold tabular-nums text-[var(--mv-text)]">
                {c.time}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-semibold text-[var(--mv-text)]">
                  {c.name}
                  {c.state === "now" && (
                    <span className="flex items-center gap-1 rounded-full bg-[var(--mv-brand-100)] px-2 py-0.5 text-[11px] font-semibold text-[var(--mv-brand-700)]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--mv-brand)]" />
                      Agora
                    </span>
                  )}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-[var(--mv-text-soft)]">
                  Prof. {c.professor} ·
                  <CheckCheck className="h-3.5 w-3.5 text-sky-500" aria-hidden />
                  {c.confirmed} confirmaram
                </p>
              </div>
              <div className="w-20 flex-shrink-0 text-right">
                <p
                  className={`text-sm font-semibold tabular-nums ${full ? "text-[var(--mv-accent)]" : "text-[var(--mv-text)]"}`}
                >
                  {full ? "Lotada" : `${c.booked}/${c.capacity}`}
                </p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--mv-brand-100)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(c.booked / c.capacity) * 100}%`,
                      background: full ? "var(--mv-accent)" : "var(--mv-brand)",
                    }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </DashCard>
  );
}
