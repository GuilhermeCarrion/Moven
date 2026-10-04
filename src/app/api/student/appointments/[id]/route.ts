import { StudentAppointmentController } from "@/server/controllers/StudentAppointmentController";
import { authenticateStudent } from "@/server/middleware/StudentAuthMiddleware";

const controller = new StudentAppointmentController();

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Context) {
  const { error, studentId, academyId } = await authenticateStudent(req);
  if (error) return error;

  const { id } = await params;
  return controller.action(req, id, studentId!, academyId!);
}
