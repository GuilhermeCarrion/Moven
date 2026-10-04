import { prisma } from "@/lib/prisma";
import { ClassSessionSchema } from "@/schemas/classSession.schema";
import { AppointmentStatus } from "@prisma/client";

export class ClassSessionRepository {
  async create(data: ClassSessionSchema & { academyId: string }) {
    return await prisma.classSession.create({ data });
  }

  async findAll(academyId: string, from?: Date, to?: Date) {
    return await prisma.classSession.findMany({
      where: {
        academyId,
        ...(from || to
          ? {
              startAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lt: to } : {}),
              },
            }
          : {}),
      },
      include: {
        professor: { select: { name: true } },
        _count: {
          select: {
            appointments: {
              where: {
                status: {
                  in: [AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED],
                },
              },
            },
          },
        },
      },
      orderBy: { startAt: "asc" },
    });
  }

  async findById(id: string, academyId: string) {
    return await prisma.classSession.findFirst({
      where: { id, academyId },
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                status: {
                  in: [AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED],
                },
              },
            },
          },
        },
      },
    });
  }

  async findManyByIds(ids: string[], academyId: string) {
    if (ids.length === 0) return [];

    return await prisma.classSession.findMany({
      where: { id: { in: ids }, academyId },
      select: { id: true, name: true, startAt: true, durationMin: true },
    });
  }

  async update(id: string, data: Partial<ClassSessionSchema>) {
    return await prisma.classSession.update({
      where: { id },
      data,
    });
  }
}
