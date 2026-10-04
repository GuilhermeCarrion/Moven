import { AppError } from "@/lib/errors";
import { AcademyReposistory } from "../repositories/AcademyRepository";
import { StudentService } from "./StudentService";
import { StudentSchema } from "@/schemas/students.schema";

const academyReposistory = new AcademyReposistory();
const studentService = new StudentService();

export class StudentPublicService {
  async academyInfo(academyId: string) {
    const academy = await academyReposistory.findById(academyId);
    if (!academy) throw new AppError("Academia não encontrada", 404);

    return { id: academy.id, name: academy.name };
  }

  async singup(academyId: string, data: StudentSchema) {
    const academy = await academyReposistory.findById(academyId);
    if (!academy) throw new AppError("Academia não encontrada", 404);

    // Reutiliza toda regra alunos + enfileira WELCOME do whatsapp
    const student = await studentService.create(data, academyId);
    return { id: student.id, name: student.name };
  }
}
