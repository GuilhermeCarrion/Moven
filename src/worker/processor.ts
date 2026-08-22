import { JobService } from "@/server/services/JobService";
import { handlers } from "./handlers";

const jobs = new JobService();

export async function processDueJobs() {
  const due = await jobs.claimDue(20);
  if (due.length === 0) return;

  console.log(`[worker] processando ${due.length} job(s)`);
  for (const job of due) {
    try {
      const handler = handlers[job.type];
      if (!handler) throw new Error(`Sem handler para ${job.type}`);
      await handler(job);
      await jobs.markSent(job.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await jobs.markFailed(job, msg);
      console.error(`[worker] job ${job.id} falhou: ${msg}`);
    }
  }
}
