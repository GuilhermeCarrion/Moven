import { prisma } from "../../lib/prisma";

interface CreateSessionDTO {
  userId: string;
  token: string;
  expiresAt: Date;
}

export class SessionRepository {
  async create({ userId, token, expiresAt }: CreateSessionDTO) {
    return await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  // Busca pela sessão pleo hash do refresh token
  async findByToken(token: string) {
    return await prisma.session.findUnique({ where: { token } });
  }

  // Remove uma sessão específica (logout / rotação)
  // deleteMany é indepotente: não lança erro se não encontrar nada.
  async deleteByToken(token: string) {
    return await prisma.session.deleteMany({ where: { token } });
  }

  // Remove todas as sessões de um usuário (troca de senha / "sair de todos os aparelhos")
  async deleteAllForUser(userId: string) {
    return await prisma.session.deleteMany({ where: { userId } });
  }
}
