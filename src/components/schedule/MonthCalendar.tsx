"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const navBtn =
  "flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--mv-line)] text-[var(--mv-text-soft)] transition-colors hover:bg-[var(--mv-brand-50)] hover:text-[var(--mv-text)]";

export function MonthCalendar({
  cursor,
  selected,
  sessionsByDay,
  onSelect,
  onPrev,
  onNext,
  onToday,
}: {
  cursor: Date;
  selected: Date;
  sessionsByDay: Map<string, { id: string; name: string }[]>;
  onSelect: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const today = new Date();
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const dayKey = (d: Date) =>
    `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  const monthLabel = cursor.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="rounded-[22px] border border-[var(--mv-line)] bg-[var(--mv-surface)] p-3 shadow-[0_1px_2px_rgb(11_21_48/0.04)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={onPrev} aria-label="Mês anterior" className={navBtn}>
            <ChevronLeft className="h-[18px] w-[18px]" />
          </button>
          <button onClick={onNext} aria-label="Próximo mês" className={navBtn}>
            <ChevronRight className="h-[18px] w-[18px]" />
          </button>
          <h2 className="ml-1 text-lg font-bold text-[var(--mv-text)] first-letter:uppercase sm:text-xl">
            {monthLabel}
          </h2>
        </div>
        <button
          onClick={onToday}
          className="h-10 rounded-xl bg-[var(--mv-brand-50)] px-4 text-sm font-semibold text-[var(--mv-brand-700)] transition-colors hover:bg-[var(--mv-brand-100)]"
        >
          Hoje
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="mv-mono pb-1 text-center text-[10px] uppercase tracking-[0.14em] text-[var(--mv-text-soft)]"
          >
            {w}
          </div>
        ))}

        {cells.map((d, i) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const isSelected = sameDay(d, selected);
          const isToday = sameDay(d, today);
          const daySessions = sessionsByDay.get(dayKey(d)) ?? [];
          const has = daySessions.length > 0;
          return (
            <button
              key={i}
              onClick={() => onSelect(d)}
              aria-pressed={isSelected}
              aria-label={`${d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}${
                has ? `, ${daySessions.length} ${daySessions.length === 1 ? "aula" : "aulas"}` : ""
              }`}
              className={`flex min-h-[50px] flex-col items-center rounded-xl p-1 text-left transition-colors sm:min-h-[88px] sm:items-stretch sm:p-1.5 ${
                isSelected
                  ? "bg-[var(--mv-brand-100)] ring-2 ring-[var(--mv-brand)]"
                  : has
                    ? "bg-[var(--mv-brand-50)] hover:bg-[var(--mv-brand-100)]"
                    : "hover:bg-[var(--mv-brand-50)]"
              } ${inMonth ? "" : "opacity-35"}`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums ${
                  isToday
                    ? "bg-[var(--mv-brand)] text-white"
                    : "text-[var(--mv-text)]"
                }`}
              >
                {d.getDate()}
              </span>

              {has && (
                <>
                  {/* pontinhos no celular */}
                  <div className="mt-0.5 flex gap-0.5 sm:hidden">
                    {daySessions.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="h-1.5 w-1.5 rounded-full bg-[var(--mv-brand)]"
                      />
                    ))}
                  </div>
                  {/* nomes no desktop */}
                  <div className="mt-1 hidden min-w-0 flex-col gap-0.5 sm:flex">
                    {daySessions.slice(0, 2).map((s) => (
                      <span
                        key={s.id}
                        className="flex min-w-0 items-center gap-1 text-[11px] font-medium text-[var(--mv-brand-700)]"
                      >
                        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--mv-brand)]" />
                        <span className="truncate">{s.name}</span>
                      </span>
                    ))}
                    {daySessions.length > 2 && (
                      <span className="pl-2.5 text-[10px] font-semibold text-[var(--mv-text-soft)]">
                        +{daySessions.length - 2}
                      </span>
                    )}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
