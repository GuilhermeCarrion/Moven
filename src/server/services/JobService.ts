import { JobType, Prisma } from "@prisma/client";
import { JobRespository } from "../repositories/JobRepository";

const repository = new JobRespository();

const RETRY_DELAY_MS = 60 * 60 * 1000; // 1h entre tentativas

export class JobService {
  // Enfileira sem duplicar o mesmo evento
  async enqueue(data: {
    academyId: string;
    type: JobType;
    relatedId?: string;
    payload: Prisma.InputJsonValue;
    scheduledFor?: Date;
  }) {
    if (data.relatedId) {
      const existing = await repository.findActiveByRelated(
        data.type,
        data.relatedId,
      );
      if (existing) return existing; // Se já tem evento, não cria outro
    }
    return await repository.create(data);
  }

  async claimDue(limit = 20) {
    return await repository.claimDue(limit);
  }

  async markSent(id: string) {
    return await repository.markSent(id);
  }

  // Decide se pode tentar novamente ou desistir
  async markFailed(
    job: { id: string; attempts: number; maxAttempts: number },
    error: string,
  ) {
    const attempts = job.attempts;
    const exhausted = attempts >= job.maxAttempts;
    const nextRun = new Date(Date.now() + RETRY_DELAY_MS);

    return await repository.markFailed(
      job.id,
      attempts,
      exhausted,
      error,
      nextRun,
    );
  }
}
