import { loginSchema } from "@/schemas/auth.schema";
import { NextResponse } from "next/server";
import { AuthService } from "../services/AuthService";
import { AppError, handleError } from "@/lib/errors";
import {
  clearAuthCookies,
  readCookie,
  REFRESH_COOKIE,
  setAuthCookies,
} from "@/lib/auth/cookies";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const authService = new AuthService();

export class AuthController {
  async login(req: Request) {
    try {
      const ip = getClientIp(req);
      const rl = rateLimit(`login:${ip}`, 10, 60_000);

      if (!rl.allowed) {
        const res = NextResponse.json(
          { error: "Muitas tentivas. Aguarde um momento." },
          { status: 429 },
        );
        res.headers.set("Retry-After", String(rl.retryAfterSec));
        return res;
      }

      const body = await req.json();

      const parsed = loginSchema.safeParse(body);
      if (!parsed.success) {
        throw new AppError(
          "Dados inválidos: " + parsed.error.issues[0].message,
          400,
        );
      }

      const { email, password } = parsed.data;
      const { user, accessToken, refreshToken } = await authService.login(
        email,
        password,
      );

      // Corpo devolve só o user, os tokens vão nos cookies
      const res = NextResponse.json({ user }, { status: 200 });
      return setAuthCookies(res, { accessToken, refreshToken });
    } catch (error) {
      return handleError(error);
    }
  }

  async refresh(req: Request) {
    try {
      const rawRefresh = readCookie(req, REFRESH_COOKIE);
      const { user, accessToken, refreshToken } =
        await authService.refresh(rawRefresh);

      const res = NextResponse.json({ user }, { status: 200 });
      return setAuthCookies(res, { accessToken, refreshToken });
    } catch (error) {
      // Refresh falhou -> sessão morta: responde o erro e limpa os cookies
      const res = handleError(error);
      return clearAuthCookies(res);
    }
  }

  async logout(req: Request) {
    // Best-effort: apaga a sessão do banco, mas nunca falha o logout
    try {
      const rawRefresh = readCookie(req, REFRESH_COOKIE);
      await authService.logout(rawRefresh);
    } catch (error) {
      // ignora
    }

    const res = NextResponse.json({ ok: true }, { status: 200 });
    return clearAuthCookies(res);
  }

  // Retorna dados do usuário autenticado
  async getMe(userId: string) {
    try {
      const user = await authService.getProfile(userId);
      return NextResponse.json(user, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }
}
