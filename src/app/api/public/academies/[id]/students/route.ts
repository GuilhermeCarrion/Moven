import { StudentPublicController } from "@/server/controllers/StudentPublicController";

const controller = new StudentPublicController();

type Context = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Context) {
  const { id } = await params;
  return controller.singup(req, id);
}
