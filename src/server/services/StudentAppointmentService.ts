import { AppError } from "@/lib/errors";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { ClassSessionService } from "./ClassSessionService";
import { AppointmentService } from "./AppointmentService";
import { AppointmentEventRepository } from "../repositories/AppointmentEventRepository";

const appointmentRepository = new AppointmentRepository();
const classSessionService = new ClassSessionService();
const appointmentService = new AppointmentService();
const eventRepository = new AppointmentEventRepository();

export class StudentAppointmentService {
  async listDay(studentId: string, academyId: string, from?: Date, to?: Date) {
    const sessions = await classSessionService.list(academyId, from, to);

    const mine = await appointmentRepository.findActiveByStudentInSessions(
      studentId,
      sessions.map((s) => s.id),
    );
    const bySession = new Map(mine.map((a) => [a.classSessionId, a]));

    return sessions.map((s) => {
      const appt = bySession.get(s.id) ?? null;
      return {
        id: s.id,
        name: s.name,
        startAt: s.startAt,
        durationMin: s.durationMin,
        capacity: s.capacity,
        booked: s._count.appointments,
        professorName: s.professor?.name ?? null,
        status: s.status,
        myAppointment: appt ? { id: appt.id, status: appt.status } : null,
      };
    });
  }

  // Histórico + futuras do próprio aluno (Minhas Aulas)
  async listMine(studentId: string, academyId: string) {
    const appts = await appointmentRepository.findAllByStudent(
      studentId,
      academyId,
    );
    return appts.map((a) => ({
      id: a.id,
      status: a.status,
      attendance: a.attendance,
      confirmationSentAt: a.confirmationSentAt,
      className: a.classSession.name,
      startAt: a.classSession.startAt,
      durationMin: a.classSession.durationMin,
    }));
  }

  async book(studentId: string, academyId: string, classSessionId: string) {
    // o core (create) já bloqueia aula que já começou
    return await appointmentService.create(
      { studentId, classSessionId },
      academyId,
      { type: "STUDENT", id: studentId },
    );
  }

  async confirm(studentId: string, academyId: string, appointmentId: string) {
    const appt = await this.loadOwned(studentId, academyId, appointmentId);
    this.assertBeforeStart(appt);
    return await appointmentService.confirm(appointmentId, academyId, {
      type: "STUDENT",
      id: studentId,
    });
  }

  async cancel(studentId: string, academyId: string, appointmentId: string) {
    const appt = await this.loadOwned(studentId, academyId, appointmentId);
    this.assertBeforeStart(appt);
    return await appointmentService.cancel(appointmentId, academyId, {
      type: "STUDENT",
      id: studentId,
    });
  }

  async history(studentId: string, academyId: string) {
    const events = await eventRepository.listByStudent(studentId, academyId);
    const classIds = [...new Set(events.map((e) => e.classSessionId))];
    if (classIds.length === 0) return [];

    const [classes, active] = await Promise.all([
      classSessionService.listByIds(classIds, academyId),
      appointmentRepository.findActiveByStudentInSessions(studentId, classIds),
    ]);
    const classMap = new Map(classes.map((c) => [c.id, c]));
    const activeMap = new Map(active.map((a) => [a.classSessionId, a]));

    const groups = new Map<string, typeof events>();
    for (const e of events) {
      const arr = groups.get(e.classSessionId) ?? [];
      arr.push(e);
      groups.set(e.classSessionId, arr);
    }

    return [...groups.entries()].map(([classSessionId, evs]) => {
      const cls = classMap.get(classSessionId);
      const act = activeMap.get(classSessionId) ?? null;
      return {
        classSessionId,
        className: cls?.name ?? "Aula",
        startAt: cls?.startAt ?? evs[evs.length - 1].createdAt,
        activeAppointment: act
          ? {
              id: act.id,
              status: act.status,
              confirmationSentAt: act.confirmationSentAt,
            }
          : null,
        events: evs.map((e) => ({
          type: e.type,
          actorType: e.actorType,
          creditRefunded: e.creditRefunded,
          note: e.note,
          createdAt: e.createdAt,
        })),
      };
    });
  }

  // Propriedade: o agendamento tem que ser do próprio aluno
  private async loadOwned(
    studentId: string,
    academyId: string,
    appointmentId: string,
  ) {
    const appt = await appointmentRepository.findById(appointmentId, academyId);
    if (!appt) throw new AppError("Agendamento não encontrado", 404);
    if (appt.studentId !== studentId)
      throw new AppError("Este agendamento não é seu", 403);
    return appt;
  }

  // Regra de tempo: depois do início, só a academia mexe
  private assertBeforeStart(appt: { classSession: { startAt: Date } }) {
    if (appt.classSession.startAt.getTime() <= Date.now())
      throw new AppError(
        "A aula já começou. Fale com a academia para alterações.",
        409,
      );
  }
}
