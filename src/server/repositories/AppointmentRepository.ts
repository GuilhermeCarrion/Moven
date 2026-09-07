import { prisma } from "@/lib/prisma";
import { AppointmentSchema } from "@/schemas/appointment.schema";
import {
  AppointmentStatus,
  AttendanceStatus,
  StudentPackageStatus,
} from "@prisma/client";

type CreateAppointmentData = {
  academyId: string;
  studentId: string;
  classSessionId: string;
  studentPackageId: string;
};

export class AppointmentRepository {
  // cria agendamento e debita 1 crédito na MESMA transação
  async createWithDebit(data: CreateAppointmentData) {
    return await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({ data });

      const pkg = await tx.studentPackage.update({
        where: { id: data.studentPackageId },
        data: { creditsRemaining: { decrement: 1 } },
      });

      // Caso o créditos do pacote zere, já atualiza o status
      if (pkg.creditsRemaining <= 0) {
        await tx.studentPackage.update({
          where: { id: data.studentPackageId },
          data: { status: StudentPackageStatus.DEPLETED },
        });
      }

      return appointment;
    });
  }

  // Só bloqueia agendamento do mesmo aluno se houver um agendamento ativo
  async findActiveDuplicate(studentId: string, classSessionId: string) {
    return await prisma.appointment.findFirst({
      where: {
        studentId,
        classSessionId,
        status: { in: [AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED] },
      },
    });
  }

  async findById(id: string, academyId: string) {
    return await prisma.appointment.findFirst({
      where: { id, academyId },
      include: {
        classSession: { select: { startAt: true, durationMin: true } },
      },
    });
  }

  async findAllBySession(classSessionId: string, academyId: string) {
    return await prisma.appointment.findMany({
      where: { classSessionId, academyId },
      include: { student: { select: { name: true } } },
    });
  }

  async findNextActiveByStudent(studentId: string, academyId: string) {
    return await prisma.appointment.findFirst({
      where: {
        studentId,
        academyId,
        status: { in: [AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED] },
        classSession: { startAt: { gt: new Date() } },
      },
      orderBy: { classSession: { startAt: "asc" } },
    });
  }

  async confirm(id: string) {
    return await prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CONFIRMED, confirmedAt: new Date() },
    });
  }

  // Cancela e se informado, estorna crédito ao pacote de origem
  async cancel(id: string, refundPackageId?: string | null) {
    return await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.update({
        where: { id },
        data: { status: AppointmentStatus.CANCELLED, cancelledAt: new Date() },
      });

      if (refundPackageId) {
        const pkg = await tx.studentPackage.update({
          where: { id: refundPackageId },
          data: { creditsRemaining: { increment: 1 } },
        });

        // Devolveu crédito num pacote esgotado -> volta a ficar ativo
        if (pkg.status === StudentPackageStatus.DEPLETED) {
          await tx.studentPackage.update({
            where: { id: refundPackageId },
            data: { status: StudentPackageStatus.ACTIVE },
          });
        }
      }
      return appointment;
    });
  }

  // Remarca: Fecha o antigo (sem novo débito) e cria novo apontando para origem.
  async reschedule(
    oldId: string,
    newData: {
      academyId: string;
      studentId: string;
      classSessionId: string;
      studentPackageId: string | null;
    },
  ) {
    return await prisma.$transaction(async (tx) => {
      // Atualiza antigo para REMARCADO
      await tx.appointment.update({
        where: { id: oldId },
        data: {
          status: AppointmentStatus.RESCHEDULED,
          rescheduledAt: new Date(),
        },
      });

      // Cria novo apontando para agendamento antigo
      await tx.appointment.create({
        data: { ...newData, rescheduleFromId: oldId },
      });
    });
  }

  async setAttendance(
    id: string,
    attendance: AttendanceStatus,
    checkedInById: string,
  ) {
    return await prisma.appointment.update({
      where: { id },
      data: { attendance, checkedInAt: new Date(), checkedInById },
    });
  }
}
