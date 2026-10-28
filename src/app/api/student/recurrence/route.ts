import { StudentAppointmentController } from "@/server/controllers/StudentAppointmentController";
import { authenticateStudent } from "@/server/middleware/StudentAuthMiddleware";

const controller = new StudentAppointmentController();

export async function GET(req: Request) {
  const { error, studentId, academyId } = await authenticateStudent(req);
  if (error) return error;
  return controller.getRecurrence(studentId!, academyId!);
}

export async function PUT(req: Request) {
  const { error, studentId, academyId } = await authenticateStudent(req);
  if (error) return error;
  return controller.setRecurrence(req, studentId!, academyId!);
}
