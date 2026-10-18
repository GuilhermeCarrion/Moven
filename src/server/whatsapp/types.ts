export interface SendResult {
  id: string; // id da mensagem na Meta (wamid) -> liga os status à mensagem
  waId: string; // contato canonico devolvido pela Meta -> chave da mensagem
}

export interface InboundMessage {
  id: string;
  from: string;
  type: string;
  text?: { body: string };
  button?: { payload: string; text: string };
  interactive?: { button_reply?: { id: string; title: string } };
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
