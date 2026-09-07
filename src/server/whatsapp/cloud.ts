import { SendResult, WhatsAppClient } from "./types";

const API_VERSION = "v21.0";

export class CloudWhatsAppClient implements WhatsAppClient {
  constructor(
    private token = process.env.WHATSAPP_TOKEN!,
    private phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!,
  ) {}

  private async post(body: unknown): Promise<SendResult> {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${this.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    const data = await res.json();
    if (!res.ok)
      throw new Error(`WhatsApp API ${res.status}: ${JSON.stringify(data)}`);
    return { id: data.messages?.[0]?.id ?? "unknown" };
  }

  async sendTemplate(
    to: string,
    template: string,
    variables: string[],
  ): Promise<SendResult> {
    return this.post({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: template,
        language: { code: "pt_BR" },
        components: variables.length
          ? [
              {
                type: "body",
                parameters: variables.map((v) => ({ type: "text", text: v })),
              },
            ]
          : undefined,
      },
    });
  }

  async sendText(to: string, text: string): Promise<SendResult> {
    return this.post({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    });
  }
}
