import { CancelReason } from "@prisma/client";
import { AcademyReposistory } from "../repositories/AcademyRepository";
import { Actor } from "../repositories/AppointmentEventRepository";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { AppointmentService } from "./AppointmentService";
import { CreditService } from "./CreditService";

const academies = new AcademyReposistory();
const appointments = new AppointmentRepository();
const appointmentService = new AppointmentService();
const creditService = new CreditService();

const SYSTEM: Actor = { type: "SYSTEM" };
const DAY_MS = 24 * 3_600_000;

// ponytail: roda a cada minuto varrendo todas as academias; ok no volume atual
// particionar por academia/horario se crescer muito.
export class CreditSweepService {
  async run() {
    for (const academy of await academies.listForSweep()) {
      await this.debitDue(academy);
      await this.releaseUncovered(academy.id);
    }
  }

  // Chegou o prazo: debita(ou cancela, se faltar credito)
  private async debitDue(academy: { id: string; cancelWindowHours: number }) {
    const until = new Date(Date.now() + academy.cancelWindowHours * 3_600_000);

    for (const a of await appointments.listDueForDebit(academy.id, until)) {
      try {
        await appointmentService.debit(
          {
            id: a.id,
            studentId: a.studentId,
            classSessionId: a.classSessionId,
            startAt: a.classSession.startAt,
          },
          academy.id,
        );
      } catch (e) {
        console.error(`[credito] falha ao debitar ${a.id}:`, e);
      }
    }
  }

  // Folga de 1 dia: reserva das proximas 24h que perdeu a cobertura é cancelada, devolvendo a vaga
  private async releaseUncovered(academyId: string) {
    const soon = await appointments.listPendingStartingBefore(
      academyId,
      new Date(Date.now() + DAY_MS),
    );

    for (const studentId of new Set(soon.map((a) => a.studentId))) {
      try {
        const { covered } = await creditService.snapshot(studentId, academyId);
        const uncovered = soon.filter(
          (a) => a.studentId === studentId && !covered.has(a.id),
        );
        for (const a of uncovered) {
          await appointmentService.cancel(
            a.id,
            academyId,
            SYSTEM,
            CancelReason.NO_CREDIT,
            "Crédito insuficiente",
          );
        }
      } catch (e) {
        console.error(
          `[credito] falha ao liberar reservas do aluno ${studentId}:`,
          e,
        );
      }
    }
  }
}
