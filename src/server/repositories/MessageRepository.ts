import { prisma } from "@/lib/prisma";
import { MessageStatus, Prisma } from "@prisma/client";

const PROGRESS: MessageStatus[] = [
  MessageStatus.SENT,
  MessageStatus.DELIVERED,
  MessageStatus.READ,
];

export class MessageRepository {
  async create(data: Prisma.MessageUncheckedCreateInput) {
    return await prisma.message.create({ data });
  }

  // A Meta reenvia o webhook se não recebeu 200 a tempo
  async existByWaId(waMessageId: string) {
    const found = await prisma.message.findUnique({
      where: { waMessageId },
      select: { id: true },
    });

    return !!found;
  }

  // thread inteira: paginar quando as conversas ficarem longas
  async listByConversation(conversationId: string) {
    return await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }

  // Status chegam fora de ordem (READ antes de DELIVERED): só avança, nunca regride
  async advancedStatus(waMessageId: string, status: MessageStatus) {
    const from =
      status === MessageStatus.FAILED
        ? [MessageStatus.SENT]
        : PROGRESS.slice(0, PROGRESS.indexOf(status));

    return await prisma.message.updateMany({
      where: { waMessageId, status: { in: from } },
      data: { status },
    });
  }
}
