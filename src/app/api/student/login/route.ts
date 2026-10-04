import { StudentAuthController } from "@/server/controllers/StudentAuthController";

const studentAuthController = new StudentAuthController();

export async function POST(req: Request) {
  return studentAuthController.login(req);
}
