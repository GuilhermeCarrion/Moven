import { AppError } from "@/lib/errors";
import { SessionRepository } from "../repositories/SessionRepository";
import { UserRepository } from "../repositories/UserRepository";
import bcrypt from "bcryptjs";
import {
  generateRefreshToken,
  hashToken,
  REFRESH_TOKEN_TTL_MS,
  signAccessToken,
} from "@/lib/auth/tokens";

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();

// O que o service devolve para o controller montar os cookies
interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    academy: { name: string } | null;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  // Login por credenciais -> emite a primeira sessão
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError("Email ou senhas invalidos", 401);
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid || !user.active) {
      throw new AppError("Email ou senhas invalidos", 401);
    }

    const tokens = await this.createTokensAndSession(user.id, user.academyId);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        academy: user.academy,
      },
      ...tokens,
    };
  }

  // troca um refresh válido por um par novo (Rotação)
  async refresh(rawRefreshToken: string | null): Promise<AuthResult> {
    if (!rawRefreshToken) {
      throw new AppError("Sessão inválida", 401);
    }

    const hashed = hashToken(rawRefreshToken);
    const session = await sessionRepository.findByToken(hashed);

    if (!session) throw new AppError("Sessão inválida", 401);

    // Refresh vencido: limpa a sujeira e derruba
    if (session.expiresAt < new Date()) {
      await sessionRepository.deleteByToken(hashed);
      throw new AppError("Sessão expirada", 401);
    }

    const user = await userRepository.findById(session.userId);
    if (!user || !user.active) {
      await sessionRepository.deleteByToken(hashed);
      throw new AppError("Sessão inválida", 401);
    }

    // Invalida o refresh usado ANTES de emitir o novo
    await sessionRepository.deleteByToken(hashed);

    const tokens = await this.createTokensAndSession(user.id, user.academyId);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        academy: user.academy,
      },
      ...tokens,
    };
  }

  async logout(rawRefreshToken: string | null): Promise<void> {
    if (!rawRefreshToken) return;
    await sessionRepository.deleteByToken(hashToken(rawRefreshToken));
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }
    return user;
  }

  // Emite access + refresh e grava sessão no banco
  private async createTokensAndSession(userId: string, academyId: string) {
    const accessToken = signAccessToken({ userId, academyId });

    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await sessionRepository.create({
      userId,
      token: hashToken(refreshToken), // Guarda só o hash
      expiresAt,
    });

    return { accessToken, refreshToken };
  }
}
