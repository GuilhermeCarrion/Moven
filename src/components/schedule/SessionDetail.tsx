import {
  useAppointmentAction,
  useAppointmentsBySession,
  useBookAppointment,
  useSetAttendance,
} from "@/hooks/useAppointments";
import { useStudents } from "@/hooks/useStudents";
import { apiError } from "@/lib/apiError";
import {
  AppointmentStatus,
  ClassSession,
  AttendanceStatus,
} from "@/types/models";
import { Check, CheckCheck, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { initials } from "../layout/Sidebar";
import { Button } from "../ui/button";
import { selectCls } from "./ClassSessionForm";

const apptStatus: Record<AppointmentStatus, { label: string; cls: string }> = {
  BOOKED: { label: "Agendado", cls: "bg-[var(--mv-brand-100)] text-[var(--mv-brand-700)]" },
  CONFIRMED: { label: "Confirmado", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  CANCELLED: { label: "Cancelado", cls: "bg-red-500/10 text-red-600 dark:text-red-300" },
  RESCHEDULED: { label: "Remarcado", cls: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
};

const pill =
  "flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors";
const pillOff =
  "border-[var(--mv-line)] text-[var(--mv-text-soft)] hover:bg-[var(--mv-brand-50)] hover:text-[var(--mv-text)]";

export function SessionDetail({ session }: { session: ClassSession }) {
  const { data: appts, isLoading } = useAppointmentsBySession(session.id);
  const { data: students } = useStudents();
  const book = useBookAppointment();
  const action = useAppointmentAction();
  const setAtt = useSetAttendance();
  const [studentId, setStudentId] = useState("");

  const activeAppts = appts?.filter(
    (a) => a.status !== "CANCELLED" && a.status !== "RESCHEDULED",
  );
  const booked = activeAppts?.length ?? 0;
  const confirmedCount =
    activeAppts?.filter((a) => a.status === "CONFIRMED").length ?? 0;

  const handleBook = () => {
    if (!studentId) return toast.error("Selecione um aluno");
    book.mutate(
      { studentId, classSessionId: session.id },
      {
        onSuccess: () => {
          toast.success("Aluno agendado");
          setStudentId("");
        },
        onError: (e) => toast.error(apiError(e)),
      },
    );
  };

  const mark = (id: string, attendance: AttendanceStatus) =>
    setAtt.mutate(
      { id, attendance },
      { onError: (e) => toast.error(apiError(e)) },
    );

  return (
    <div className="space-y-4">
      {/* Totalizador */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-[var(--mv-brand-100)] px-3 py-1 font-semibold tabular-nums text-[var(--mv-brand-700)]">
          {booked}/{session.capacity} agendados
        </span>
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
          <CheckCheck className="h-3.5 w-3.5" aria-hidden /> {confirmedCount} confirmados
        </span>
      </div>

      {/* Agendar aluno */}
      <div>
        <label htmlFor={`book-${session.id}`} className="text-sm font-medium text-[var(--mv-text)]">
          Agendar aluno
        </label>
        <div className="mt-1.5 flex gap-2">
          <select
            id={`book-${session.id}`}
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className={`${selectCls} flex-1`}
          >
            <option value="">Selecione...</option>
            {students
              ?.filter((s) => s.active)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
          <Button onClick={handleBook} disabled={book.isPending}>
            Agendar
          </Button>
        </div>
      </div>

      {/* Lista de alunos */}
      {isLoading ? (
        <p className="text-sm text-[var(--mv-text-soft)]">Carregando...</p>
      ) : booked === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--mv-line)] py-5 text-center text-sm text-[var(--mv-text-soft)]">
          Nenhum aluno agendado ainda.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--mv-line)]">
          {activeAppts?.map((a) => {
            const name = a.student?.name ?? "Aluno";
            const st = apptStatus[a.status];
            return (
              <li key={a.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--mv-brand-100)] text-[11px] font-bold text-[var(--mv-brand-700)]">
                    {initials(name)}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-[var(--mv-text)]">{name}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-[42px]">
                  <button
                    aria-pressed={a.attendance === "PRESENT"}
                    onClick={() => mark(a.id, "PRESENT")}
                    className={`${pill} ${
                      a.attendance === "PRESENT"
                        ? "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : pillOff
                    }`}
                  >
                    <Check className="h-4 w-4" /> Presente
                  </button>
                  <button
                    aria-pressed={a.attendance === "ABSENT"}
                    onClick={() => mark(a.id, "ABSENT")}
                    className={`${pill} ${
                      a.attendance === "ABSENT"
                        ? "border-transparent bg-red-500/10 text-red-600 dark:text-red-300"
                        : pillOff
                    }`}
                  >
                    <X className="h-4 w-4" /> Faltou
                  </button>
                  {a.status === "BOOKED" && (
                    <button
                      onClick={() =>
                        action.mutate(
                          { id: a.id, action: "confirm" },
                          { onError: (e) => toast.error(apiError(e)) },
                        )
                      }
                      className={`${pill} ${pillOff}`}
                    >
                      <CheckCheck className="h-4 w-4" /> Confirmar
                    </button>
                  )}
                  <button
                    title="Cancelar agendamento"
                    aria-label={`Cancelar agendamento de ${name}`}
                    onClick={() =>
                      action.mutate(
                        { id: a.id, action: "cancel" },
                        {
                          onSuccess: () => toast.success("Agendamento cancelado"),
                          onError: (e) => toast.error(apiError(e)),
                        },
                      )
                    }
                    className="ml-auto flex h-9 items-center rounded-lg px-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-300"
                  >
                    Cancelar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
