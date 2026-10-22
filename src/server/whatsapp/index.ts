import { CloudWhatsAppClient } from "./cloud";
import { MockWhatsAppClient } from "./mock";
import { WhatsAppClient } from "./types";

const mock = new MockWhatsAppClient();
const real: WhatsAppClient =
  process.env.WHATSAPP_MODE === "cloud" ? new CloudWhatsAppClient() : mock;

// Quem recebe de verdade : "*"(produção) ou lista de numeros (staging)
// Sem a variavel, NINGUEM recebe: um ambiente mal configurado não vaza mensagem.
const allow = (process.env.WHATSAPP_ALLOWLIST ?? "")
  .split(",")
  .map((n) => n.trim())
  .filter(Boolean);

const clientFor = (to: string) =>
  allow.includes("*") || allow.includes(to) ? real : mock;

export const whatsapp: WhatsAppClient = {
  sendTemplate: (to, template, variable) =>
    clientFor(to).sendTemplate(to, template, variable),
  sendText: (to, text) => clientFor(to).sendText(to, text),
};
