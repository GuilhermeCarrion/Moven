import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { PrismaClientRustPanicError } from "@prisma/client/runtime/library";

export class ScheduleRepository {
  async listTemplates(academyId: string) {
    return await prisma.classTemplate.findMany({
      where: { academyId },
      orderBy: { name: "asc" },
    });
  }

  async findTemplate(id: string, academyId: string) {
    return await prisma.classTemplate.findFirst({ where: { id, academyId } });
  }

  async findTemplateByName(academyId: string, name: string) {
    return await prisma.classTemplate.findFirst({ where: { academyId, name } });
  }

  async createTemplate(data: Prisma.ClassTemplateUncheckedCreateInput) {
    return await prisma.classTemplate.create({ data });
  }

  async listSlots(academyId: string) {
    return await prisma.scheduleSlot.findMany({
      where: { academyId },
      include: {
        professor: { select: { name: true } },
        template: { select: { name: true } },
      },
      orderBy: [{ weekday: "asc" }, { time: "asc" }],
    });
  }

  async listActiviteSlotWithTemplate(academyId: string) {
    return await prisma.scheduleSlot.findMany({
      where: { academyId, active: true, professor: { active: true } },
      include: { template: true },
    });
  }

  async countActiveSlots(academyId: string, ids: string[]) {
    return await prisma.scheduleSlot.count({
      where: { academyId, active: true, id: { in: ids } },
    });
  }

  async findSlot(academyId: string, weekday: number, time: string) {
    return await prisma.scheduleSlot.findUnique({
      where: { academyId_weekday_time: { academyId, weekday, time } },
    });
  }

  async createSlot(data: Prisma.ScheduleSlotUncheckedCreateInput) {
    return await prisma.scheduleSlot.create({ data });
  }

  async updateSlot(
    id: string,
    academyId: string,
    data: Prisma.ScheduleSlotUncheckedUpdateInput,
  ) {
    return await prisma.scheduleSlot.updateMany({
      where: { id, academyId },
      data,
    });
  }
}
