import { MessageDirection, MessageStatus } from "@prisma/client";
import { ConversationRepository } from "../repositories/ConversationRepository";
import { MessageRepository } from "../repositories/MessageRepository";
import { InboundMessage, SendResult } from "../whatsapp/types";
import { AppError } from "@/lib/errors";
import { whatsapp } from "../whatsapp";

const conversations = new ConversationRepository();
const messages = new MessageRepository();

const WINDOW_MS = 24 * 60 * 60 * 1000;

const isWindowOpen = (lastInboundAt: Date | null) =>
  !!lastInboundAt && Date.now() - lastInboundAt.getTime() < WINDOW_MS;

// Status que a Meta manda no webhook -> novo enum
const META_STATUS: Record<string, MessageStatus> = {
  sent: MessageStatus.SENT,
  delivered: MessageStatus.DELIVERED,
  read: MessageStatus.READ,
  failed: MessageStatus.FAILED,
};

export class InboxService {
  // Devolve false quando é webhook repetido (ja esperado antes)
  async recordInbound(
    academyId: string,
    msg: InboundMessage,
    contact: { name?: string; studentId?: string | null },
  ) {
    if (await messages.existByWaId(msg.id)) return false;

    const conv = await conversations.touchInbound(academyId, msg.from, {
      contactName: contact.name,
      studentId: contact.studentId,
    });
    await messages.create({
      conversationId: conv.id,
      direction: MessageDirection.IN,
      type: msg.type,

      //texto, botão de template ou botão interativo. Mídia fica sem texto( a tela mostra pelo tipo)
      text:
        msg.text?.body ??
        msg.button?.text ??
        msg.interactive?.button_reply?.title ??
        null,
      waMessageId: msg.id,
      status: MessageStatus.RECEIVED,
    });
    return true;
  }

  // Best-effort: quando isso roda, a mensagem já saiu. Se uma falha aqui subisse.
  // o job seria refeito e o aluno receberia duas vezes a mensagem
  async recordOutbound(
    academyId: string,
    sent: SendResult,
    data: {
      type: string;
      text: string;
      studentId?: string | null;
      sentById?: string;
    },
  ) {
    try {
      const conv = await conversations.touchOutbound(
        academyId,
        sent.waId,
        data.studentId,
      );
      await messages.create({
        conversationId: conv.id,
        direction: MessageDirection.OUT,
        type: data.type,
        text: data.text,
        waMessageId: sent.id,
        status: MessageStatus.SENT,
        sentById: data.sentById,
      });
    } catch (e) {
      console.error("[inbox] falha ao registrar mensagem enviada:", e);
    }
  }

  async recordStatus(waMessageId: string, metaStatus: string) {
    const status = META_STATUS[metaStatus];
    if (status) await messages.advancedStatus(waMessageId, status);
  }

  async list(academyId: string) {
    const rows = await conversations.listByAcademy(academyId);
    return rows.map((c) => ({
      id: c.id,
      name: c.student?.name ?? c.contactName ?? c.waId,
      isStudent: !!c.studentId,
      unreadCount: c.unreadCount,
      lastMessageAt: c.lastMessageAt,
      preview: c.messages[0] ?? null,
      windowOpen: isWindowOpen(c.lastInboundAt),
    }));
  }

  async getThread(id: string, academyId: string) {
    const conv = await conversations.findById(id, academyId);
    if (!conv) throw new AppError("Conversa não encontrada", 404);

    // Só grava quando há algo para zerar: o polling abre thread a cada poucos segundos
    if (conv.unreadCount > 0) await conversations.markRead(conv.id);

    return {
      conversation: {
        id: conv.id,
        name: conv.student?.name ?? conv.contactName ?? conv.waId,
        waId: conv.waId,
        student: conv.student,
        windowOpen: isWindowOpen(conv.lastInboundAt),
        windowClosesAt: conv.lastInboundAt
          ? new Date(conv.lastInboundAt.getTime() + WINDOW_MS)
          : null,
      },
      messages: await messages.listByConversation(conv.id),
    };
  }

  async send(id: string, academyId: string, text: string, userId: string) {
    const conv = await conversations.findById(id, academyId);
    if (!conv) throw new AppError("Conversa não encontrada", 404);

    if (!isWindowOpen(conv.lastInboundAt))
      throw new AppError(
        "Fora da janela de 24h: só é possível responder depois que o contato enviar uma nova mensagem",
        409,
      );

    let sent: SendResult;

    try {
      sent = await whatsapp.sendText(conv.waId, text);
    } catch (e) {
      console.error("[inbox] falha no envio:", e);
      throw new AppError(
        "Não foi possivel enviar pelo WhatsApp. Tente novamente",
        502,
      );
    }

    await this.recordOutbound(academyId, sent, {
      type: "text",
      text,
      studentId: conv.studentId,
      sentById: userId,
    });
    return { ok: true };
  }
}
