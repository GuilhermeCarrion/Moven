/**
 * Rate Limiter em memória, janela fixa. Simples e sem dependência externa.
 * Limitação: o estado vive no processo - sem serverless ele não é compartilhado
 * entre instâncias nem sobrevive a cold start. É a primeira camada
 * (defesa em profundidade): a trava confiável é o lockout por conta no banco.
 */

interface Bucket {
  count: number;
  resetAt: number; // timestamp(ms) em que a janela zera
}

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  // Janela nova (ou expirada): reinicia contagem
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      allowed: true,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { allowed: true, retryAfterSec: 0 };
}

// Extrai o IP do cliente (Vercel/proxy enviam via cabeçalho)
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forewarded-for");
  if (xff) return xff.split(",")[0].trim(); // Primeiro IP da cadeia = cliente real
  return req.headers.get("x-real-ip") ?? "unknown";
}
