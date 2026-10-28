import { prisma } from "@/lib/prisma";

export class RecurrenceRepository {
  async listByStudent(studentId: string, academyId: string) {
    return await prisma.recurrence.findMany({
      where: { studentId, academyId },
    });
  }

  // Só conta recorrência cujo horário da grade ainda está ativo
  async listActiveByStudent(studentId: string, academyId: string) {
    return await prisma.recurrence.findMany({
      where: {
        studentId,
        academyId,
        active: true,
        scheduleSlot: { active: true },
      },
      select: { id: true, scheduleSlotId: true },
    });
  }

  async listActiveStudents(academyId: string) {
    const rows = await prisma.recurrence.findMany({
      where: { academyId, active: true, scheduleSlot: { active: true } },
      distinct: ["studentId"],
      select: { studentId: true },
    });
    return rows.map((r) => r.studentId);
  }

  // Liga o horário pro aluno: cria se nunca existiu, reativa se estava desligado
  async activate(
    studentId: string,
    academyId: string,
    scheduleSlotId: string,
    createdById?: string,
  ) {
    return await prisma.recurrence.upsert({
      where: { studentId_scheduleSlotId: { studentId, scheduleSlotId } },
      create: { studentId, academyId, scheduleSlotId, createdById },
      update: { active: true },
    });
  }

  async deactivate(ids: string[]) {
    return await prisma.recurrence.updateMany({
      where: { id: { in: ids } },
      data: { active: false },
    });
  }
}
