import { UserController } from "@/server/controllers/UserController";
import { authenticateRequest } from "@/server/middleware/AuthMiddleware";

const userController = new UserController();

export async function POST(req: Request) {
  const { error, userId } = authenticateRequest(req);
  if (error) return error;
  return userController.logoutAll(userId as string);
}
