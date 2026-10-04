import { prisma } from "@/lib/prisma";
import { ActorType } from "@prisma/client";

export class AcademyReposistory {
  async findById(id: string) {
    return await prisma.academy.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
  }
}

export type Actor = { type: ActorType; id?: string; note?: string | null };
