import { prisma } from "@/lib/prisma";
import { AppointmentSchema } from "@/schemas/appointment.schema";
import {
  AppointmentStatus,
  AttendanceStatus,
  CancelReason,
  StudentPackageStatus,
} from "@prisma/client";

type CreateAppointmentData = {
  academyId: string;
  studentId: string;
  classSessionId: string;
  recurrenceId?: string | null;
};

export class AppointmentRepository {
  // Reserva: NÃO debita. O crédito sai no prazo, pela varredura do worker
  async create(data: CreateAppointmentData) {
    return await prisma.appointment.create({ data });
  }

  // Reservas ainda não debitadas de aulas futuras: a base da cobertura
  async listPendingByStudent(studentId: string, academyId: string) {
    return await prisma.appointment.findMany({
      where: {
        studentId,
        academyId,
        status: { in: [AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED] },
        debitedAt: null,
        classSession: { startAt: { gt: new Date() } },
      },
      select: { id: true, classSession: { select: { startAt: true } } },
      orderBy: { classSession: { startAt: "asc" } },
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
        academy: { select: { cancelWindowHours: true } },
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

  async findActiveByStudentInSessions(
    studentId: string,
    classSessionIds: string[],
  ) {
    if (classSessionIds.length === 0) return [];
    return await prisma.appointment.findMany({
      where: {
        studentId,
        classSessionId: { in: classSessionIds },
        status: { in: [AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED] },
      },
      select: {
        id: true,
        classSessionId: true,
        status: true,
        confirmationSentAt: true,
      },
    });
  }

  async findAllByStudent(studentId: string, academyId: string) {
    return await prisma.appointment.findMany({
      where: {
        studentId,
        academyId,
        status: {
          in: [
            AppointmentStatus.BOOKED,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.CANCELLED,
          ],
        },
      },
      include: {
        classSession: {
          select: { name: true, startAt: true, durationMin: true },
        },
      },
      orderBy: { classSession: { startAt: "desc" } },
    });
  }

  async confirm(id: string) {
    return await prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CONFIRMED, confirmedAt: new Date() },
    });
  }

  // Cancela e se informado, estorna crédito ao pacote de origem
  async cancel(
    id: string,
    reason: CancelReason,
    refundPackageId?: string | null,
  ) {
    return await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.update({
        where: { id },
        data: {
          status: AppointmentStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: reason,
        },
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
      debitedAt: Date | null;
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
