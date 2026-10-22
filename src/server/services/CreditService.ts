import { coveredIds } from "@/lib/coverage";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { StudentPackageRepository } from "../repositories/StudentPackageRepository";

const appointment = new AppointmentRepository();
const packages = new StudentPackageRepository();

export class CreditService {
  // Situação atual do aluno: pacotes, reservas penentes e quais estão cobertas
  async snapshot(studentId: string, academyId: string) {
    const [pkgs, pending] = await Promise.all([
      packages.listUsable(studentId, academyId),
      appointment.listPendingByStudent(studentId, academyId),
    ]);
    const reservations = pending.map((p) => ({
      id: p.id,
      startAt: p.classSession.startAt,
    }));
    return { pkgs, reservations, covered: coveredIds(pkgs, reservations) };
  }

  // "E se eu reservar uma aula nesta data?" -> ela fica coberta ? alguma outra perde a cobertura?
  async checkNewReservation(
    studentId: string,
    academyId: string,
    startAt: Date,
  ) {
    const {
      pkgs,
      reservations,
      covered: before,
    } = await this.snapshot(studentId, academyId);
    const after = coveredIds(pkgs, [...reservations, { id: "new", startAt }]);
    return {
      covered: after.has("new"),
      displaced: [...before].filter((id) => !after.has(id)),
    };
  }
}
