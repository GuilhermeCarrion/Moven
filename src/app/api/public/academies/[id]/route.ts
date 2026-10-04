import { StudentPublicController } from "@/server/controllers/StudentPublicController";

const controller = new StudentPublicController();

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  const { id } = await params;
  return controller.academy(id);
}
