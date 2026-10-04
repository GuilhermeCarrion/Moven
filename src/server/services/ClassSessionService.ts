import { ClassSessionSchema } from "@/schemas/classSession.schema";
import { ClassSessionRepository } from "../repositories/ClassSessionRepository";
import { AppError } from "@/lib/errors";

const repository = new ClassSessionRepository();

export class ClassSessionService {
  async create(data: ClassSessionSchema, academyId: string) {
    // Prisma já garante a unicidade via @@unique([academyId, startAt]) no schema
    return await repository.create({ ...data, academyId });
  }

  async list(academyId: string, from?: Date, to?: Date) {
    return await repository.findAll(academyId, from, to);
  }

  async listByIds(ids: string[], academyId: string) {
    return await repository.findManyByIds(ids, academyId);
  }

  async update(
    id: string,
    data: Partial<ClassSessionSchema>,
    academyId: string,
  ) {
    const classSession = await repository.findById(id, academyId);

    if (!classSession) throw new AppError("Aula não encontrada", 404);

    return await repository.update(id, data);
  }
}
