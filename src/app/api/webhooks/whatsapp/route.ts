import { handleInboudMessage } from "@/server/whatsapp/inbound";
import { NextResponse } from "next/server";

// GET - Verificação da Meta
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 }); //devolve aviso
  }

  return new Response("Forbidden", { status: 403 });
}

// POST - recebe as mensagens
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body?.entry?.[0]?.changes?.[0]?.value?.messages;
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        await handleInboudMessage(msg);
      }
    }
  } catch (e) {
    console.error("[webhook] erro ao processar:", e);
  }

  // SEMPRE responde 200 rápido, mesmo com erro. Se não a Meta reenvia
  return NextResponse.json({ received: true }, { status: 200 });
}
