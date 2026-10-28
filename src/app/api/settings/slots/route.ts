import { ScheduleController } from "@/server/controllers/ScheduleController";
import { authorizeRequest } from "@/server/middleware/AuthMiddleware";
import { Role } from "@prisma/client";

const controller = new ScheduleController();

export async function POST(req: Request) {
  const { error, academyId } = await authorizeRequest(req, [
    Role.ADMIN,
    Role.GESTOR,
  ]);
  if (error) return error;
  return controller.storeSlot(req, academyId!);
}
