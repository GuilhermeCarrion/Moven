import { WhatsAppClient, SendResult } from "./types";

export class MockWhatsAppClient implements WhatsAppClient {
  async sendTemplate(
    to: string,
    template: string,
    variables: string[] = [],
  ): Promise<SendResult> {
    console.log(`[WA-MOCK] template "${template}" -> ${to}`, variables);
    return { id: `mock-${Date.now()}` };
  }

  async sendText(to: string, text: string): Promise<SendResult> {
    console.log(`[WA-MOCK] texto -> ${to}: ${text}`);
    return { id: `mock-${Date.now()}` };
  }
}
