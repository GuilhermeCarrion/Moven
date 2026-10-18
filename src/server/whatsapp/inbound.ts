import { whatsapp } from ".";
import { AcademyReposistory } from "../repositories/AcademyRepository";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { StudentRepository } from "../repositories/StudentRepository";
import { AppointmentService } from "../services/AppointmentService";
import { InboxService } from "../services/InboxService";
import { InboundMessage } from "./types";

const appointmentService = new AppointmentService();
const academyRepo = new AcademyReposistory();
const studentRepo = new StudentRepository();
const appointmentRepo = new AppointmentRepository();
const inbox = new InboxService();

// Valor de cada notificação da Meta
type WebhookValue = {
  metadata: { phone_number_id: string };
  contacts?: { wa_id: string; profile?: { name?: string } }[];
  messages?: InboundMessage[];
  statuses?: { id: string; status: string }[];
};

// traduz mensagem em intenção
function parseIntent(msg: InboundMessage): "confirm" | "cancel" | "unknown" {
  const raw =
    msg.button?.payload ??
    msg.interactive?.button_reply?.id ??
    msg.text?.body ??
    "";

  const v = raw.trim().toLowerCase();
  if (["confirm", "confirmar", "sim", "1"].includes(v)) return "confirm";
  if (["cancel", "cancelar", "não", "nao", "2"].includes(v)) return "cancel";
  return "unknown";
}

export async function handleWebhookValue(value: WebhookValue) {
  const academy = await academyRepo.findByPhoneNumberId(
    value.metadata.phone_number_id,
  );

  // numero que não pertence a nenhuma academia
  if (!academy) {
    console.warn(
      "[webhook] phone_number_id sem academia: ",
      value.metadata.phone_number_id,
    );
    return;
  }

  // vista / lida / falhou das mensagens enviadas pela academia
  for (const s of value.statuses ?? [])
    await inbox.recordStatus(s.id, s.status);

  for (const msg of value.messages ?? []) {
    const student = await studentRepo.findByPhone(
      msg.from.replace(/^55/, ""),
      academy.id,
    );
    const isNew = await inbox.recordInbound(academy.id, msg, {
      name: value.contacts?.find((c) => c.wa_id === msg.from)?.profile?.name,
      studentId: student?.id,
    });

    // Repetido, já tratado antes não confirma/cancela dnv
    if (isNew && student) await runAutomation(msg, student.id, academy.id);
  }
}

async function runAutomation(
  msg: InboundMessage,
  studentId: string,
  academyId: string,
) {
  const intent = parseIntent(msg);
  console.log(`[webhook] de ${msg.from} -> intenção ${intent}`);
  if (intent === "unknown") return;

  const appt = await appointmentRepo.findNextActiveByStudent(
    studentId,
    academyId,
  );
  if (!appt) return;

  const actor = {
    type: "STUDENT" as const,
    id: studentId,
    note: "via WhatsApp",
  };
  if (intent === "confirm")
    await appointmentService.confirm(appt.id, academyId, actor);
  else await appointmentService.cancel(appt.id, academyId, actor);

  const reply =
    intent === "confirm"
      ? "Presença confirmada! Até logo :D"
      : "Tudo bem, sua presença foi cancelada!";
  const sent = await whatsapp.sendText(msg.from, reply);
  await inbox.recordOutbound(academyId, sent, {
    type: "text",
    text: reply,
    studentId,
  });
}
