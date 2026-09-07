import { CloudWhatsAppClient } from "./cloud";
import { MockWhatsAppClient } from "./mock";
import { WhatsAppClient } from "./types";

export const whatsapp: WhatsAppClient =
  process.env.WHATSAPP_MODE === "cloud"
    ? new CloudWhatsAppClient()
    : new MockWhatsAppClient();
