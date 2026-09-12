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
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

const apptStatus: Record<AppointmentStatus, string> = {
  BOOKED: "Agendado",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  RESCHEDULED: "Remarcado",
};

const selectCls =
  "mt-1 h-10 w-full rounded-lg border border-slate-200/70 bg-white/70 px-2.5 text-sm text-slate-700 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30";

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
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[var(--brand-cyan)]/15 px-3 py-1 text-xs font-semibold text-cyan-700">
          {booked}/{session.capacity} agendados
        </span>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          {confirmedCount} confirmados
        </span>
      </div>

      {/* Agendar aluno */}
      <div className="flex items-end gap-2 border-b border-white/60 pb-4">
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-600">
            Agendar aluno
          </label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className={selectCls}
          >
            <option value="">Selecione um aluno...</option>
            {students
              ?.filter((s) => s.active)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>
        <Button onClick={handleBook} disabled={book.isPending}>
          Agendar
        </Button>
      </div>

      {/* Lista de alunos */}
      {isLoading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : booked === 0 ? (
        <p className="text-sm text-slate-400">Nenhum aluno agendado.</p>
      ) : (
        <ul className="space-y-2">
          {activeAppts?.map((a) => (
            <li
              key={a.id}
              className="rounded-lg border border-white/60 bg-white/50 p-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  {a.student?.name}
                </span>
                <span className="text-xs text-slate-500">
                  {apptStatus[a.status]}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {a.status === "BOOKED" && (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() =>
                      action.mutate(
                        { id: a.id, action: "confirm" },
                        { onError: (e) => toast.error(apiError(e)) },
                      )
                    }
                  >
                    Confirmar
                  </Button>
                )}
                <Button
                  size="xs"
                  variant="outline"
                  className={
                    a.attendance === "PRESENT"
                      ? "border-transparent bg-green-100 text-green-700 hover:bg-green-100"
                      : ""
                  }
                  onClick={() => mark(a.id, "PRESENT")}
                >
                  Presente
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  className={
                    a.attendance === "ABSENT"
                      ? "border-transparent bg-red-100 text-red-700 hover:bg-red-100"
                      : ""
                  }
                  onClick={() => mark(a.id, "ABSENT")}
                >
                  Faltou
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() =>
                    action.mutate(
                      { id: a.id, action: "cancel" },
                      {
                        onSuccess: () => toast.success("Agendamento cancelado"),
                        onError: (e) => toast.error(apiError(e)),
                      },
                    )
                  }
                >
                  Cancelar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
