import { readCookie, STUDENT_COOKIE } from "@/lib/auth/cookies";
import { verifyStudentToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";
import { error } from "console";
import { NextResponse } from "next/server";

export async function authenticateStudent(request: Request) {
  const token = readCookie(request, STUDENT_COOKIE);

  if (!token) {
    return {
      error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
      studentId: null,
      academyId: null,
    };
  }

  let studentId: string;
  let academyId: string;

  try {
    // Recusa token se não for de aluno "kind: student"
    const decoded = verifyStudentToken(token);
    studentId = decoded.studentId;
    academyId = decoded.academyId;
  } catch {
    return {
      error: NextResponse.json(
        { error: "Sessão inválida ou expirada" },
        { status: 401 },
      ),
      studentId: null,
      academyIdId: null,
    };
  }

  // Verifica aluno no banco, inativo é revogado na hora
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { active: true, academyId: true },
  });

  if (!student || !student.active || student.academyId !== academyId) {
    return {
      error: NextResponse.json(
        { error: "Aluno inválido ou inativo" },
        { status: 401 },
      ),
      studentId: null,
      academyId: null,
    };
  }

  return { error: null, studentId, academyId };
}
