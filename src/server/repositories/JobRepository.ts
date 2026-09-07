import { prisma } from "@/lib/prisma";
import { JobStatus, JobType, Prisma } from "@prisma/client";

type CreateJobData = {
  academyId: string;
  type: JobType;
  relatedId?: string;
  payload: Prisma.InputJsonValue;
};

export class JobRespository {
  async create(data: CreateJobData) {
    return await prisma.job.create({ data });
  }

  // Busca por job "ativo/vivo" por evento (evitar duplicidade)
  async findActiveByRelated(type: JobType, relatedId: string) {
    return await prisma.job.findFirst({
      where: {
        type,
        relatedId,
        status: {
          in: [JobStatus.PENDING, JobStatus.PROCESSING, JobStatus.SENT],
        },
      },
    });
  }

  // Pega os jobs cuja hora "chegou" e trava como PROCESSING
  async claimDue(limit: number) {
    const due = await prisma.job.findMany({
      where: { status: JobStatus.PENDING, scheduledFor: { lte: new Date() } },
      orderBy: { scheduledFor: "asc" },
      take: limit,
    });
    if (due.length === 0) return [];

    await prisma.job.updateMany({
      where: { id: { in: due.map((j) => j.id) }, status: JobStatus.PENDING },
      data: { status: JobStatus.PROCESSING },
    });

    return due;
  }

  async markSent(id: string) {
    return await prisma.job.update({
      where: { id },
      data: { status: JobStatus.SENT, sentAt: new Date() },
    });
  }

  // Ao falhar: reagenda como (PENDING + nova hora) ou marca como FAILED (esgotou tentivas)
  async markFailed(
    id: string,
    attempts: number,
    exhausted: boolean,
    error: string,
    nextRun: Date,
  ) {
    return await prisma.job.update({
      where: { id },
      data: exhausted
        ? { status: JobStatus.FAILED, attempts, lastError: error }
        : {
            status: JobStatus.PENDING,
            attempts,
            lastError: error,
            scheduledFor: nextRun,
          },
    });
  }
}
