import { InboxController } from "@/server/controllers/InboxController";
import { authorizeRequest } from "@/server/middleware/AuthMiddleware";

const controller = new InboxController();

type Context = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Context) {
  const { error, academyId } = await authorizeRequest(req);
  if (error) return error;

  const { id } = await params;
  return controller.thread(id, academyId);
}

export async function POST(req: Request, { params }: Context) {
  const { error, academyId, userId } = await authorizeRequest(req);
  if (error) return error;

  const { id } = await params;
  return controller.send(req, id, academyId!, userId!);
}
