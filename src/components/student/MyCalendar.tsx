"use client";

import { useState } from "react";
import { MonthCalendar } from "@/components/schedule/MonthCalendar";
import {
  ClassHistory,
  HistoryEvent,
  useStudentHistory,
} from "@/hooks/useStudentHistory";
import { useStudentRecurrence } from "@/hooks/useStudentRecurrence";
import { upcomingOccurrences } from "@/lib/schedule";

/** Aulas do próprio aluno: status de cada uma e o calendário do mês (Minhas aulas e Aulas). */

// mesmo formato de chave do MonthCalendar
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
export const sameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);
const byDate = (a: ClassHistory, b: ClassHistory) =>
  +new Date(a.startAt) - +new Date(b.startAt);

// Tons de status (chip + ponto), com variante para o escuro
type Tone = { chip: string; dot: string };
const EMERALD: Tone = {
  chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  dot: "bg-emerald-500",
};
export const AMBER: Tone = {
  chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  dot: "bg-amber-500",
};
const ROSE: Tone = {
  chip: "bg-red-500/10 text-red-600 dark:text-red-300",
  dot: "bg-red-500",
};
const NEUTRAL: Tone = {
  chip: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  dot: "bg-slate-400",
};
// pontinho vazado: dia da agenda fixa sem reserva
export const HOLLOW = "border-[1.5px] border-amber-500";

// off: o aluno não foi nem vai (cancelada/remarcada), fica fora do calendário
export type Headline = Tone & { label: string; off?: boolean };

export function futureHeadline(
  a: NonNullable<ClassHistory["activeAppointment"]>,
): Headline {
  if (a.status === "CONFIRMED") return { label: "Confirmada", ...EMERALD };
  if (a.confirmationSentAt) return { label: "Não respondido", ...AMBER };
  return { label: "A confirmar", ...NEUTRAL };
}

export function historyHeadline(events: HistoryEvent[]): Headline {
  const att = [...events]
    .reverse()
    .find((e) => ["PRESENT", "ABSENT", "NO_SHOW"].includes(e.type));
  if (att) {
    if (att.type === "PRESENT") return { label: "Compareceu", ...EMERALD };
    if (att.type === "ABSENT") return { label: "Faltou (avisou)", ...NEUTRAL };
    return { label: "Não avisado", ...ROSE };
  }
  const last = [...events]
    .reverse()
    .find((e) =>
      ["BOOKED", "CONFIRMED", "CANCELLED", "RESCHEDULED"].includes(e.type),
    );
  if (last?.type === "CANCELLED")
    return { label: "Cancelada", ...ROSE, off: true };
  if (last?.type === "RESCHEDULED")
    return { label: "Remarcada", ...NEUTRAL, off: true };
  return { label: "Finalizada", ...EMERALD };
}

// Calendário: azul = marcada, verde = confirmada ou presente, vermelho = falta
function calDot(g: ClassHistory, upcoming: boolean): string | null {
  if (upcoming)
    return g.activeAppointment!.status === "CONFIRMED"
      ? "bg-emerald-500"
      : "bg-[var(--mv-brand)]";
  const h = historyHeadline(g.events);
  if (h.off) return null;
  return h.dot === EMERALD.dot ? "bg-emerald-500" : "bg-red-500";
}

/** Histórico do aluno separado em próximas/anteriores + as falhas da agenda fixa e os pontinhos do mês. */
export function useMyClasses() {
  const { data, isLoading } = useStudentHistory();
  const { data: rec } = useStudentRecurrence();
  const now = Date.now();

  const groups = [...(data ?? [])].sort(byDate);
  const isUpcoming = (g: ClassHistory) =>
    !!g.activeAppointment && new Date(g.startAt).getTime() >= now;
  const upcoming = groups.filter(isUpcoming);
  const history = groups.filter((g) => !isUpcoming(g)).reverse();

  // Agenda fixa: datas dos próximos 30 dias (mesma conta da recorrência) sem reserva ativa
  const booked = new Set(upcoming.map((g) => +new Date(g.startAt)));
  const gaps = rec
    ? upcomingOccurrences(
        rec.slots.filter((s) => rec.mine.includes(s.id)),
      ).filter((o) => !booked.has(+o.startAt))
    : [];

  const sessionsByDay = new Map<
    string,
    { id: string; name: string; dot?: string }[]
  >();
  const put = (d: Date, item: { id: string; name: string; dot: string }) =>
    sessionsByDay.set(dayKey(d), [...(sessionsByDay.get(dayKey(d)) ?? []), item]);
  for (const g of groups) {
    const dot = calDot(g, isUpcoming(g));
    if (dot)
      put(new Date(g.startAt), { id: g.classSessionId, name: g.className, dot });
  }
  for (const o of gaps)
    put(o.startAt, { id: `${o.slot.id}-${+o.startAt}`, name: o.slot.name, dot: HOLLOW });

  return {
    isLoading,
    groups,
    upcoming,
    history,
    isUpcoming,
    gaps,
    sessionsByDay,
    hasFixed: !!rec?.mine.length,
  };
}

/** Calendário do mês com as aulas do aluno (cor por status) e a legenda. */
export function MyCalendar({
  selected,
  onSelect,
}: {
  selected: Date;
  onSelect: (d: Date) => void;
}) {
  const { sessionsByDay, hasFixed } = useMyClasses();
  const [cursor, setCursor] = useState(selected);
  const legend = [
    ["bg-[var(--mv-brand)]", "Agendada"],
    ["bg-emerald-500", "Confirmada ou presente"],
    ["bg-red-500", "Falta"],
    ...(hasFixed ? [[HOLLOW, "Agenda fixa sem reserva"]] : []),
  ];

  return (
    <div className="space-y-3">
      <MonthCalendar
        cursor={cursor}
        selected={selected}
        sessionsByDay={sessionsByDay}
        onSelect={onSelect}
        onPrev={() =>
          setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))
        }
        onNext={() =>
          setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))
        }
        onToday={() => {
          setCursor(new Date());
          onSelect(new Date());
        }}
      />
      <p className="flex flex-wrap gap-x-4 gap-y-1.5 px-1 text-xs font-medium text-[var(--mv-text-soft)]">
        {legend.map(([dot, label]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${dot}`} /> {label}
          </span>
        ))}
      </p>
    </div>
  );
}
