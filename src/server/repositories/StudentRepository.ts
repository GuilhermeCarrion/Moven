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

  // Login do aluno: CPF é o único por academia.
  async findByCpfOnly(cpf: string) {
    return await prisma.student.findFirst({ where: { cpf } });
  }

  async findAll(academyId: string) {
    return await prisma.student.findMany({
      where: { academyId },
      orderBy: { name: "asc" },
      include: {
        // Só o pacote ativo que vence primeiro (o que está sendo consumido)
        studentPackages: {
          where: { status: "ACTIVE" },
          orderBy: { expiresAt: "asc" },
          take: 1,
          select: { creditsRemaining: true, expiresAt: true },
        },
      },
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

  async findProfile(id: string, academyId: string) {
    return await prisma.student.findFirst({
      where: { id, academyId },
      include: {
        studentPackages: {
          where: { status: "ACTIVE" },
          orderBy: { expiresAt: "asc" },
          take: 1,
          select: {
            creditsRemaining: true,
            creditsTotal: true,
            expiresAt: true,
            status: true,
            plan: { select: { name: true } },
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.StudentUpdateInput) {
    return await prisma.student.update({
      where: { id },
      data,
    });
  }
}
