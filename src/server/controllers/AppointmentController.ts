import { AppError, handleError } from "@/lib/errors";
import { AppointmentService } from "../services/AppointmentService";
import {
  appointmentActionSchema,
  appointmentSchema,
  attendanceSchema,
} from "@/schemas/appointment.schema";
import { NextResponse } from "next/server";
import { AttendanceStatus, CancelReason } from "@prisma/client";

const service = new AppointmentService();

export class AppointmentController {
  async store(req: Request, academyId: string, userId: string) {
    try {
      const body = await req.json();
      const parsed = appointmentSchema.safeParse(body);
      if (!parsed.success) throw new AppError("Dados inválidos", 400);

      const result = await service.create(parsed.data, academyId, {
        type: "STAFF",
        id: userId,
      });
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  }

  async index(classSessionId: string, academyId: string) {
    try {
      const result = await service.listBySession(classSessionId, academyId);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }

  async action(req: Request, id: string, academyId: string, userId: string) {
    try {
      const body = await req.json();
      const parsed = appointmentActionSchema.safeParse(body);
      if (!parsed.success)
        throw new AppError(
          "Dados inválidos: " + parsed.error.issues[0].message,
          400,
        );

      const { action, targetClassSessionId } = parsed.data;
      const actor = { type: "STAFF" as const, id: userId };
      let result;

      if (action === "confirm") {
        result = await service.confirm(id, academyId, actor);
      } else if (action === "cancel") {
        result = await service.cancel(id, academyId, actor);
      } else {
        if (!targetClassSessionId)
          throw new AppError(
            "targetClassSessionId é obrigatório para remarcar",
            400,
          );
        result = await service.cancel(id, academyId, actor, CancelReason.STAFF);
      }

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }

  async attendance(
    req: Request,
    id: string,
    academyId: string,
    userId: string,
  ) {
    try {
      const body = await req.json();
      const parsed = attendanceSchema.safeParse(body);
      if (!parsed.success) {
        throw new AppError(
          "Dados inválidos: " + parsed.error.issues[0].message,
          400,
        );
      }

      const result = await service.setAttendance(
        id,
        parsed.data.attendance as AttendanceStatus,
        academyId,
        userId,
      );

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }
}
