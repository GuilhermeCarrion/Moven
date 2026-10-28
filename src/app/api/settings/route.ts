import { ScheduleController } from "@/server/controllers/ScheduleController";
import { authorizeRequest } from "@/server/middleware/AuthMiddleware";
import { Role } from "@prisma/client";

const controller = new ScheduleController();
const MANAGERS = [Role.ADMIN, Role.GESTOR];

export async function GET(req: Request) {
  const { error, academyId } = await authorizeRequest(req, MANAGERS);
  if (error) return error;
  return controller.index(academyId!);
}

export async function PATCH(req: Request) {
  const { error, academyId } = await authorizeRequest(req, MANAGERS);
  if (error) return error;
  return controller.updateSettings(req, academyId!);
}
