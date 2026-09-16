import { Role } from "@prisma/client";
import { prisma } from "../../lib/prisma";

// Busca usuário da academia
export class UserRepository {
  async listByAcademy(academyId: string) {
    return await prisma.user.findMany({
      where: { academyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    academyId: string;
  }) {
    return await prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      role: Role;
      active: boolean;
    }>,
  ) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
  }

  async setPassword(id: string, password: string) {
    return await prisma.user.update({ where: { id }, data: { password } });
  }

  // Usuário completo (inclui hash de senha) - para trocar a propria senha
  async findWithPassword(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  }

  // Protege o ultimo gestor ativo da academia
  async countActiveByRole(academyId: string, role: Role) {
    return await prisma.user.count({
      where: { academyId, role, active: true },
    });
  }

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
