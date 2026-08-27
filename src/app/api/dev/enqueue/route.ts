import { devOnly } from "@/lib/devGuard";
import { JobService } from "@/server/services/JobService";
import { NextResponse } from "next/server";

const jobs = new JobService();

export async function POST(req: Request) {
  const blocked = devOnly();
  if (blocked) return blocked;

  const body = await req.json();
  const job = await jobs.enqueue({
    academyId: body.academyId,
    type: body.type,
    relatedId: body.relatedId,
    payload: body.payload,
    scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
  });
  return NextResponse.json(job, { status: 201 });
}
