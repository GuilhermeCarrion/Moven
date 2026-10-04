import { prisma } from "@/lib/prisma";
import { ActorType, AppointmentEventType } from "@prisma/client";

export type Actor = {
  type: ActorType;
  id?: string | null;
  note?: string | null;
};

export type RecordEventInput = {
  academyId: string;
  appointmentId: string;
  classSessionId: string;
  studentId: string;
  type: AppointmentEventType;
  actorType: ActorType;
  actorId?: string | null;
  creditRefunded?: boolean | null;
  note?: string | null;
};

export class AppointmentEventRepository {
  async record(data: RecordEventInput) {
    return await prisma.appointmentEvent.create({ data });
  }

  async listByStudent(studentId: string, academyId: string) {
    return await prisma.appointmentEvent.findMany({
      where: { studentId, academyId },
      orderBy: { createdAt: "asc" },
    });
  }

  async listByAppointment(appointmentId: string) {
    return await prisma.appointmentEvent.findMany({
      where: { appointmentId },
      orderBy: { createdAt: "asc" },
    });
  }
}
