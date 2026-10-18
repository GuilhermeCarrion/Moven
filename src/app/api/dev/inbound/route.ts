import { devOnly } from "@/lib/devGuard";
import { handleWebhookValue } from "@/server/whatsapp/inbound";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const blocked = devOnly();
  if (blocked) return blocked;

  const {
    from,
    text,
    phoneNumberId = "dev_phone",
    name = "Contato Teste",
  } = await req.json();

  // Mesmo formato do "value" que a meta manda no webhook
  await handleWebhookValue({
    metadata: { phone_number_id: phoneNumberId },
    contacts: [{ wa_id: from, profile: { name } }],
    messages: [
      {
        id: `dev-${crypto.randomUUID()}`,
        from,
        type: "text",
        text: { body: text },
      },
    ],
  });
  return NextResponse.json({ ok: true });
}
