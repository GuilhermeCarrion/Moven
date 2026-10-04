import { AppError } from "@/lib/errors";
import { StudentRepository } from "../repositories/StudentRepository";
import { singStudentToken } from "@/lib/auth/tokens";

const studentRepository = new StudentRepository();

export class StudentAuthService {
  async login(cpf: string, birthDate: string) {
    const student = await studentRepository.findByCpfOnly(cpf);

    const invalid = new AppError("CPF ou data de nascimento inválidos", 401);
    if (!student || !student.active) throw invalid;

    const stored = student.birthDate
      ? new Date(student.birthDate).toISOString().slice(0, 10)
      : null;

    if (!stored || stored !== birthDate) throw invalid;

    const token = singStudentToken({
      studentId: student.id,
      academyId: student.academyId,
    });

    return {
      token,
      student: {
        id: student.id,
        name: student.name,
        academyId: student.academyId,
      },
    };
  }

  async getProfile(studentId: string, academyId: string) {
    const student = await studentRepository.findById(studentId, academyId);
    if (!student) throw new AppError("Aluno não encontrado", 404);
    return student;
  }
}
