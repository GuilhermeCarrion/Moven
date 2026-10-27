"use client";

import { CloudField } from "@/components/landing/CloudField";
import { initials } from "@/components/layout/Sidebar";
import { ConfirmDialog } from "@/components/student/ConfirmDialog";
import { useStudentCredits } from "@/hooks/useStudentCredits";
import {
  StudentClass,
  useAppointmentAction,
  useBookClass,
  useStudentClasses,
} from "@/hooks/useStudentClasses";
import { apiError } from "@/lib/apiError";
import { willRefund } from "@/lib/cancelWindow";
import { CheckCheck, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";

// ── helpers de data ──
const atMidnight = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const startOfWeek = (d: Date) =>
  addDays(atMidnight(d), -atMidnight(d).getDay()); // domingo
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const hhmm = (d: Date) =>
  d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
type Filter = "todos" | "disponivel" | "indisponivel";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "todos", label: "Todas" },
  { value: "disponivel", label: "Disponíveis" },
  { value: "indisponivel", label: "Indisponíveis" },
];

// ── máquina de estado do card (espelha a tabela da doc) ──
type CardKind =
  | "available"
  | "booked"
  | "confirmed"
  | "full"
  | "past"
  | "closed";
function cardKind(c: StudentClass): CardKind {
  if (c.myAppointment)
    return c.myAppointment.status === "CONFIRMED" ? "confirmed" : "booked";
  if (new Date(c.startAt).getTime() < Date.now()) return "past";
  if (c.status !== "OPEN") return "closed";
  if (c.booked >= c.capacity) return "full";
  return "available";
}
function matchesFilter(c: StudentClass, f: Filter) {
  if (f === "todos") return true;
  const k = cardKind(c);
  if (f === "disponivel") return k === "available";
  return k === "full" || k === "past" || k === "closed"; // indisponível
}

