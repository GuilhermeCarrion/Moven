import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class StudentRepository {
  async create(data: Prisma.StudentUncheckedCreateInput) {
    return await prisma.student.create({ data });
  }

  async findByCpf(cpf: string, academyId: string) {
    return await prisma.student.findFirst({
      where: { cpf, academyId },
    });
  }

  async findAll(academyId: string) {
    return await prisma.student.findMany({
      where: { academyId },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string, academyId: string) {
    return await prisma.student.findFirst({
      where: { id, academyId },
    });
  }

  async findByPhone(phone: string) {
    return await prisma.student.findFirst({ where: { phone } });
  }

  async update(id: string, data: Prisma.StudentUpdateInput) {
    return await prisma.student.update({
      where: { id },
      data,
    });
  }
}
