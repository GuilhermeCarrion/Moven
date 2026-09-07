import { devOnly } from "@/lib/devGuard";
import { handleInboudMessage } from "@/server/whatsapp/inbound";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const blocked = devOnly();
  if (blocked) return blocked;

  const { from, intent } = await req.json();
  await handleInboudMessage({
    from,
    type: "button",
    button: { payload: intent, text: intent },
  });
  return NextResponse.json({ ok: true });
}
