import { devOnly } from "@/lib/devGuard";
import { CreditSweepService } from "@/server/services/CreditSweepService";
import { processDueJobs } from "@/worker/processor";
import { NextResponse } from "next/server";

export async function POST() {
  const blocked = devOnly();
  if (blocked) return blocked;

  await processDueJobs();
  await new CreditSweepService().run();
  return NextResponse.json({ ok: true, message: "Fila processada" });
}
