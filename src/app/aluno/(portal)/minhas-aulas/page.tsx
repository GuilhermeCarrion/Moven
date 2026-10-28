"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
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
const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

type Tone = { card: string; text: string; dot: string };
const EMERALD: Tone = {
  card: "border-emerald-200 bg-emerald-50/60",
  text: "text-emerald-700",
  dot: "bg-emerald-500",
};
const AMBER: Tone = {
  card: "border-amber-200 bg-amber-50/60",
  text: "text-amber-700",
  dot: "bg-amber-500",
};
const ROSE: Tone = {
  card: "border-rose-200 bg-rose-50/60",
  text: "text-rose-600",
  dot: "bg-rose-500",
};
const NEUTRAL: Tone = {
  card: "border-white/70 bg-white/55",
  text: "text-slate-500",
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
      return "bg-rose-500";
    case "RESCHEDULED":
      return "bg-amber-500";
    case "BOOKED":
      return "bg-cyan-500";
    case "DEBITED":
    case "ABSENT":
      return "bg-slate-400";
    default:
      return "bg-slate-300";
  }
}

function Card({
  g,
  headline,
  children,
}: {
  g: ClassHistory;
  headline: Headline;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`overflow-hidden rounded-2xl border shadow-sm backdrop-blur-xl ${headline.card}`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
      >
        <div className="min-w-0">
          <div className="truncate font-semibold text-slate-800">
            {g.className}
          </div>
          <div className="mt-1 text-sm capitalize text-slate-500">
            {dateLabel(g.startAt)} · {time(g.startAt)}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold ${headline.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${headline.dot}`} />
            {headline.label}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {children}

      {open && (
        <div className="border-t border-white/50 bg-white/40 p-4">
          <ol className="space-y-3">
            {g.events.map((e, i) => (
              <li key={i} className="flex gap-3">
                <div
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${eventDot(e.type)}`}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-700">
                    {eventLabel(e)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {actorLabel(e)} · {dateTime(e.createdAt)}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function MinhasAulasPage() {
  const { data, isLoading } = useStudentHistory();
  const action = useAppointmentAction();
  const { data: credits } = useStudentCredits();
  const windowH = credits?.cancelWindowHours ?? 4;
  const now = Date.now();

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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-slate-800">Minhas Aulas</h1>

      {isLoading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : groups.length === 0 ? (
        <p className="rounded-2xl border border-white/60 bg-white/40 p-6 text-center text-sm text-slate-400">
          Você ainda não tem aulas. Vá em <b>Aulas</b> para agendar.
        </p>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-600">Próximas</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma aula futura.</p>
            ) : (
              upcoming.map((g) => {
                const a = g.activeAppointment!;
                const busy = actingId === a.id;
                const dl = cancelDeadline(g.startAt, windowH);
                return (
                  <Card
                    key={g.classSessionId}
                    g={g}
                    headline={futureHeadline(a)}
                  >
                    <p className="px-4 pb-3 text-xs text-slate-500">
                      {dl.open
                        ? `Cancele sem custo até ${dl.label}`
                        : "Crédito debitado · cancelamento encerrado"}
                    </p>
                    <div className="flex gap-2 px-4 pb-4 empty:hidden">
                      {a.status === "BOOKED" && (
                        <button
                          disabled={busy}
                          onClick={() => onAction(a.id, "confirm")}
                          className="flex-[3] rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-focus)] disabled:opacity-60"
                        >
                          Confirmar
                        </button>
                      )}
                      {dl.open && (
                        <button
                          disabled={busy}
                          onClick={() => onAction(a.id, "cancel")}
                          className="flex-1 rounded-xl border border-rose-200 bg-white/70 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-600">Histórico</h2>
            {history.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma aula anterior.</p>
            ) : (
              history.map((g) => (
                <Card
                  key={g.classSessionId}
                  g={g}
                  headline={historyHeadline(g.events)}
                />
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
