import { prisma } from "../../lib/prisma";

// Busca usuário da academia
export class UserRepository {
  // Método de busca de usuário pelo email
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        academy: { select: { name: true } },
      },
    });
  }

  // Método de busca de usuário pelo ID
  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        academyId: true,
        email: true,
        name: true,
        active: true,
        role: true,
        academy: {
          select: { name: true },
        },
      },
    });
  }

  async setLoginState(
    userId: string,
    data: { failedLoginAttempts?: number; lockedUntil?: Date | null },
  ) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
