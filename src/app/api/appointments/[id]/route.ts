import { AppointmentController } from "@/server/controllers/AppointmentController";
import { authorizeRequest } from "@/server/middleware/AuthMiddleware";
import { Role } from "@prisma/client";

const controller = new AppointmentController();
type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Context) {
  const { error, academyId, userId } = await authorizeRequest(req, [
    Role.ADMIN,
    Role.GESTOR,
    Role.PROFESSOR,
  ]);
  if (error) return error;

  const { id } = await params;
  return controller.action(req, id, academyId as string, userId as string);
}
