import { whatsapp } from "@/server/whatsapp";
import { Job, JobType } from "@prisma/client";

type JobHandler = (job: Job) => Promise<void>;

// Cada tipo de job executa sua função. FAKE por enquanto
export const handlers: Record<JobType, JobHandler> = {
  PRESENCE_CONFIRMATION: async (job) => {
    // console.log("[FAKE] Enviaria confirmação de presença ->", job.payload);
    const p = job.payload as { to: string; studentName: string; time: string };
    await whatsapp.sendTemplate(p.to, "presence_confirmation", [
      p.studentName,
      p.time,
    ]);
  },
  WELCOME: async (job) => {
    // console.log("[FAKE] Enviaria boas-vindas ->", job.payload);
    const p = job.payload as { to: string; studentName: string };
    await whatsapp.sendTemplate(p.to, "welcome", [p.studentName]);
  },
  PLAN_EXPIRY: async (job) => {
    // console.log("[FAKE] Enviaria aviso de expiração ->", job.payload);
    const p = job.payload as {
      to: string;
      studentName: string;
      daysLeft: string;
    };
    await whatsapp.sendTemplate(p.to, "plan_expiry", [
      p.studentName,
      p.daysLeft,
    ]);
  },
};
