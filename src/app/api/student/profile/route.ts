import { StudentProfileController } from "@/server/controllers/StudentProfileController";
import { authenticateStudent } from "@/server/middleware/StudentAuthMiddleware";

const controller = new StudentProfileController();

export async function GET(req: Request) {
  const { error, studentId, academyId } = await authenticateStudent(req);
  if (error) return error;

  return controller.show(studentId, academyId);
}

export async function PATCH(req: Request) {
  const { error, studentId, academyId } = await authenticateStudent(req);
  if (error) return error;

  return controller.update(req, studentId, academyId);
}
