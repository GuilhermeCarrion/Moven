import { prisma } from "@/lib/prisma";

export class ConversationRepository {
  // Mensagem do contato: abre/renova a janela de 24h e conta como não lida
  async touchInbound(
    academyId: string,
    waId: string,
    data: { contactName?: string; studentId?: string | null },
  ) {
    const now = new Date();
    return await prisma.conversation.upsert({
      where: { academyId_waId: { academyId, waId } },
      create: {
        academyId,
        waId,
        contactName: data.contactName,
        studentId: data.studentId ?? null,
        lastInboundAt: now,
        lastMessageAt: now,
        unreadCount: 1,
      },
      update: {
        contactName: data.contactName,
        studentId: data.studentId ?? undefined, // não mexe
        lastInboundAt: now,
        lastMessageAt: now,
        unreadCount: { increment: 1 },
      },
    });
  }

  // Mensagem da academia (automação ou chat): só reordena a lista, não mexe na janela
  async touchOutbound(
    academyId: string,
    waId: string,
    studentId?: string | null,
  ) {
    const now = new Date();
    return await prisma.conversation.upsert({
      where: { academyId_waId: { academyId, waId } },
      create: {
        academyId,
        waId,
        studentId: studentId ?? null,
        lastMessageAt: now,
      },
      update: { lastMessageAt: now, studentId: studentId ?? undefined },
    });
  }

  async listByAcademy(academyId: string) {
    return await prisma.conversation.findMany({
      where: { academyId },
      orderBy: { lastMessageAt: "desc" },
      include: {
        student: { select: { name: true } },
        // Ultima mensagem = previa na lista de conversa
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { text: true, type: true, direction: true, createdAt: true },
        },
      },
    });
  }

  async findById(id: string, academyId: string) {
    return await prisma.conversation.findFirst({
      where: { id, academyId },
      include: { student: { select: { id: true, name: true } } },
    });
  }

  async markRead(id: string) {
    return await prisma.conversation.update({
      where: { id },
      data: { unreadCount: 0 },
    });
  }
}
