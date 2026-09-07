import crypto from "crypto";
/**
 * Valida a assinatura que a Meta envia no header X-Hub-Signature-256
 * A Meta assina o corpo CRU com HMAC-SHA256 usando o App Secret
 *
 * Fail-closed: sem WHATSAPP_APP_SECRET configurado, rejeita tudo
 */

export function isValidSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!appSecret) return false; //webhook nasce fechado até configurar
  if (!signatureHeader) return false;

  const expected =
    "sha256=" +
    crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

  const received = Buffer.from(signatureHeader);
  const computed = Buffer.from(expected);

  // Tamanho diferentes: timingSafeEqual lança se comprimentos divergem
  if (received.length !== computed.length) return false;

  // Compara em tempo constante (não vaza informação por tempo de resposta)
  return crypto.timingSafeEqual(received, computed);
}
