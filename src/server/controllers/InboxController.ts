import { NextResponse } from "next/server";
import { InboxService } from "../services/InboxService";
import { AppError, handleError } from "@/lib/errors";
import { inboxSendSchema } from "@/schemas/inbox.schema";

const service = new InboxService();

export class InboxController {
  async index(academyId: string) {
    try {
      const result = await service.list(academyId);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }

  async thread(id: string, academyId: string) {
    try {
      const result = await service.getThread(id, academyId);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }

  async send(req: Request, id: string, academyId: string, userId: string) {
    try {
      const parsed = inboxSendSchema.safeParse(await req.json());
      if (!parsed.success)
        throw new AppError(
          "Dados invalidos: " + parsed.error.issues[0].message,
          400,
        );

      const result = await service.send(
        id,
        academyId,
        parsed.data.text,
        userId,
      );
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  }
}
