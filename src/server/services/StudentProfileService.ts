import { AppError } from "@/lib/errors";
import { StudentRepository } from "../repositories/StudentRepository";
import { StudentPackageRepository } from "../repositories/StudentPackageRepository";

const studentRepository = new StudentRepository();
const studentPackageRepository = new StudentPackageRepository();

export class StudentProfileRepository {
  async get(studentId: string, academyId: string) {
    const s = await studentRepository.findProfile(studentId, academyId);
    if (!s) throw new AppError("Aluno não encontrado", 404);

    const pkg = s.studentPackages[0] ?? null;

    return {
      name: s.name,
      cpf: s.cpf,
      birthDate: s.birthDate,
      phone: s.phone,
      email: s.email,
      heightCm: s.heightCm,
      weightKg: s.weightKg,
      package: pkg
        ? {
            planName: pkg.plan.name,
            creditsRemaining: pkg.creditsRemaining,
            creditsTotal: pkg.creditsTotal,
            expiresAt: pkg.expiresAt,
            status: pkg.status,
          }
        : null,
    };
  }

  async getCredits(studentId: string, academyId: string) {
    const credits = await studentPackageRepository.sumActiveCredits(
      studentId,
      academyId,
    );
    return { credits };
  }

  async updateOwnProfile(
    studentId: string,
    academyId: string,
    data: { email?: string; heightCm: number; weightKg: number },
  ) {
    const existing = await studentRepository.findById(studentId, academyId);
    if (!existing) throw new AppError("Aluno não encontrado", 404);

    return await studentRepository.update(studentId, {
      email: data.email || null,
      heightCm: data.heightCm,
      weightKg: data.weightKg,
    });
  }
}
