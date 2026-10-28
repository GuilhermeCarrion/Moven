"use client";

import { ConfirmDialog } from "@/components/student/ConfirmDialog";
import {
  BookPreview,
  StudentClass,
  useAppointmentAction,
  useBookClass,
  useBookPreview,
  useStudentClasses,
} from "@/hooks/useStudentClasses";
import { useStudentCredits } from "@/hooks/useStudentCredits";
import { apiError } from "@/lib/apiError";
import { cancelDeadline } from "@/lib/cancelWindow";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
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

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
const endTime = (iso: string, min: number) =>
  new Date(new Date(iso).getTime() + min * 60000).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const dayTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
type Filter = "todos" | "disponivel" | "indisponivel";

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
  const { data: credits } = useStudentCredits();
  const windowH = credits?.cancelWindowHours ?? 4;
  const preview = useBookPreview();
  const book = useBookClass();
  const action = useAppointmentAction();
  // aula a reservar + reservas que podem ceder o crédito (release = a marcada)
  const [displace, setDisplace] = useState<{
    classId: string;
    options: BookPreview["options"];
    release: string;
  } | null>(null);

  const dayClasses = (data ?? [])
    .filter((c) => sameDay(new Date(c.startAt), selected))
    .filter((c) => matchesFilter(c, filter))
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));

  const bookingId = preview.isPending
    ? preview.variables
    : book.isPending
      ? book.variables?.classSessionId
      : null;
  const actingId = action.isPending
    ? (action.variables as { id: string }).id
    : null;

  const doBook = (classSessionId: string, releaseAppointmentId?: string) =>
    book.mutate(
      { classSessionId, releaseAppointmentId },
      {
        onSuccess: () => toast.success("Aula reservada!"),
        onError: (e) => toast.error(apiError(e)),
      },
    );

  // Simula antes: sem crédito avisa; se tirar o crédito de outra, o aluno escolhe qual cede
  const onBook = (c: StudentClass) =>
    preview.mutate(c.id, {
      onSuccess: (p) => {
        if (!p.covered)
          toast.error("Sem crédito para esta data. Renove seu pacote.");
        else if (p.options.length)
          setDisplace({
            classId: c.id,
            options: p.options,
            release: p.options[0].id,
          });
        else doBook(c.id);
      },
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

  const monthLabel = selected.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-800">Aulas</h1>
        <button
          onClick={() => setSelected(atMidnight(new Date()))}
          className="rounded-lg border border-white/60 bg-white/50 px-3 py-1.5 text-xs font-semibold text-slate-600"
        >
          Hoje
        </button>
      </div>

      {/* Faixa de dias */}
      <div className="rounded-2xl border border-white/60 bg-white/55 p-3 shadow-xl backdrop-blur-2xl backdrop-saturate-150">
        <div className="mb-2 flex items-center justify-between px-1">
          <button
            onClick={() => setSelected((d) => addDays(d, -7))}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-5 w-5 text-slate-500" />
          </button>
          <span className="text-sm font-semibold capitalize text-slate-700">
            {monthLabel}
          </span>
          <button
            onClick={() => setSelected((d) => addDays(d, 7))}
            aria-label="Próxima semana"
          >
            <ChevronRight className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="flex gap-1">
          {weekDays.map((d) => {
            const active = sameDay(d, selected);
            const today = sameDay(d, new Date());
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelected(d)}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-xs transition-colors ${
                  active
                    ? "bg-[var(--primary)] font-bold text-white"
                    : "text-slate-500 hover:bg-white/60"
                }`}
              >
                <span className="text-[10px] uppercase">
                  {WEEKDAYS[d.getDay()]}
                </span>
                <span
                  className={`text-sm ${today && !active ? "text-cyan-700" : ""}`}
                >
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        {(["todos", "disponivel", "indisponivel"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? "bg-slate-800 text-white"
                : "border border-white/60 bg-white/50 text-slate-500"
            }`}
          >
            {f === "disponivel"
              ? "Disponível"
              : f === "indisponivel"
                ? "Indisponível"
                : "Todos"}
          </button>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : dayClasses.length === 0 ? (
        <p className="rounded-2xl border border-white/60 bg-white/40 p-6 text-center text-sm text-slate-400">
          Nenhuma aula neste dia.
        </p>
      ) : (
        <div className="space-y-3">
          {dayClasses.map((c) => {
            const kind = cardKind(c);
            const dl = cancelDeadline(c.startAt, windowH);
            const busy =
              bookingId === c.id ||
              (c.myAppointment && actingId === c.myAppointment.id);
            function requestCancel(id: string, startAt: string): void {
              throw new Error("Function not implemented.");
            }

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-white/60 bg-white/55 p-4 shadow-lg backdrop-blur-2xl backdrop-saturate-150"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {time(c.startAt)} – {endTime(c.startAt, c.durationMin)}
                      {c.professorName ? ` · Prof. ${c.professorName}` : ""}
                    </div>
                    <div className="mt-1 text-xs font-medium text-cyan-700">
                      {c.booked}/{c.capacity} vagas
                    </div>
                    {c.myAppointment && (
                      <div className="mt-1 text-xs text-slate-500">
                        {dl.open
                          ? `Cancele sem custo até ${dl.label}`
                          : "Crédito debitado"}
                      </div>
                    )}
                  </div>
                  {kind === "confirmed" && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                      Confirmada
                    </span>
                  )}
                  {kind === "booked" && (
                    <span className="rounded-full bg-[var(--brand-yellow)]/25 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                      Agendada
                    </span>
                  )}
                </div>

                {/* Ações por estado */}
                <div className="mt-3 flex gap-2 empty:hidden">
                  {kind === "available" && (
                    <button
                      disabled={!!busy}
                      onClick={() => onBook(c)}
                      className="flex-1 rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-focus)] disabled:opacity-60"
                    >
                      {busy ? "Agendando..." : "Agendar"}
                    </button>
                  )}
                  {kind === "booked" && (
                    <>
                      <button
                        disabled={!!busy}
                        onClick={() => onAction(c.myAppointment!.id, "confirm")}
                        className="flex-1 rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-focus)] disabled:opacity-60"
                      >
                        Confirmar
                      </button>
                      {dl.open && (
                        <button
                          disabled={!!busy}
                          onClick={() =>
                            onAction(c.myAppointment!.id, "cancel")
                          }
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-60"
                        >
                          Cancelar
                        </button>
                      )}
                    </>
                  )}
                  {kind === "confirmed" && dl.open && (
                    <button
                      disabled={!!busy}
                      onClick={() => onAction(c.myAppointment!.id, "cancel")}
                      className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-60"
                    >
                      Cancelar
                    </button>
                  )}
                  {(kind === "full" || kind === "closed") && (
                    <span className="flex-1 rounded-xl bg-slate-100 py-2.5 text-center text-sm font-medium text-slate-400">
                      Indisponível
                    </span>
                  )}
                  {kind === "past" && (
                    <span className="flex-1 rounded-xl bg-slate-100 py-2.5 text-center text-sm font-medium text-slate-400">
                      Encerrada
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog
        open={!!displace}
        title="Essa aula usa o crédito de outra reserva"
        message="Seu saldo não cobre as duas. Escolha qual reserva será cancelada:"
        confirmLabel="Reservar e cancelar"
        onCancel={() => setDisplace(null)}
        onConfirm={() => {
          if (displace) doBook(displace.classId, displace.release);
          setDisplace(null);
        }}
      >
        {displace && (
          <div className="mt-4 max-h-60 space-y-2 overflow-y-auto">
            {displace.options.map((o) => (
              <label
                key={o.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/70 bg-white/60 px-3 py-2.5 text-sm has-[:checked]:border-rose-300 has-[:checked]:bg-rose-50"
              >
                <input
                  type="radio"
                  name="release"
                  checked={displace.release === o.id}
                  onChange={() => setDisplace({ ...displace, release: o.id })}
                  className="accent-rose-500"
                />
                <span className="font-medium text-slate-700">
                  {o.className}
                </span>
                <span className="ml-auto capitalize text-slate-500">
                  {dayTime(o.startAt)}
                </span>
              </label>
            ))}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
