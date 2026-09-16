import { UserController } from "@/server/controllers/UserController";
import { authorizeRequest } from "@/server/middleware/AuthMiddleware";
import { Role } from "@prisma/client";

const userController = new UserController();
type Context = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Context) {
  const { error, userId, role, academyId } = await authorizeRequest(req, [
    Role.ADMIN,
    Role.GESTOR,
  ]);
  if (error) return error;
  const { id } = await params;
  return userController.resetPassword(req, id, {
    id: userId as string,
    role: role as Role,
    academyId: academyId as string,
  });
}
