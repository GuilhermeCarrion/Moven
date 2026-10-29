"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCheck, ChevronDown, Clock } from "lucide-react";
import Link from "next/link";
import {
  ClassHistory,
  HistoryEvent,
  useStudentHistory,
} from "@/hooks/useStudentHistory";
import { useAppointmentAction } from "@/hooks/useStudentClasses";
import { apiError } from "@/lib/apiError";
import { cancelDeadline } from "@/lib/cancelWindow";
import { useStudentCredits } from "@/hooks/useStudentCredits";

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
const part = (iso: string, opt: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString("pt-BR", opt).replace(".", "");

// Tons de status (chip + ponto), com variante para o escuro
type Tone = { chip: string; dot: string };
const EMERALD: Tone = {
  chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  dot: "bg-emerald-500",
};
const AMBER: Tone = {
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

type Headline = Tone & { label: string };

function futureHeadline(
  a: NonNullable<ClassHistory["activeAppointment"]>,
): Headline {
  if (a.status === "CONFIRMED") return { label: "Confirmada", ...EMERALD };
  if (a.confirmationSentAt) return { label: "Não respondido", ...AMBER };
  return { label: "Aguardando confirmação", ...NEUTRAL };
}

function historyHeadline(events: HistoryEvent[]): Headline {
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
  if (last?.type === "CANCELLED") return { label: "Cancelada", ...ROSE };
  if (last?.type === "RESCHEDULED") return { label: "Remarcada", ...NEUTRAL };
  return { label: "Finalizada", ...EMERALD };
}

function eventLabel(e: HistoryEvent): string {
  switch (e.type) {
    case "BOOKED":
      return "Agendou";
    case "CONFIRMED":
      return "Confirmou presença";
    case "CANCELLED":
      return `Cancelada · ${
        e.creditRefunded === null
          ? "sem custo"
          : e.creditRefunded
            ? "crédito devolvido"
            : "crédito não devolvido"
      }`;
    case "RESCHEDULED":
      return "Remarcou";
    case "PRESENT":
      return "Compareceu";
    case "ABSENT":
      return "Faltou (avisou)";
    case "DEBITED":
      return "Crédito debitado";
    case "NO_SHOW":
      return "Não avisado";
  }
}

function actorLabel(e: HistoryEvent): string {
  if (e.note) return e.note; // ex.: "via WhatsApp"
  if (e.actorType === "STAFF") return "pela academia";
  if (e.actorType === "SYSTEM") return "automático";
  return "por você";
}

function eventDot(type: HistoryEvent["type"]): string {
  switch (type) {
    case "CONFIRMED":
    case "PRESENT":
      return "bg-emerald-500";
    case "CANCELLED":
    case "NO_SHOW":
      return "bg-red-500";
    case "RESCHEDULED":
      return "bg-amber-500";
    case "BOOKED":
      return "bg-[var(--mv-brand)]";
    default:
      return "bg-slate-400";
  }
}

/** Aula com bloco de data; toca para ver o que aconteceu (linha do tempo de eventos). */
function Card({
  g,
  headline,
  upcoming = false,
  children,
}: {
  g: ClassHistory;
  headline: Headline;
  upcoming?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li
      className={`overflow-hidden rounded-[22px] border border-[var(--mv-line)] bg-[var(--mv-surface)] shadow-[0_1px_2px_rgb(11_21_48/0.04)]`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3.5 p-3.5 text-left"
      >
        {/* bloco de data: sólido nas próximas, claro no histórico */}
        <span
          className={`flex h-[60px] w-[56px] flex-shrink-0 flex-col items-center justify-center rounded-2xl leading-none ${
            upcoming
              ? "bg-[linear-gradient(135deg,var(--mv-brand),color-mix(in_oklch,var(--mv-brand)_72%,black))] text-white"
              : "bg-[var(--mv-brand-50)] text-[var(--mv-brand-700)]"
          }`}
        >
          <span className="mv-mono text-[10px] uppercase tracking-[0.12em] opacity-80">
            {part(g.startAt, { weekday: "short" })}
          </span>
          <span className="mt-1 text-2xl font-bold tabular-nums">
            {new Date(g.startAt).getDate()}
          </span>
          <span className="mv-mono mt-0.5 text-[10px] uppercase opacity-80">
            {part(g.startAt, { month: "short" })}
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[17px] font-bold text-[var(--mv-text)]">
            {g.className}
          </span>
          <span className="mt-0.5 block text-sm tabular-nums text-[var(--mv-text-soft)]">
            {time(g.startAt)}
          </span>
          <span
            className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${headline.chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${headline.dot}`} />
            {headline.label}
          </span>
        </span>

        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-[var(--mv-text-soft)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {children}

      {open && (
        <div className="border-t border-[var(--mv-line)] bg-[color-mix(in_oklch,var(--mv-text)_4%,var(--mv-surface))] px-4 py-4">
          <ol className="relative space-y-3 before:absolute before:bottom-2 before:left-[4px] before:top-2 before:w-px before:bg-[var(--mv-line)]">
            {g.events.map((e, i) => (
              <li key={i} className="relative flex gap-3">
                <span
                  className={`relative mt-1.5 h-[9px] w-[9px] flex-shrink-0 rounded-full ring-2 ring-[var(--mv-surface)] ${eventDot(e.type)}`}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[var(--mv-text)]">
                    {eventLabel(e)}
                  </span>
                  <span className="block text-xs tabular-nums text-[var(--mv-text-soft)]">
                    {actorLabel(e)} · {dateTime(e.createdAt)}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </li>
  );
}

export default function MinhasAulasPage() {
  const { data, isLoading } = useStudentHistory();
  const action = useAppointmentAction();
  const { data: credits } = useStudentCredits();
  const windowH = credits?.cancelWindowHours ?? 4;
  const now = Date.now();
  const [tab, setTab] = useState<"proximas" | "historico">("proximas");

  const actingId = action.isPending
    ? (action.variables as { id: string }).id
    : null;
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

  const groups = data ?? [];
  const isUpcoming = (g: ClassHistory) =>
    !!g.activeAppointment && new Date(g.startAt).getTime() >= now;
  const upcoming = groups
    .filter(isUpcoming)
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const history = groups
    .filter((g) => !isUpcoming(g))
    .sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt));

  const tabs = [
    { value: "proximas" as const, label: "Próximas", n: upcoming.length },
    { value: "historico" as const, label: "Histórico", n: history.length },
  ];

  const empty = (text: string, cta = false) => (
    <div className="rounded-[22px] border border-dashed border-[var(--mv-line)] bg-[var(--mv-surface)]/60 px-4 py-10 text-center">
      <p className="text-[var(--mv-text-soft)]">{text}</p>
      {cta && (
        <Link
          href="/aluno/aulas"
          className="mt-4 inline-flex h-12 items-center rounded-xl bg-[var(--mv-brand)] px-6 font-semibold text-white shadow-[0_12px_28px_-14px_var(--mv-brand)]"
        >
          Ver aulas para agendar
        </Link>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-[var(--mv-line)] bg-[var(--mv-surface)] p-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            aria-pressed={tab === t.value}
            className={`flex h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.value
                ? "bg-[var(--mv-brand-100)] text-[var(--mv-brand-700)]"
                : "text-[var(--mv-text-soft)] hover:bg-[var(--mv-brand-50)]"
            }`}
          >
            {t.label}
            <span className="tabular-nums opacity-70">{t.n}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-[var(--mv-text-soft)]">Carregando...</p>
      ) : tab === "proximas" ? (
        upcoming.length === 0 ? (
          empty("Nenhuma aula marcada por enquanto.", true)
        ) : (
          <ul className="space-y-3">
            {upcoming.map((g) => {
              const a = g.activeAppointment!;
              const busy = actingId === a.id;
              const dl = cancelDeadline(g.startAt, windowH);
              return (
                <Card
                  key={g.classSessionId}
                  g={g}
                  headline={futureHeadline(a)}
                  upcoming
                >
                  <div className="px-3.5 pb-3.5">
                    <p
                      className={`flex items-center gap-1.5 text-sm ${
                        dl.open
                          ? "text-[var(--mv-text-soft)]"
                          : "text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      {dl.open
                        ? `Cancele sem custo até ${dl.label}`
                        : "Crédito debitado · cancelamento encerrado"}
                    </p>
                    <div className="mt-3 flex gap-2 empty:hidden">
                      {a.status === "BOOKED" && (
                        <button
                          disabled={busy}
                          onClick={() => onAction(a.id, "confirm")}
                          className="flex h-12 flex-[3] items-center justify-center gap-2 rounded-xl bg-[var(--mv-brand)] font-semibold text-white shadow-[0_12px_28px_-14px_var(--mv-brand)] transition-all hover:brightness-110 disabled:opacity-60"
                        >
                          <CheckCheck className="h-[18px] w-[18px]" /> Confirmar
                        </button>
                      )}
                      {dl.open && (
                        <button
                          disabled={busy}
                          onClick={() => onAction(a.id, "cancel")}
                          className="flex h-12 flex-1 items-center justify-center rounded-xl border border-red-500/30 px-4 font-semibold text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-60 dark:text-red-300"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </ul>
        )
      ) : history.length === 0 ? (
        empty("Suas aulas anteriores aparecem aqui.")
      ) : (
        <ul className="space-y-3">
          {history.map((g) => (
            <Card
              key={g.classSessionId}
              g={g}
              headline={historyHeadline(g.events)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
