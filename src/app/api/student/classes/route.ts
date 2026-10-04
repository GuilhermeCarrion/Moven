import { StudentAppointmentController } from "@/server/controllers/StudentAppointmentController";
import { authenticateStudent } from "@/server/middleware/StudentAuthMiddleware";

const controller = new StudentAppointmentController();

export async function GET(req: Request) {
  const { error, studentId, academyId } = await authenticateStudent(req);
  if (error) return error;

  return controller.listDay(req, studentId!, academyId!);
}
