import { InboxController } from "@/server/controllers/InboxController";
import { authorizeRequest } from "@/server/middleware/AuthMiddleware";

const controller = new InboxController();

// Todos os perfis acessam o inbox, sem lista de papeis, o authorize só confere se usuário esta ativo
export async function GET(req: Request) {
  const { error, academyId } = await authorizeRequest(req);
  if (error) return error;

  return controller.index(academyId!);
}
