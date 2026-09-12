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
    <div className="rounded-2xl border border-white/60 bg-white/55 p-4 shadow-xl backdrop-blur-2xl backdrop-saturate-150 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/70 bg-white/50 text-slate-600 hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-base font-bold capitalize  text-slate-800 sm:text-lg">
            {monthLabel}
          </span>
          <button
            onClick={onNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/70 bg-white/50 text-slate-600 hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={onToday}
          className="rounded-full bg-[var(--primary)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--primary-focus)]"
        >
          Hoje
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="pb-1 text-center text-[10px] font-bold text-slate-400 sm:text-xs"
          >
            {w}
          </div>
        ))}

        {cells.map((d, i) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const isSelected = sameDay(d, selected);
          const isToday = sameDay(d, today);
          const daySessions = sessionsByDay.get(dayKey(d)) ?? [];
          return (
            <button
              key={i}
              onClick={() => onSelect(d)}
              className={`flex min-h-[52px] flex-col rounded-xl border p-1.5 text-left transition-colors sm:min-h-[84px] sm:p-2 ${
                isSelected
                  ? "border-[var(--primary)] bg-[var(--brand-cyan)]/15"
                  : "border-white/50 bg-white/30 hover:bg-white/50"
              } ${inMonth ? "" : "opacity-40"}`}
            >
              <span
                className={`text-xs font-semibold sm:text-sm ${
                  isToday ? "text-[var(--primary)]" : "text-slate-700"
                }`}
              >
                {d.getDate()}
              </span>

              {daySessions.length > 0 && (
                <>
                  {/* dots no mobile */}
                  <div className="mt-1 flex gap-0.5 sm:hidden">
                    {daySessions.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]"
                      />
                    ))}
                  </div>
                  {/* nomes no desktop */}
                  <div className="mt-1 hidden flex-col gap-0.5 sm:flex">
                    {daySessions.slice(0, 2).map((s) => (
                      <span
                        key={s.id}
                        className="flex items-center gap-1 text-[11px] text-slate-600"
                      >
                        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--primary)]" />
                        <span className="truncate">{s.name}</span>
                      </span>
                    ))}
                    {daySessions.length > 2 && (
                      <span className="text-[10px] text-slate-400">
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
    </div>
  );
}
