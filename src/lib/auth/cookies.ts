import { NextResponse } from "next/server";
import { REFRESH_TOKEN_TTL_MS } from "./tokens";

export const ACCESS_COOKIE = "moven_access";
export const REFRESH_COOKIE = "moven_refresh";

const isProd = process.env.NODE_ENV === "production";

// Flags de segurança comuns aos dois cookies
function baseCookie() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
  };
}

// Grava os dois cookies na resposta
export function setAuthCookies(
  res: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  res.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...baseCookie(),
    path: "/", //Enviado para toda a API
    maxAge: 15 * 60,
  });

  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseCookie(),
    path: "/api/auth", // Só as rotas de auth recebem o refresh
    maxAge: REFRESH_TOKEN_TTL_MS / 1000,
  });

  return res;
}

// Apaga os dois cookies (logout ou refresh inválido)
export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, "", { ...baseCookie(), path: "/", maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", {
    ...baseCookie,
    path: "/api/auth",
    maxAge: 0,
  });
  return res;
}

// Lê um cookie de um Request cru (usado no middleware de auth)
export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}
