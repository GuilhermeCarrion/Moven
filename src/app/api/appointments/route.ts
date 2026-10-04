import { AppointmentController } from "@/server/controllers/AppointmentController";
import {
  authenticateRequest,
  authorizeRequest,
} from "@/server/middleware/AuthMiddleware";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

const appointmentController = new AppointmentController();

export async function POST(req: Request) {
  const { error, academyId, userId } = await authorizeRequest(req, [
    Role.ADMIN,
    Role.GESTOR,
    Role.PROFESSOR,
  ]);
  if (error) return error;

  //Store executara a validação de lotação e duplicidade
  return appointmentController.store(req, academyId!, userId!);
}

export async function GET(req: Request) {
  const { error, academyId } = authenticateRequest(req);
  if (error) return error;

  const classSessionId = new URL(req.url).searchParams.get("classSessionId");
  if (!classSessionId)
    return NextResponse.json(
      { error: "Parâmetro classSessionId é obrigatório" },
      { status: 400 },
    );

  return appointmentController.index(classSessionId, academyId as string);
}
