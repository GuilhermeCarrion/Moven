import { AppError, handleError } from "@/lib/errors";
import { HORIZON_DAYS, upcomingOccurrences } from "@/lib/schedule";
import { CancelReason } from "@prisma/client";
import { AcademyReposistory } from "../repositories/AcademyRepository";
import { Actor } from "../repositories/AppointmentEventRepository";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { ClassSessionRepository } from "../repositories/ClassSessionRepository";
import { RecurrenceRepository } from "../repositories/RecurrenceRepository";
import { ScheduleRepository } from "../repositories/ScheduleRepository";
import { StudentRepository } from "../repositories/StudentRepository";
import { AppointmentService } from "./AppointmentService";
import { CreditService } from "./CreditService";
import { id } from "zod/v4/locales";

const academies = new AcademyReposistory();
const appointments = new AppointmentRepository();
const sessions = new ClassSessionRepository();
const recurrences = new RecurrenceRepository();
const schedule = new ScheduleRepository();
const students = new StudentRepository();
const appointmentService = new AppointmentService();
const credits = new CreditService();

const DAY_MS = 24 * 3_600_000;
const GENERATOR: Actor = { type: "SYSTEM", note: "recorrência" };

// Depois desses cancelamentos, a recorrencia não reserva a data de novo
// null = cancelamento do modelo antigo (sem motivo): trata como decisão do aluno
const SKIP_FOREVER = new Set<CancelReason | null>([
  CancelReason.STUDENT,
  CancelReason.STAFF,
  CancelReason.CLASS_CANCELLED,
]);

export class RecurrenceService {
  // Aulas da academia: garante a grade nos proximos 30 dias
  async generateSessions(academyId: string) {
    const slots = await schedule.listActiviteSlotWithTemplate(academyId);
    const data = upcomingOccurrences(slots).map(({ slot, startAt }) => ({
      academyId,
      professorId: slot.professorId,
      templateId: slot.templateId,
      scheduleSlotId: slot.id,
      name: slot.template.name,
      startAt,
      durationMin: slot.template.durationMin,
      capacity: slot.template.capacity,
      minCapacity: slot.template.minCapacity,
    }));
    if (data.length) await sessions.createManyIngoringExisting(data);
  }

  // Reservas do aluno: horarios da recorrencia, em ordem de data, até onde a cobertura vai
  async generateForStudent(studentId: string, academyId: string) {
    const recs = await recurrences.listActiveByStudent(studentId, academyId);
    if (!recs.length) return;
    const recBySlot = new Map(recs.map((r) => [r.scheduleSlotId, r.id]));

    // Só aulas cujo prazo de cancelamento ainda não chegou: o aluno tem a chance de cacnelar sem custo
    const settings = await academies.getSettings(academyId);
    const now = Date.now();
    const from = new Date(now + (settings?.cancelWindowHours ?? 4) * 3_600_000);
    const candidates = await sessions.listBySlots(
      academyId,
      [...recBySlot.keys()],
      from,
      new Date(now + HORIZON_DAYS * DAY_MS),
    );

    // Bloqueia: aula onde ele já está, ou que ele ou a academia decidiu cancelar
    const history = await appointments.listByStudentInSessions(
      studentId,
      candidates.map((c) => c.id),
    );
    const blocked = new Set(
      history
        .filter(
          (a) => a.status !== "CANCELLED" || SKIP_FOREVER.has(a.cancelReason),
        )
        .map((a) => a.classSessionId),
    );

    for (const s of candidates) {
      if (blocked.has(s.id)) continue;

      const check = await credits.checkNewReservation(
        studentId,
        academyId,
        s.startAt,
      );
      if (!check.covered) break; // A cobertura acabou: as datas seguintes também não teriam
      if (check.displaced.length) continue; // nunca desloca uma reserva que o aluno fez à mão

      try {
        await appointmentService.create(
          { studentId, classSessionId: s.id },
          academyId,
          GENERATOR,
          { recurrenceId: recBySlot.get(s.scheduleSlotId!) },
        );
      } catch (e) {
        console.warn(`[recorrencia] pulou a ual ${s.id}: `, e); // lotada, aluno inativo...
      }
    }
  }

  // 3)Alterar recorrencia (portal ou painel): os horarios passados são o novo padrão completp
  async setStudentSlots(
    studentId: string,
    academyId: string,
    slotIds: string[],
    actor: Actor,
    createdById?: string,
  ) {
    if (!(await students.findById(studentId, academyId)))
      throw new AppError("Aluno não encontrado", 404);
    if (
      (await schedule.countActiveSlots(academyId, slotIds)) !== slotIds.length
    )
      throw new AppError("Horario inválido ou inativo", 409);

    const current = await recurrences.listByStudent(studentId, academyId);
    const turnOff = current.filter(
      (r) => r.active && !slotIds.includes(r.scheduleSlotId),
    );
    for (const slotId of slotIds)
      await recurrences.activate(studentId, academyId, slotId, createdById);
    await recurrences.deactivate(turnOff.map((r) => r.id));

    // Reservas futuras dos horários que saíram: canceladas sem custo (só as ainda não debitadas)
    for (const a of await appointments.listPendingByRecurrences(
      turnOff.map((r) => r.id),
    ))
      await appointmentService.cancel(
        a.id,
        academyId,
        actor,
        CancelReason.RECURRENCE_CHANGED,
      );

    await this.generateForStudent(studentId, academyId);
  }

  // Rodada geral (worker): aulas primeiro, depois as reservas de cada aluno
  async generateAll() {
    for (const academy of await academies.listForSweep()) {
      await this.generateSessions(academy.id);
      for (const studentId of await recurrences.listActiveStudents(
        academy.id,
      )) {
        try {
          await this.generateForStudent(studentId, academy.id);
        } catch (e) {
          console.error(`[recorrencia] falha no aluno ${studentId}:`, e);
        }
      }
    }
  }
}
