import { AuthController } from "@/server/controllers/AuthController";

const authController = new AuthController();

export async function POST(req: Request) {
  return authController.refresh(req);
}
