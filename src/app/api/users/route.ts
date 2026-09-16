import { UserController } from "@/server/controllers/UserController";
import { authorizeRequest } from "@/server/middleware/AuthMiddleware";
import { Role } from "@prisma/client";

const userController = new UserController();

export async function GET(req: Request) {
  const { error, academyId } = await authorizeRequest(req, [
    Role.ADMIN,
    Role.GESTOR,
  ]);
  if (error) return error;
  return userController.index(academyId as string);
}

export async function POST(req: Request) {
  const { error, userId, role, academyId } = await authorizeRequest(req, [
    Role.ADMIN,
    Role.GESTOR,
  ]);
  if (error) return error;
  return userController.store(req, {
    id: userId as string,
    role: role as Role,
    academyId: academyId as string,
  });
}
