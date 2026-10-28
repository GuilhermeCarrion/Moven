import { prisma } from "@/lib/prisma";
import { Prisma, StudentPackageStatus } from "@prisma/client";

type CreateStudentPackageData = {
  academyId: string;
  studentId: string;
  planId: string;
  creditsTotal: number;
  creditsRemaining: number;
  startedAt: Date;
  expiresAt: Date;
};

export class StudentPackageRepository {
  async create(data: CreateStudentPackageData) {
    return await prisma.studentPackage.create({ data });
  }

  async findById(id: string, academyId: string) {
    return await prisma.studentPackage.findFirst({ where: { id, academyId } });
  }

  async listByStudent(studentId: string, academyId: string) {
    return await prisma.studentPackage.findMany({
      where: { studentId, academyId },
      orderBy: { createdAt: "desc" },
      include: { plan: { select: { name: true } } },
    });
  }

  // Aluno já usou algum pacote de plano experimental
  async findTrialByStudent(studentId: string, academyId: string) {
    return await prisma.studentPackage.findFirst({
      where: { studentId, academyId, plan: { isTrial: true } },
    });
  }

  // Pacote que paga uma aula: ativo, com crédito e válido NA DATA da aula; o que vence primeiro
  async findForDebit(studentId: string, academyId: string, classDate: Date) {
    return await prisma.studentPackage.findFirst({
      where: {
        studentId,
        academyId,
        status: StudentPackageStatus.ACTIVE,
        creditsRemaining: { gt: 0 },
        expiresAt: { gte: classDate },
      },
      orderBy: { expiresAt: "asc" },
      select: { id: true },
    });
  }

  // Pacotes que ainda podm pagar alguma aula: ativos, com créditos e não vencidos
  async listUsable(studentId: string, academyId: string) {
    return await prisma.studentPackage.findMany({
      where: {
        studentId,
        academyId,
        status: StudentPackageStatus.ACTIVE,
        creditsRemaining: { gt: 0 },
        expiresAt: { gt: new Date() },
      },
      select: { id: true, creditsRemaining: true, expiresAt: true },
    });
  }

  async update(id: string, data: Prisma.StudentPackageUpdateInput) {
    return await prisma.studentPackage.update({ where: { id }, data });
  }

  // Marca como EXPIRED os pacotes vencidos que ainda estão ACTIVE.
  async expireStale(academyId: string) {
    return await prisma.studentPackage.updateMany({
      where: {
        academyId,
        status: StudentPackageStatus.ACTIVE,
        expiresAt: { lt: new Date() },
      },
      data: { status: StudentPackageStatus.EXPIRED },
    });
  }
}
