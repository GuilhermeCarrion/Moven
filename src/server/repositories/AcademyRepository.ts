import { prisma } from "@/lib/prisma";
import { ActorType } from "@prisma/client";

export class AcademyReposistory {
  async findById(id: string) {
    return await prisma.academy.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
  }

  // webhook: descobre a academia pelo numero da Meta que recebeu a mensagem
  async findByPhoneNumberId(phoneNumberId: string) {
    return await prisma.academy.findUnique({
      where: { whatsappPhoneNumberId: phoneNumberId },
      select: { id: true },
    });
  }

  async listForSweep() {
    return await prisma.academy.findMany({
      select: { id: true, cancelWindowHours: true },
    });
  }
}

export type Actor = { type: ActorType; id?: string; note?: string | null };
