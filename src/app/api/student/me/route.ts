import { StudentAuthController } from "@/server/controllers/StudentAuthController";
import { authenticateStudent } from "@/server/middleware/StudentAuthMiddleware";

const studentAuthController = new StudentAuthController();

export async function GET(req: Request) {
  const { error, studentId, academyId } = await authenticateStudent(req);
  if (error) return error;

  return studentAuthController.getMe(studentId!, academyId!);
}
