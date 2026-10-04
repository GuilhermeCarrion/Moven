import { StudentAuthController } from "@/server/controllers/StudentAuthController";

const studentAuthController = new StudentAuthController();

export async function POST() {
  return studentAuthController.logout();
}
