import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { StudentAuthService } from "../services/StudentAuthService";
import { NextResponse } from "next/server";
import { studentLoginSchema } from "@/schemas/studentAuth.schema";
import { AppError, handleError } from "@/lib/errors";
import { clearStudentCookie, setStudentCookie } from "@/lib/auth/cookies";

const studentAuthService = new StudentAuthService();

export class StudentAuthController {
  async login(req: Request) {
    try {
      // Rate Limit: trava brute force
      const ip = getClientIp(req);
      const rl = rateLimit(`aluno-login:${ip}`, 10, 60_000);
      if (!rl.allowed) {
        const res = NextResponse.json(
          { error: "Muitas tentativas. Aguarde um momento" },
          { status: 409 },
        );
        res.headers.set("Retry-After", String(rl.retryAfterSec));
        return res;
      }

      const body = await req.json();
      const parsed = studentLoginSchema.safeParse(body);
      if (!parsed.success) {
        throw new AppError(
          "Dados inválidos: " + parsed.error.issues[0].message,
          400,
        );
      }

      const { cpf, birthDate } = parsed.data;
      const { token, student } = await studentAuthService.login(cpf, birthDate);

      // TOken vai no cookie httpOnly, corpo devolve dados do aluno;
      const res = NextResponse.json({ student }, { status: 200 });
      return setStudentCookie(res, token);
    } catch (error) {
      return handleError(error);
    }
  }

  logout() {
    const res = NextResponse.json({ ok: true }, { status: 200 });
    return clearStudentCookie(res);
  }

  async getMe(studentId: string, academyId: string) {
    try {
      const student = await studentAuthService.getProfile(studentId, academyId);
      return NextResponse.json(student, { status: 200 });
    } catch (error) {
      handleError(error);
    }
  }
}
