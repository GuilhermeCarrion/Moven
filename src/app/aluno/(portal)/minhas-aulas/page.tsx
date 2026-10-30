"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, CheckCheck, ChevronDown, Clock } from "lucide-react";
import Link from "next/link";
import {
  AMBER,
  futureHeadline,
  Headline,
  historyHeadline,
  HOLLOW,
  MyCalendar,
  sameDay,
  useMyClasses,
} from "@/components/student/MyCalendar";
import { ClassHistory, HistoryEvent } from "@/hooks/useStudentHistory";
import { useAppointmentAction } from "@/hooks/useStudentClasses";
import { apiError } from "@/lib/apiError";
import { cancelDeadline } from "@/lib/cancelWindow";
import { useStudentCredits } from "@/hooks/useStudentCredits";
import { useSlideIn } from "@/hooks/useSlideIn";

const TABS = ["proximas", "historico", "calendario"] as const;
// entrada de conteúdo trocado (aba, dia do calendário): remonta pela key e aparece suave
const enter = "motion-safe:animate-in fade-in-0 duration-300 ease-out";

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
const startOfWeek = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay()); // domingo, como em Aulas
  return x;
};

// Grupos da lista: as semanas perto de hoje, depois o mês
function bucket(iso: string, now: Date) {
  const d = new Date(iso);
  const weeks = Math.round(
    (+startOfWeek(d) - +startOfWeek(now)) / (7 * 86_400_000),
  );
  if (weeks === 0) return "Esta semana";
  if (weeks === 1) return "Próxima semana";
  if (weeks === -1) return "Semana passada";
  return d.toLocaleDateString("pt-BR", {
    month: "long",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
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

const listCls =
  "divide-y divide-[var(--mv-line)] overflow-hidden rounded-[22px] border border-[var(--mv-line)] bg-[var(--mv-surface)] shadow-[0_1px_2px_rgb(11_21_48/0.04)]";

/** Linha compacta da aula; toca para ver prazo, ações e o que aconteceu (linha do tempo). */
function Row({
  g,
  headline,
  upcoming = false,
  defaultOpen = false,
  children,
}: {
  g: ClassHistory;
  headline: Headline;
  upcoming?: boolean;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <li>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-[var(--mv-brand-50)]"
      >
        {/* data: na cor da marca nas próximas, apagada no histórico */}
        <span
          className={`flex w-10 flex-shrink-0 flex-col items-center leading-none ${
            upcoming
              ? "text-[var(--mv-brand-700)]"
              : "text-[var(--mv-text-soft)]"
          }`}
        >
          <span className="mv-mono text-[10px] uppercase tracking-[0.12em]">
            {part(g.startAt, { weekday: "short" })}
          </span>
          <span className="mt-1 text-xl font-bold tabular-nums">
            {new Date(g.startAt).getDate()}
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-[var(--mv-text)]">
            {g.className}
          </span>
          <span className="block text-sm tabular-nums text-[var(--mv-text-soft)]">
            {time(g.startAt)}
          </span>
        </span>

        <span
          className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${headline.chip}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${headline.dot}`} />
          {headline.label}
        </span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-[var(--mv-text-soft)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* abre e fecha deslizando (linhas da grade de 0fr a 1fr); fechado fica inerte */}
      <div
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        {/* o padding fica no filho: com ele aqui a altura não chegaria a 0 */}
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-4 border-t border-[var(--mv-line)] bg-[color-mix(in_oklch,var(--mv-text)_4%,var(--mv-surface))] px-4 py-4">
            {children}
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
        </div>
      </div>
    </li>
  );
}

export default function MinhasAulasPage() {
  const { isLoading, groups, upcoming, history, isUpcoming, gaps } =
    useMyClasses();
  const action = useAppointmentAction();
  const { data: credits } = useStudentCredits();
  const windowH = credits?.cancelWindowHours ?? 4;
  const nowD = new Date();
  const [tab, setTab] = useState<(typeof TABS)[number]>("proximas");
  const [day, setDay] = useState(() => new Date());
  const slide = useSlideIn(TABS.indexOf(tab));

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

  const dayGroups = groups.filter((g) => sameDay(new Date(g.startAt), day));
  // a data cancelada já aparece como linha "Cancelada"; aqui só o que não tem registro nenhum
  const dayGaps = gaps.filter(
    (o) =>
      sameDay(o.startAt, day) &&
      !dayGroups.some((g) => +new Date(g.startAt) === +o.startAt),
  );

  const row = (g: ClassHistory) => {
    if (!isUpcoming(g))
      return (
        <Row
          key={g.classSessionId}
          g={g}
          headline={historyHeadline(g.events)}
        />
      );
    const a = g.activeAppointment!;
    const busy = actingId === a.id;
    const dl = cancelDeadline(g.startAt, windowH);
    return (
      <Row
        key={g.classSessionId}
        g={g}
        headline={futureHeadline(a)}
        upcoming
        // o WhatsApp já perguntou: abre com o botão de confirmar à vista
        defaultOpen={a.status === "BOOKED" && !!a.confirmationSentAt}
      >
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
        <div className="flex gap-2 empty:hidden">
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
      </Row>
    );
  };

  // lista já ordenada -> blocos "Esta semana", "Próxima semana", "Novembro"...
  const grouped = (list: ClassHistory[]) => {
    const blocks: { label: string; items: ClassHistory[] }[] = [];
    for (const g of list) {
      const label = bucket(g.startAt, nowD);
      const last = blocks[blocks.length - 1];
      if (last?.label === label) last.items.push(g);
      else blocks.push({ label, items: [g] });
    }
    return (
      <div className="space-y-5">
        {blocks.map((b, i) => (
          <section key={`${b.label}-${i}`}>
            <h2 className="mv-mono mb-2 px-1 text-[11px] uppercase tracking-[0.16em] text-[var(--mv-text-soft)]">
              {b.label} · {b.items.length}
            </h2>
            <ul className={listCls}>{b.items.map(row)}</ul>
          </section>
        ))}
      </div>
    );
  };

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

  const tabCls = (on: boolean) =>
    `flex h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors ${
      on
        ? "bg-[var(--mv-brand-100)] text-[var(--mv-brand-700)]"
        : "text-[var(--mv-text-soft)] hover:bg-[var(--mv-brand-50)]"
    }`;
  const tabs = [
    { value: "proximas" as const, label: "Próximas", n: upcoming.length },
    { value: "historico" as const, label: "Histórico", n: history.length },
  ];

  const calendar = (
    <div className="space-y-4">
      <MyCalendar selected={day} onSelect={setDay} />

      {/* só esmaece: deslizar aqui somaria com o deslize da aba */}
      <section key={+day} className={enter}>
        <h2 className="mb-2 px-1 font-semibold text-[var(--mv-text)] first-letter:uppercase">
          {day.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h2>
        {dayGroups.length + dayGaps.length === 0 ? (
          empty("Nenhuma aula sua neste dia.")
        ) : (
          <ul className={listCls}>
            {dayGroups.map(row)}
            {dayGaps.map((o) => (
              <li key={`${o.slot.id}-${+o.startAt}`} className="flex items-center gap-3 px-3.5 py-3">
                <span className="flex w-10 flex-shrink-0 flex-col items-center leading-none text-amber-700 dark:text-amber-300">
                  <span className="mv-mono text-[10px] uppercase tracking-[0.12em]">
                    {part(o.startAt.toISOString(), { weekday: "short" })}
                  </span>
                  <span className="mt-1 text-xl font-bold tabular-nums">
                    {o.startAt.getDate()}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-[var(--mv-text)]">
                    {o.slot.name}
                  </span>
                  <span className="block text-sm tabular-nums text-[var(--mv-text-soft)]">
                    {time(o.startAt.toISOString())} ·{" "}
                    {/* sem crédito livre a recorrência não reserva; com crédito, dá para agendar à mão */}
                    {credits?.free === 0 ? (
                      "sem crédito livre"
                    ) : (
                      <Link
                        href="/aluno/aulas"
                        className="font-semibold text-[var(--mv-brand-700)] underline-offset-4 hover:underline"
                      >
                        agendar em Aulas
                      </Link>
                    )}
                  </span>
                </span>
                <span
                  className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${AMBER.chip}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${HOLLOW}`} />
                  Sem reserva
                </span>
                <span aria-hidden className="w-5 flex-shrink-0" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* celular: o calendário é só o ícone, para as duas abas caberem com o número */}
      <div className="grid grid-cols-[1fr_1fr_auto] gap-1 rounded-xl border border-[var(--mv-line)] bg-[var(--mv-surface)] p-1 sm:grid-cols-3">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            aria-pressed={tab === t.value}
            className={tabCls(tab === t.value)}
          >
            {t.label}
            <span className="tabular-nums opacity-70">{t.n}</span>
          </button>
        ))}
        <button
          onClick={() => setTab("calendario")}
          aria-pressed={tab === "calendario"}
          aria-label="Calendário"
          className={`${tabCls(tab === "calendario")} px-3.5`}
        >
          <CalendarDays className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">Calendário</span>
        </button>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-[var(--mv-text-soft)]">Carregando...</p>
      ) : (
        <div key={tab} className={`${enter} ${slide}`}>
          {tab === "calendario"
            ? calendar
            : tab === "proximas"
              ? upcoming.length === 0
                ? empty("Nenhuma aula marcada por enquanto.", true)
                : grouped(upcoming)
              : history.length === 0
                ? empty("Suas aulas anteriores aparecem aqui.")
                : grouped(history)}
        </div>
      )}
    </div>
  );
}
