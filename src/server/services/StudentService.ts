import { StudentSchema, StudentUpdateSchema } from "@/schemas/students.schema";
import { StudentRepository } from "../repositories/StudentRepository";
import { AppError } from "@/lib/errors";
import { JobService } from "./JobService";
import { JobType } from "@prisma/client";

const repository = new StudentRepository();
const jobService = new JobService();

export class StudentService {
  async create(data: StudentSchema, academyId: string) {
    const exist = await repository.findByCpf(data.cpf, academyId);

    if (exist)
      throw new AppError("Aluno já cadastrado com esse CPF nesta unidade", 409);

    // Passando valor correto quando não informado email.
    // "" (vazio), vira null
    const email = data.email ? data.email : null;

    const student = await repository.create({ ...data, email, academyId });

    try {
      await jobService.enqueue({
        academyId,
        type: JobType.WELCOME,
        relatedId: student.id,
        payload: { to: "55" + student.phone, studentName: student.name },
      });
    } catch (e) {
      console.error("Falha ao enfileirar boas-vindas:", e);
    }

    return student;
  }

  async list(academyId: string) {
    return await repository.findAll(academyId);
  }

  async getById(id: string, academyId: string) {
    const student = await repository.findById(id, academyId);

    if (!student) throw new AppError("Aluno não encontrado", 404);

    return student;
  }

  async update(id: string, data: StudentUpdateSchema, academyId: string) {
    const student = await repository.findById(id, academyId);

    if (!student) throw new AppError("Aluno não encontrado", 404);

    // Validando se quando trocar o CPF, não esteja já cadastrado na unidade
    // "Se existe CPF e ele não é o mesmo do aluno encontrado, então..."
    if (data.cpf && data.cpf !== student.cpf) {
      const exist = await repository.findByCpf(data.cpf, academyId);
      if (exist)
        throw new AppError(
          "Já existe um aluno com este CPF nesta unidade",
          409,
        );
    }

    const email = data.email === "" ? null : data.email;

    return await repository.update(id, { ...data, email });
  }

  // Inativação - soft delete
  async setActive(id: string, active: boolean, academyId: string) {
    const student = await repository.findById(id, academyId);

    if (!student) throw new AppError("Aluno não encontrado", 404);

    return await repository.update(id, { active });
  }
}
