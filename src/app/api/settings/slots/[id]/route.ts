import { ScheduleController } from "@/server/controllers/ScheduleController";
import { authorizeRequest } from "@/server/middleware/AuthMiddleware";
import { Role } from "@prisma/client";

const controller = new ScheduleController();
type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Context) {
  const { error, academyId } = await authorizeRequest(req, [
    Role.ADMIN,
    Role.GESTOR,
  ]);
  if (error) return error;
  const { id } = await params;
  return controller.updateSlot(req, id, academyId!);
}
