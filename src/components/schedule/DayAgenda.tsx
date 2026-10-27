"use client";

import { CloudField } from "@/components/landing/CloudField";
import { initials } from "@/components/layout/Sidebar";
import { ClassSession } from "@/types/models";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { Fragment, useState } from "react";
import { SessionDetail } from "./SessionDetail";

const hhmm = (d: Date) =>
  d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

type State = "cancelled" | "done" | "now" | "next";

const chip: Record<Exclude<State, "next">, { label: string; cls: string }> = {
  now: { label: "Agora", cls: "bg-[var(--mv-brand)] text-white" },
  done: { label: "Encerrada", cls: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
  cancelled: { label: "Cancelada", cls: "bg-red-500/10 text-red-600 dark:text-red-300" },
};

/** Linha do tempo do dia escolhido no calendário: data em destaque, aulas em ordem e a marca de "agora". */
export function DayAgenda({
  date,
  sessions,
  isLoading,
}: {
  date: Date;
  sessions: ClassSession[]; // já ordenadas por horário
  isLoading: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // shortcut: "agora" é calculado no render (não anda sozinho); atualiza a cada clique/refetch
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const booked = sessions.reduce((n, s) => n + (s._count?.appointments ?? 0), 0);
  const nextIdx = sessions.findIndex((s) => new Date(s.startAt) > now);
  const nowMarkerAt = isToday ? (nextIdx === -1 ? sessions.length : nextIdx) : -1;

  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  const month = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");

  const nowMarker = (
    <li className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-3">
      <span className="text-right text-xs font-bold tabular-nums text-[var(--mv-accent)]">{hhmm(now)}</span>
      <div className="relative flex items-center">
        <span aria-hidden className="absolute -left-[6px] h-3 w-3 rounded-full bg-[var(--mv-accent)] ring-4 ring-[var(--mv-accent)]/20" />
        <span aria-hidden className="ml-4 h-px flex-1 bg-[var(--mv-accent)]/60" />
        <span className="mv-mono ml-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mv-accent)]">
          Agora
        </span>
      </div>
    </li>
  );

  return (
    <section className="rounded-[22px] border border-[var(--mv-line)] bg-[var(--mv-surface)] p-3 shadow-[0_1px_2px_rgb(11_21_48/0.04)] sm:p-5">
      {/* Data do dia: o bloco sólido da marca nesta tela */}
      <header className="mb-5 flex items-center gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--mv-brand),color-mix(in_oklch,var(--mv-brand)_72%,black))] text-white shadow-[0_14px_30px_-16px_var(--mv-brand)]">
          <span className="mv-mono text-[10px] uppercase tracking-[0.16em] text-white/80">{month}</span>
          <span className="text-2xl font-bold leading-none tabular-nums">{date.getDate()}</span>
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[var(--mv-text)] first-letter:uppercase">
            {weekday}
            {isToday && <span className="font-semibold text-[var(--mv-brand-700)]"> · hoje</span>}
          </h2>
          <p className="text-sm text-[var(--mv-text-soft)]">
            {isLoading
              ? "Carregando..."
              : `${sessions.length} ${sessions.length === 1 ? "aula" : "aulas"} · ${booked} ${booked === 1 ? "aluno agendado" : "alunos agendados"}`}
          </p>
        </div>
      </header>

      {!isLoading && sessions.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-[var(--mv-line)] px-4 py-14 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_85%)]"
            style={{ "--mv-ambient-alpha": 0.45 } as React.CSSProperties}
          >
            <CloudField ambient spotlight={false} />
          </div>
          <p className="relative font-semibold text-[var(--mv-text)]">Dia livre</p>
          <p className="relative mt-1 text-sm text-[var(--mv-text-soft)]">
            Nenhuma aula marcada. Use &quot;Nova aula&quot; para criar.
          </p>
        </div>
      )}

      {sessions.length > 0 && (
        // trilho vertical da linha do tempo (passa pelos pontos de cada aula)
        <ul className="relative space-y-3 before:absolute before:bottom-6 before:left-[64px] before:top-6 before:w-px before:bg-[var(--mv-line)]">
          {sessions.map((s, i) => {
            const start = new Date(s.startAt);
            const end = new Date(start.getTime() + s.durationMin * 60000);
            const state: State =
              s.status === "CANCELLED"
                ? "cancelled"
                : s.status === "COMPLETED" || end <= now
                  ? "done"
                  : start <= now
                    ? "now"
                    : "next";
            const count = s._count?.appointments ?? 0;
            const full = count >= s.capacity;
            const belowMin = state === "next" && count < s.minCapacity;
            const open = expandedId === s.id;
            const quiet = state === "done" || state === "cancelled";

            return (
              <Fragment key={s.id}>
              {i === nowMarkerAt && nowMarker}
              <li className="relative grid grid-cols-[52px_minmax(0,1fr)] gap-3">
                <div className={`pt-3.5 text-right ${quiet ? "opacity-60" : ""}`}>
                  <p className="text-sm font-bold tabular-nums text-[var(--mv-text)]">{hhmm(start)}</p>
                  <p className="text-xs tabular-nums text-[var(--mv-text-soft)]">{hhmm(end)}</p>
                </div>

                <div className="relative pl-4">
                  {/* ponto no trilho */}
                  <span
                    aria-hidden
                    className={`absolute -left-[6px] top-[18px] h-3 w-3 rounded-full ${
                      state === "now"
                        ? "bg-[var(--mv-brand)] ring-4 ring-[var(--mv-brand)]/20"
                        : state === "next"
                          ? "border-2 border-[var(--mv-brand)] bg-[var(--mv-surface)]"
                          : state === "cancelled"
                            ? "bg-red-400"
                            : "bg-[var(--mv-text-soft)]/40"
                    }`}
                  />

                  <article
                    className={`overflow-hidden rounded-2xl transition-colors ${
                      state === "now"
                        ? "bg-[var(--mv-brand-50)] ring-1 ring-[var(--mv-brand)]/50"
                        : state === "next"
                          ? "bg-[var(--mv-brand-50)]"
                          : "border border-[var(--mv-line)]"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedId(open ? null : s.id)}
                      aria-expanded={open}
                      className={`w-full p-3 text-left sm:p-3.5 ${quiet && !open ? "opacity-70" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <p
                          className={`min-w-0 flex-1 truncate font-semibold text-[var(--mv-text)] ${
                            state === "cancelled" ? "line-through" : ""
                          }`}
                        >
                          {s.name}
                        </p>
                        {state !== "next" && (
                          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${chip[state].cls}`}>
                            {state === "now" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
                            {chip[state].label}
                          </span>
                        )}
                        <ChevronDown
                          className={`h-[18px] w-[18px] flex-shrink-0 text-[var(--mv-text-soft)] transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </div>

                      <p className="mt-1.5 flex items-center gap-2 text-sm text-[var(--mv-text-soft)]">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--mv-brand-100)] text-[10px] font-bold text-[var(--mv-brand-700)]">
                          {initials(s.professor?.name ?? "?")}
                        </span>
                        <span className="truncate">{s.professor?.name ?? "Sem professor"}</span>
                        <span className="flex-shrink-0">· {s.durationMin} min</span>
                      </p>

                      {state !== "cancelled" && (
                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--mv-brand-100)]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(1, count / s.capacity) * 100}%`,
                                background: full ? "var(--mv-accent)" : "var(--mv-brand)",
                              }}
                            />
                          </div>
                          <span
                            className={`text-sm font-semibold tabular-nums ${full ? "text-[var(--mv-accent)]" : "text-[var(--mv-text)]"}`}
                          >
                            {full ? "Lotada" : `${count}/${s.capacity}`}
                          </span>
                        </div>
                      )}

                      {belowMin && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                          Faltam {s.minCapacity - count} para o mínimo de {s.minCapacity}
                        </p>
                      )}
                    </button>

                    {open && (
                      // cinza neutro (texto 5% na superfície): marca onde o card termina nos dois temas
                      <div className="border-t border-[var(--mv-line)] bg-[color-mix(in_oklch,var(--mv-text)_5%,var(--mv-surface))] p-3 sm:p-3.5">
                        <SessionDetail session={s} />
                      </div>
                    )}
                  </article>
                </div>
              </li>
              </Fragment>
            );
          })}
          {nowMarkerAt === sessions.length && nowMarker}
        </ul>
      )}
    </section>
  );
}
