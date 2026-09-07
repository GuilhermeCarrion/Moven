import { whatsapp } from ".";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { StudentRepository } from "../repositories/StudentRepository";
import { AppointmentService } from "../services/AppointmentService";

const appointmentService = new AppointmentService();
const studentRepo = new StudentRepository();
const appointmentRepo = new AppointmentRepository();

type InboundMessage = {
  from: string;
  type: string;
  text?: { body: string };
  button?: { payload: string; text: string };
  interactive?: { button_reply?: { id: string; title: string } };
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
  if (["cancel", "cancelar", "nao", "não", "2"].includes(v)) return "cancel";
  return "unknown";
}

export async function handleInboudMessage(msg: InboundMessage) {
  const intent = parseIntent(msg);
  const phone = msg.from;
  console.log(`[webhook] de ${phone} -> intenção ${intent}`);
  if (intent === "unknown") return;

  const local = phone.replace(/^55/, ""); // remove cod. pais
  const student = await studentRepo.findByPhone(local);
  if (!student) return;

  const appt = await appointmentRepo.findNextActiveByStudent(
    student.id,
    student.academyId,
  );
  if (!appt) return;

  if (intent === "confirm") {
    await appointmentService.confirm(appt.id, student.academyId);
    await whatsapp.sendText(phone, "Presença confirmada! Até logo :D");
  } else {
    await appointmentService.cancel(appt.id, student.academyId);
    await whatsapp.sendText(phone, "Tudo bem, sua precença foi cancelada!");
  }
}
