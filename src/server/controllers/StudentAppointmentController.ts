import { NextResponse } from "next/server";
import { StudentAppointmentService } from "../services/StudentAppointmentService";
import { AppError, handleError } from "@/lib/errors";
import {
  studentApptActionSchema,
  studentBookSchema,
} from "@/schemas/studentAppointment.schema";

const service = new StudentAppointmentService();

export class StudentAppointmentController {
  async listDay(req: Request, studentId: string, academyId: string) {
    try {
      const url = new URL(req.url);
      const fromStr = url.searchParams.get("from");
      const toStr = url.searchParams.get("to");
      const from = fromStr ? new Date(fromStr) : undefined;
      const to = toStr ? new Date(toStr) : undefined;

      const result = await service.listDay(studentId, academyId, from, to);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }

  async listMine(studentId: string, academyId: string) {
    try {
      const result = await service.listMine(studentId, academyId);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }

  async history(studetnId: string, academyId: string) {
    try {
      const result = await service.history(studetnId, academyId);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }

  async book(req: Request, studentId: string, academyId: string) {
    try {
      const body = await req.json();
      const parsed = studentBookSchema.safeParse(body);
      if (!parsed.success)
        throw new AppError(
          "Dados inválidos: " + parsed.error.issues[0].message,
          400,
        );

      const result = await service.book(
        studentId,
        academyId,
        parsed.data.classSessionId,
        parsed.data.releaseAppointmentId,
      );
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  }

  async action(req: Request, id: string, studentId: string, academyId: string) {
    try {
      const body = await req.json();
      const parsed = studentApptActionSchema.safeParse(body);
      if (!parsed.success)
        throw new AppError(
          "Dados inválidos: " + parsed.error.issues[0].message,
          400,
        );

      const result =
        parsed.data.action === "confirm"
          ? await service.confirm(studentId, academyId, id)
          : await service.cancel(studentId, academyId, id);

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  }
}
