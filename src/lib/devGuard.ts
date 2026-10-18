import { NextResponse } from "next/server";

export function devOnly() {
  // Bloqueia só em produção de verdade. Preview da Vercel (staging) também roda com
  // NODE_ENV=production, mas tem VERCEL_ENV=preview — lá o simulador precisa funcionar.
  const isProd =
    process.env.NODE_ENV === "production" &&
    process.env.VERCEL_ENV !== "preview";

  if (isProd) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  return null;
}
