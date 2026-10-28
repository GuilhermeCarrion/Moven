import { AppError } from "@/lib/errors";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { ClassSessionService } from "./ClassSessionService";
import { AppointmentService } from "./AppointmentService";
import { AppointmentEventRepository } from "../repositories/AppointmentEventRepository";
import { CreditService } from "./CreditService";
import { ClassSessionRepository } from "../repositories/ClassSessionRepository";
import { RecurrenceService } from "./RecurrenceService";
import { RecurrenceRepository } from "../repositories/RecurrenceRepository";
import { ScheduleRepository } from "../repositories/ScheduleRepository";

const appointmentRepository = new AppointmentRepository();
const classSessionService = new ClassSessionService();
const appointmentService = new AppointmentService();
const eventRepository = new AppointmentEventRepository();
const sessionRepository = new ClassSessionRepository();
const credits = new CreditService();
const recurrenceService = new RecurrenceService();
const recurrenceRepository = new RecurrenceRepository();
const scheduleRepository = new ScheduleRepository();

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

  async book(
    studentId: string,
    academyId: string,
    classSessionId: string,
    releaseAppointmentId?: string,
  ) {
    return await appointmentService.create(
      { studentId, classSessionId },
      academyId,
      { type: "STUDENT", id: studentId },
      { releaseAppointmentId },
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
    this.assertBeforeDeadline(appt);
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

  // Antes de reservar: a aula fica coberta? Se tirar a cobertura de outra, quais o aluno pode liberar
  async preview(studentId: string, academyId: string, classSessionId: string) {
    const session = await sessionRepository.findById(classSessionId, academyId);
    if (!session) throw new AppError("Aula não encontrada", 404);

    const check = await credits.checkNewReservation(
      studentId,
      academyId,
      session.startAt,
    );
    if (!check.covered || !check.displaced.length)
      return { covered: check.covered, options: [] };

    // Qualquer reserva pendente libera um crédito a mais distante vem primeiro (é a sugestão)
    const pending = await appointmentRepository.listPendingByStudent(
      studentId,
      academyId,
    );
    return {
      covered: true,
      options: pending
        .map((p) => ({
          id: p.id,
          startAt: p.classSession.startAt,
          className: p.classSession.name,
        }))
        .reverse(),
    };
  }

  // Grade da academia (pra escolher) + os horarios fixos do aluno
  async getRecurrence(studentId: string, academyId: string) {
    const [slots, mine] = await Promise.all([
      scheduleRepository.listSlots(academyId),
      recurrenceRepository.listActiveByStudent(studentId, academyId),
    ]);
    return {
      slots: slots
        .filter((s) => s.active)
        .map((s) => ({
          id: s.id,
          weekday: s.weekday,
          time: s.time,
          name: s.template.name,
          professor: s.professor.name,
        })),
      mine: mine.map((r) => r.scheduleSlotId),
    };
  }

  async setRecurrence(studentId: string, academyId: string, slotIds: string[]) {
    await recurrenceService.setStudentSlots(studentId, academyId, slotIds, {
      type: "STUDENT",
      id: studentId,
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

  // Depois do prazo o crédito já saiu: cancelar pelo portal não é mais possível
  private assertBeforeDeadline(appt: {
    classSession: { startAt: Date };
    academy: { cancelWindowHours: number };
  }) {
    const deadline =
      appt.classSession.startAt.getTime() -
      appt.academy.cancelWindowHours * 3_600_000;
    if (Date.now() >= deadline) {
      throw new AppError(
        `O prazo para cancelar (${appt.academy.cancelWindowHours}h antes da aula) já passou. Fale com a academia`,
        409,
      );
    }
  }
}
