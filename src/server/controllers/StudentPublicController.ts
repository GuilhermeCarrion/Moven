import { NextResponse } from "next/server";
import { StudentPublicService } from "../services/StudentPublicService";
import { AppError, handleError } from "@/lib/errors";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { studentSchema } from "@/schemas/students.schema";

const service = new StudentPublicService();

export class StudentPublicController {
  async academy(academyId: string) {
    try {
      const result = await service.academyInfo(academyId);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }

  async singup(req: Request, academyId: string) {
    try {
      const ip = getClientIp(req);
      const rl = rateLimit(`public-signup:${ip}`, 5, 60_000);
      if (!rl.allowed) {
        const res = NextResponse.json(
          { error: "Muitas tentativas. Aguarde um momento." },
          { status: 429 },
        );
        res.headers.set("Retry-After", String(rl.retryAfterSec));
        return res;
      }
      const body = await req.json();
      const parsed = studentSchema.safeParse(body);
      if (!parsed.success)
        throw new AppError(
          "Dados inválidos" + parsed.error.issues[0].message,
          400,
        );
      const result = await service.singup(academyId, parsed.data);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  }
}
