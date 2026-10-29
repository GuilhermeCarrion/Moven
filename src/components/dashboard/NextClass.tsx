import { CheckCheck, Clock } from "lucide-react";
import type { DashboardClass } from "./types";

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Resumo da próxima aula do dia (horário, turma, professor, lotação, confirmados, quanto falta). */
// nowMin = minutos desde a meia-noite (número, não Date: a landing passa um horário fixo do servidor)
export function NextClass({ classes, nowMin }: { classes: DashboardClass[]; nowMin: number }) {
  const next = classes.find((c) => toMinutes(c.time) > nowMin);
  const diff = next ? toMinutes(next.time) - nowMin : 0;
  const countdown = diff >= 60 ? `em ${Math.floor(diff / 60)}h ${diff % 60}min` : `em ${diff} min`;
  const full = next ? next.booked >= next.capacity : false;

  return (
    <div className="flex flex-col rounded-[22px] border border-[var(--mv-line)] bg-[var(--mv-surface)] p-4 shadow-[0_1px_2px_rgb(11_21_48/0.04)] sm:p-5">
      {/* flex-wrap: no celular (2 colunas) o contador desce para baixo do título em vez de vazar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--mv-text-soft)]">Próxima aula</p>
        {next ? (
          <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-[var(--mv-brand-100)] px-2 py-0.5 text-xs font-semibold text-[var(--mv-brand-700)]">
            <Clock className="h-3.5 w-3.5" /> {countdown}
          </span>
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--mv-brand-50)] text-[var(--mv-brand-700)]">
            <Clock className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>

      {next ? (
        <>
          <div className="mt-2 flex flex-wrap items-end gap-x-3">
            <p className="text-2xl font-bold tracking-tight text-[var(--mv-text)] sm:text-3xl">{next.time}</p>
            <div className="min-w-[6.5rem] flex-1 pb-0.5">
              <p className="truncate font-semibold leading-tight text-[var(--mv-text)]">{next.name}</p>
              <p className="truncate text-sm text-[var(--mv-text-soft)]">Prof. {next.professor}</p>
            </div>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--mv-brand-100)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(next.booked / next.capacity) * 100}%`,
                background: full ? "var(--mv-accent)" : "var(--mv-brand)",
              }}
            />
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-xs sm:text-sm">
            <span
              className={`font-semibold tabular-nums ${full ? "text-[var(--mv-accent)]" : "text-[var(--mv-text)]"}`}
            >
              {next.booked}/{next.capacity} alunos
            </span>
            <span className="flex items-center gap-1 text-[var(--mv-text-soft)]">
              <CheckCheck className="h-3.5 w-3.5 text-sky-500" aria-hidden />
              {next.confirmed} confirmaram
            </span>
          </div>
        </>
      ) : (
        <p className="mt-2 font-semibold text-[var(--mv-text)]">Sem mais aulas hoje.</p>
      )}
    </div>
  );
}
