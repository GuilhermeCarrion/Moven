import { prisma } from "@/lib/prisma";
import { InboxService } from "@/server/services/InboxService";
import { whatsapp } from "@/server/whatsapp";
import { Job, JobType } from "@prisma/client";

const inbox = new InboxService();

type JobHandler = (job: Job) => Promise<void>;

// Cada tipo de job executa sua função. FAKE por enquanto
export const handlers: Record<JobType, JobHandler> = {
  PRESENCE_CONFIRMATION: async (job) => {
    // Verifica se esta "pendente" ainda, qualquer outro, pula.
    const appt = job.relatedId
      ? await prisma.appointment.findUnique({
          where: { id: job.relatedId },
          select: {
            status: true,
            studentId: true,
            classSession: { select: { startAt: true } },
          },
        })
      : null;

    // Pula se aula não esta mais pendente ou se ja começou.
    if (appt?.status !== "BOOKED" || appt.classSession.startAt <= new Date())
      return;

    const p = job.payload as { to: string; studentName: string; time: string };

    // console.log("[FAKE] Enviaria confirmação de presença ->", job.payload);
    const sent = await whatsapp.sendTemplate(p.to, "class_confirmation", [
      p.studentName,
      p.time,
    ]);
    await inbox.recordOutbound(job.academyId, sent, {
      type: "template",
      text: `Lembrete de aula: ${p.time}`,
      studentId: appt.studentId,
    });

    await prisma.appointment.update({
      where: { id: job.relatedId! },
      data: { confirmationSentAt: new Date() },
    });
  },
  WELCOME: async (job) => {
    // console.log("[FAKE] Enviaria boas-vindas ->", job.payload);
    const p = job.payload as { to: string; studentName: string };
    const sent = await whatsapp.sendTemplate(p.to, "welcome", [p.studentName]);
    await inbox.recordOutbound(job.academyId, sent, {
      type: "template",
      text: "Mensagem de boas-vindas",
      studentId: job.relatedId,
    });
  },
  PLAN_EXPIRY: async (job) => {
    // Pula se o pacote não está mais ativo ou aluno renovou (outro ativo vencendo depois)
    const pkg = job.relatedId
      ? await prisma.studentPackage.findUnique({
          where: { id: job.relatedId },
          select: { status: true, studentId: true, expiresAt: true },
        })
      : null;
    if (pkg?.status !== "ACTIVE") return;

    const renewed = await prisma.studentPackage.findFirst({
      where: {
        studentId: pkg.studentId,
        status: "ACTIVE",
        expiresAt: { gt: pkg.expiresAt },
      },
      select: { id: true },
    });
    if (renewed) return;

    const p = job.payload as {
      to: string;
      studentName: string;
      daysLeft: string;
    };
    const sent = await whatsapp.sendTemplate(p.to, "plan_expiry", [
      p.studentName,
      p.daysLeft,
    ]);
    await inbox.recordOutbound(job.academyId, sent, {
      type: "template",
      text: `Aviso: plano vence em ${p.daysLeft} dias`,
      studentId: pkg.studentId,
    });
  },
};
