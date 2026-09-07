import { ACCESS_COOKIE, readCookie } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Autenticação - Prova de identidade
export function authenticateRequest(request: Request) {
  // Cookie é a fonte principal
  let token = readCookie(request, ACCESS_COOKIE);
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return {
      error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
      userId: null,
      academyId: null,
    };
  }

  try {
    const decoded = verifyAccessToken(token);
    return {
      error: null,
      userId: decoded.userId,
      academyId: decoded.academyId,
    };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Sessão inválida ou expirada" },
        { status: 401 },
      ),
      userId: null,
      academyId: null,
    };
  }
}

// Autorização - define o que vc pode fazer
export async function authorizeRequest(
  request: Request,
  allowedRoles?: Role[],
) {
  // Reutilização para identificação da request
  const base = authenticateRequest(request);

  if (base.error) return { ...base, role: null as Role | null };

  // Banco é a fonte da verdade, busca pela permissão na "hora"
  const user = await prisma.user.findUnique({
    where: { id: base.userId as string },
    select: { role: true, active: true },
  });

  if (!user || !user.active) {
    return {
      error: NextResponse.json(
        { error: "Usuário inválido ou inativo" },
        { status: 401 },
      ),
      userId: null,
      academyId: null,
      role: null as Role | null,
    };
  }

  /**
   * Decidindo "quem pode o quê" - Autorização genérica, quem define é a rota (quem chama)
   *
   * Whitelist vinda da rota define quem entra. A função checa se o papel do usuário está na lista.
   * Se não estiver -> 403 - "Sei quem é você, mas essa ação não é para seu perfil"
   */

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json(
        { error: "Acesso negado para seu perfil" },
        { status: 403 },
      ),
      userId: base.userId,
      academyId: base.academyId,
      role: user.role,
    };
  }

  return {
    error: null,
    userId: base.userId,
    academyId: base.academyId,
    role: user.role,
  };
}