const chip: Partial<Record<CardKind, { label: string; cls: string }>> = {
  booked: { label: "Agendada", cls: "bg-[var(--mv-brand)] text-white" },
  confirmed: {
    label: "Confirmada",
    cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  full: { label: "Lotada", cls: "bg-[var(--mv-accent)]/15 text-[var(--mv-accent)]" },
  past: { label: "Encerrada", cls: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
  closed: { label: "Fechada", cls: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
};

const bigBtn =
  "flex h-12 items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition-all disabled:opacity-60";

export default function AulasPage() {
  const [selected, setSelected] = useState(() => atMidnight(new Date()));
  const [filter, setFilter] = useState<Filter>("todos");

  const weekStart = startOfWeek(selected);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const range = {
    from: weekStart.toISOString(),
    to: addDays(weekStart, 7).toISOString(),
  };

  const { data, isLoading } = useStudentClasses(range);
  const { data: creditsData } = useStudentCredits();
  const credits = creditsData?.credits ?? 0;
  const book = useBookClass();
  const action = useAppointmentAction();

  const dayClasses = (data ?? [])
    .filter((c) => sameDay(new Date(c.startAt), selected))
    .filter((c) => matchesFilter(c, filter))
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  // pontinhos da semana = aulas do próprio aluno (agendada/confirmada; presença não muda o status)
  const countOn = (d: Date) =>
    (data ?? []).filter((c) => c.myAppointment && sameDay(new Date(c.startAt), d)).length;

  const bookingId = book.isPending ? (book.variables as string) : null;
  const actingId = action.isPending
    ? (action.variables as { id: string }).id
    : null;

  const onBook = (c: StudentClass) =>
    book.mutate(c.id, {
      onSuccess: () => toast.success("Aula agendada! 1 crédito usado."),
      onError: (e) => toast.error(apiError(e)),
    });
  const onAction = (id: string, act: "confirm" | "cancel") =>
    action.mutate(
      { id, action: act },
      {
        onSuccess: () =>
          toast.success(
            act === "confirm" ? "Presença confirmada" : "Agendamento cancelado",
          ),
        onError: (e) => toast.error(apiError(e)),
      },
    );

  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const requestCancel = (apptId: string, startAt: string) => {
    if (willRefund(startAt))
      onAction(apptId, "cancel"); // estorna -> cancela direto
    else setConfirmCancel(apptId); // Sem estorno => avisa
  };

  // shortcut: "agora" é calculado no render (não anda sozinho); atualiza a cada clique/refetch
  const now = new Date();
  const isToday = sameDay(selected, now);
  const nextIdx = dayClasses.findIndex((c) => new Date(c.startAt) > now);
  const nowMarkerAt = isToday ? (nextIdx === -1 ? dayClasses.length : nextIdx) : -1;

  const monthLabel = weekStart.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const dayLabel = selected.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const nowMarker = (
    <li className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-3">
      <span className="text-right text-xs font-bold tabular-nums text-[var(--mv-accent)]">
        {hhmm(now)}
      </span>
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
    <div className="space-y-4">
      {/* Semana: setas, mês e os 7 dias */}
      <section className="rounded-[22px] border border-[var(--mv-line)] bg-[var(--mv-surface)] p-3 shadow-[0_1px_2px_rgb(11_21_48/0.04)]">
        <div className="mb-2 flex items-center gap-1">
          <button
            onClick={() => setSelected((d) => addDays(d, -7))}
            aria-label="Semana anterior"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--mv-text-soft)] transition-colors hover:bg-[var(--mv-brand-50)]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="flex-1 text-center font-bold text-[var(--mv-text)] first-letter:uppercase">
            {monthLabel}
          </h2>
          <button
            onClick={() => setSelected((d) => addDays(d, 7))}
            aria-label="Próxima semana"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--mv-text-soft)] transition-colors hover:bg-[var(--mv-brand-50)]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d) => {
            const active = sameDay(d, selected);
            const today = sameDay(d, now);
            const n = countOn(d);
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelected(d)}
                aria-pressed={active}
                aria-label={`${d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric" })}${n ? `, ${n} ${n === 1 ? "aula sua" : "aulas suas"}` : ""}`}
                className={`flex flex-col items-center gap-1 rounded-2xl py-2.5 transition-colors ${
                  active
                    ? "bg-[var(--mv-brand)] text-white shadow-[0_10px_22px_-12px_var(--mv-brand)]"
                    : "text-[var(--mv-text)] hover:bg-[var(--mv-brand-50)]"
                }`}
              >
                <span className={`mv-mono text-[10px] uppercase tracking-[0.08em] ${active ? "text-white/80" : "text-[var(--mv-text-soft)]"}`}>
                  {WEEKDAYS[d.getDay()]}
                </span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-base font-bold tabular-nums ${
                    today && !active ? "ring-2 ring-[var(--mv-brand)] text-[var(--mv-brand-700)]" : ""
                  }`}
                >
                  {d.getDate()}
                </span>
                {/* um pontinho por aula sua (até 3) */}
                <span className="flex h-1.5 gap-0.5">
                  {Array.from({ length: Math.min(n, 3) }, (_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-[var(--mv-brand)]"}`}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Dia escolhido + filtro */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="font-semibold text-[var(--mv-text)] first-letter:uppercase">
          {dayLabel}
          {!isToday && (
            <button
              onClick={() => setSelected(atMidnight(new Date()))}
              className="ml-2 text-sm font-semibold text-[var(--mv-brand-700)] underline-offset-4 hover:underline"
            >
              Voltar para hoje
            </button>
          )}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-[var(--mv-line)] bg-[var(--mv-surface)] p-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`h-10 rounded-lg text-sm font-semibold transition-colors ${
              filter === f.value
                ? "bg-[var(--mv-brand-100)] text-[var(--mv-brand-700)]"
                : "text-[var(--mv-text-soft)] hover:bg-[var(--mv-brand-50)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Linha do tempo do dia */}
      {isLoading ? (
        <p className="py-8 text-center text-[var(--mv-text-soft)]">Carregando...</p>
      ) : dayClasses.length === 0 ? (
        <div className="relative overflow-hidden rounded-[22px] border border-dashed border-[var(--mv-line)] bg-[var(--mv-surface)]/60 px-4 py-14 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_85%)]"
            style={{ "--mv-ambient-alpha": 0.45 } as React.CSSProperties}
          >
            <CloudField ambient spotlight={false} />
          </div>
          <p className="relative font-semibold text-[var(--mv-text)]">
            {filter === "todos" ? "Nenhuma aula neste dia" : "Nada com esse filtro"}
          </p>
          <p className="relative mt-1 text-sm text-[var(--mv-text-soft)]">
            {filter === "todos" ? "Toque em outro dia da semana." : "Troque o filtro ou o dia."}
          </p>
        </div>
      ) : (
        <ul className="relative space-y-3 before:absolute before:bottom-6 before:left-[60px] before:top-6 before:w-px before:bg-[var(--mv-line)]">
          {dayClasses.map((c, i) => {
            const kind = cardKind(c);
            const start = new Date(c.startAt);
            const end = new Date(start.getTime() + c.durationMin * 60000);
            const free = Math.max(0, c.capacity - c.booked);
            const mine = kind === "booked" || kind === "confirmed";
            const quiet = kind === "past" || kind === "closed";
            const busy =
              bookingId === c.id ||
              (!!c.myAppointment && actingId === c.myAppointment.id);
            return (
              <Fragment key={c.id}>
                {i === nowMarkerAt && nowMarker}
                <li className="grid grid-cols-[48px_minmax(0,1fr)] gap-3">
                  <div className={`pt-4 text-right ${quiet ? "opacity-60" : ""}`}>
                    <p className="text-sm font-bold tabular-nums text-[var(--mv-text)]">{hhmm(start)}</p>
                    <p className="text-xs tabular-nums text-[var(--mv-text-soft)]">{hhmm(end)}</p>
                  </div>

                  <div className="relative pl-4">
                    <span
                      aria-hidden
                      className={`absolute -left-[6px] top-[20px] h-3 w-3 rounded-full ${
                        mine
                          ? "bg-[var(--mv-brand)] ring-4 ring-[var(--mv-brand)]/20"
                          : kind === "available"
                            ? "border-2 border-[var(--mv-brand)] bg-[var(--mv-surface)]"
                            : "bg-[var(--mv-text-soft)]/40"
                      }`}
                    />

                    <article
                      className={`rounded-2xl p-4 ${
                        mine
                          ? "bg-[var(--mv-brand-50)] ring-1 ring-[var(--mv-brand)]/50"
                          : kind === "available"
                            ? "border border-[var(--mv-line)] bg-[var(--mv-surface)] shadow-[0_1px_2px_rgb(11_21_48/0.04)]"
                            : "border border-[var(--mv-line)]"
                      }`}
                    >
                      <div className={quiet ? "opacity-70" : ""}>
                        <div className="flex items-start gap-2">
                          <p className="min-w-0 flex-1 text-[17px] font-bold leading-snug text-[var(--mv-text)]">
                            {c.name}
                          </p>
                          {chip[kind] && (
                            <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip[kind].cls}`}>
                              {chip[kind].label}
                            </span>
                          )}
                        </div>

                        {c.professorName && (
                          <p className="mt-1.5 flex items-center gap-2 text-sm text-[var(--mv-text-soft)]">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--mv-brand-100)] text-[10px] font-bold text-[var(--mv-brand-700)]">
                              {initials(c.professorName)}
                            </span>
                            <span className="truncate">{c.professorName}</span>
                            <span className="flex-shrink-0">· {c.durationMin} min</span>
                          </p>
                        )}

                        {!quiet && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--mv-brand-100)]">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(1, c.booked / c.capacity) * 100}%`,
                                  background: free === 0 ? "var(--mv-accent)" : "var(--mv-brand)",
                                }}
                              />
                            </div>
                            <span
                              className={`text-sm font-semibold tabular-nums ${free === 0 ? "text-[var(--mv-accent)]" : "text-[var(--mv-text)]"}`}
                            >
                              {free === 0 ? "Sem vagas" : `${free} ${free === 1 ? "vaga" : "vagas"}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Ações por estado */}
                      {kind === "available" && (
                        <button
                          disabled={busy || credits === 0}
                          onClick={() => onBook(c)}
                          className={`${bigBtn} mt-4 w-full bg-[var(--mv-brand)] text-white shadow-[0_12px_28px_-14px_var(--mv-brand)] hover:brightness-110`}
                        >
                          {busy ? (
                            <>
                              <Loader2 className="h-[18px] w-[18px] animate-spin" /> Agendando…
                            </>
                          ) : credits === 0 ? (
                            "Sem créditos para agendar"
                          ) : (
                            <>
                              Agendar <span className="font-normal text-white/80">· 1 crédito</span>
                            </>
                          )}
                        </button>
                      )}
                      {kind === "booked" && (
                        <div className="mt-4 flex gap-2">
                          <button
                            disabled={busy}
                            onClick={() => onAction(c.myAppointment!.id, "confirm")}
                            className={`${bigBtn} flex-1 bg-[var(--mv-brand)] text-white shadow-[0_12px_28px_-14px_var(--mv-brand)] hover:brightness-110`}
                          >
                            <CheckCheck className="h-[18px] w-[18px]" /> Confirmar
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => requestCancel(c.myAppointment!.id, c.startAt)}
                            className={`${bigBtn} border border-red-500/30 px-4 text-red-600 hover:bg-red-500/10 dark:text-red-300`}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                      {kind === "confirmed" && (
                        <div className="mt-4 flex items-center justify-between gap-2">
                          <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            <CheckCheck className="h-4 w-4" /> Presença confirmada
                          </p>
                          <button
                            disabled={busy}
                            onClick={() => requestCancel(c.myAppointment!.id, c.startAt)}
                            className={`${bigBtn} px-4 text-red-600 hover:bg-red-500/10 dark:text-red-300`}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </article>
                  </div>
                </li>
              </Fragment>
            );
          })}
          {nowMarkerAt === dayClasses.length && nowMarker}
        </ul>
      )}

      <ConfirmDialog
        open={!!confirmCancel}
        title="Cancelar sem devolver o crédito?"
        message="Faltam menos de 2 horas para a aula. Se cancelar agora, o crédito não será devolvido."
        confirmLabel="Cancelar mesmo assim"
        onCancel={() => setConfirmCancel(null)}
        onConfirm={() => {
          if (confirmCancel) onAction(confirmCancel, "cancel");
          setConfirmCancel(null);
        }}
      />
    </div>
  );
}
