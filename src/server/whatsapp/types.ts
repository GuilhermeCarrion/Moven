export interface SendResult {
  id: string;
}

export interface WhatsAppClient {
  // Proativo (fora da janela de 24h) -> exige template aprovado
  sendTemplate(
    to: string,
    template: string,
    variables?: string[],
  ): Promise<SendResult>;

  // Resposta livre (dentro da janela de 24h)
  sendText(to: string, text: string): Promise<SendResult>;
}
