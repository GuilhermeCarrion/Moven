import { NextResponse } from "next/server";
import { StudentProfileRepository } from "../services/StudentProfileService";
import { AppError, handleError } from "@/lib/errors";
import { studentProfileUpdateSchema } from "@/schemas/studentProfile.schema";

const service = new StudentProfileRepository();

export class StudentProfileController {
  async show(studentId: string, academyId: string) {
    try {
      const result = await service.get(studentId, academyId);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }

  async update(req: Request, studentId: string, academyId: string) {
    try {
      const body = await req.json();
      const parsed = studentProfileUpdateSchema.safeParse(body);
      if (!parsed.success)
        throw new AppError(
          "Dados inválidos" + parsed.error.issues[0].message,
          400,
        );

      const result = await service.updateOwnProfile(
        studentId,
        academyId,
        parsed.data,
      );

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }

  async credits(studentId: string, academyId: string) {
    try {
      const result = await service.getCredits(studentId, academyId);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }
}
