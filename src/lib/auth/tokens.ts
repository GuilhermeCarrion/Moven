import * as jwt from "jsonwebtoken";
import crypto from "crypto";

// Tempo de vida dos tokens
export const ACCESS_TOKEN_TTL = "15m"; // Formato do jsonwebtoken
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

export interface AccessTokenPayload {
  userId: string;
  academyId: string;
}

// Access token: JWT curto e stateless (validado sem ir ao banco)
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(
    token,
    process.env.JWT_SECRET as string,
  ) as AccessTokenPayload;
}

// Referesh token: string opaca aleatória
// O valor "cru" vai no cookie, no banco guardamos só o hash
export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString("hex"); // 256 bits de entropia
}

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
