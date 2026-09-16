import { Role } from ".prisma/client";
import { SessionRepository } from "../repositories/SessionRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "@/lib/errors";
import bcrypt from "bcryptjs";

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();

interface Actor {
  id: string;
  role: Role;
  academyId: string;
}

export class UserService {
  async list(academyId: string) {
    return userRepository.listByAcademy(academyId);
  }

  async create(
    actor: Actor,
    data: { name: string; email: string; password: string; role: Role },
  ) {
    // Gestor não cria ADMIN
    if (actor.role === "GESTOR" && data.role === "ADMIN") {
      throw new AppError("Você não pode criar um usuário ADMIN", 403);
    }

    const exists = await userRepository.findByEmail(data.email);
    if (exists) throw new AppError("Já existe um usuário com esse e-mail", 409);

    const passwordHash = await bcrypt.hash(data.password, 10);
    return userRepository.create({
      name: data.name,
      email: data.email,
      password: passwordHash,
      role: data.role,
      academyId: actor.academyId,
    });
  }

  async update(
    actor: Actor,
    targetId: string,
    data: { name?: string; email?: string; role?: Role; active?: boolean },
  ) {
    const target = await this.loadTargetInAcademy(actor, targetId);

    // Não deixa editar si mesmo pela gestão
    if (target.id === actor.id) {
      throw new AppError(
        "Use a tela 'Meu perfil' para editar seus próprios dados",
        400,
      );
    }
    this.assertCanManage(actor.role, target.role);

    if (data.role === "ADMIN" && actor.role !== "ADMIN") {
      throw new AppError("Apenas ADMIN pode atribuir papel ADMIN", 403);
    }

    // Protegendo ultimo gestor
    const removendoGestor =
      target.role === "GESTOR" &&
      (data.active === false || (data.role && data.role !== "GESTOR"));

    if (removendoGestor) {
      const gestores = await userRepository.countActiveByRole(
        actor.academyId,
        "GESTOR",
      );
      if (gestores <= 1) {
        throw new AppError(
          "A academia precisa de pelo menos um GESTOR ativo",
          409,
        );
      }
    }

    if (data.email && data.email !== target.email) {
      const exists = await userRepository.findByEmail(data.email);
      if (exists)
        throw new AppError("Já existe um usuário com esse e-mail", 409);
    }

    const updated = await userRepository.update(targetId, data);

    // Inativar derruba sessões
    if (data.active === false) {
      await sessionRepository.deleteAllForUser(targetId);
    }
    return updated;
  }

  async resetPassword(actor: Actor, targetId: string, newPassword: string) {
    const target = await this.loadTargetInAcademy(actor, targetId);
    if (target.id === actor.id) {
      throw new AppError("Use a tela 'Meu perfil' para trocar sua senha", 400);
    }
    this.assertCanManage(actor.role, target.role);

    const hash = await bcrypt.hash(newPassword, 10);
    await userRepository.setPassword(targetId, hash);
    // Força login em todos os dispositivos
    await sessionRepository.deleteAllForUser(targetId);
  }

  async updateOwnProfile(
    userId: string,
    data: { name?: string; email?: string },
  ) {
    if (data.email) {
      const exists = await userRepository.findByEmail(data.email);
      if (exists && exists.id !== userId) {
        throw new AppError("Já existe um usuário com esse email", 409);
      }
    }
    return userRepository.update(userId, data);
  }

  async changeOwnPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await userRepository.findWithPassword(userId);
    if (!user) throw new AppError("Usuário não encontrado", 404);

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) throw new AppError("Senha atual incorreta", 400);

    const hash = await bcrypt.hash(newPassword, 10);
    await userRepository.setPassword(userId, hash);
    // Mantenho sessão atual - Não derrubo para login
  }

  async logoutAllDevices(userId: string) {
    await sessionRepository.deleteAllForUser(userId);
  }

  // helpers
  private async loadTargetInAcademy(actor: Actor, targetId: string) {
    const target = await userRepository.findById(targetId);
    if (!target || target.academyId !== actor.academyId) {
      throw new AppError("Usuário não encontrado", 404);
    }
    return target;
  }

  private assertCanManage(actorRole: Role, targetRole: Role) {
    if (actorRole === "ADMIN") return;
    if (actorRole == "GESTOR" && targetRole !== "ADMIN") return;
    throw new AppError(
      "Você não tem permissão para gerenciar este usuário",
      403,
    );
  }
}
