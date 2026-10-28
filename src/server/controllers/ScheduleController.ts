import { ZodType } from "zod";
import { ScheduleService } from "../services/ScheduleService";
import { AppError, handleError } from "@/lib/errors";
import { NextResponse } from "next/server";
import {
  settingsSchema,
  slotSchema,
  slotUpdateSchema,
  templateSchema,
} from "@/schemas/schedule.schema";
import { is } from "zod/v4/locales";

const service = new ScheduleService();

// Valida o corpo com o schema. Erro de validação vira 400 com a primeira mensagem
async function parse<T>(req: Request, schema: ZodType<T>) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    throw new AppError("Dados inválidos" + parsed.error.issues[0].message, 400);
  return parsed.data;
}

export class ScheduleController {
  async index(academyId: string) {
    try {
      return NextResponse.json(await service.get(academyId), { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }

  async updateSettings(req: Request, academyId: string) {
    try {
      const data = await parse(req, settingsSchema);
      return NextResponse.json(await service.updateSettings(academyId, data), {
        status: 200,
      });
    } catch (error) {
      return handleError(error);
    }
  }

  async storeTemplate(req: Request, academyId: string) {
    try {
      const data = await parse(req, templateSchema);
      return NextResponse.json(await service.createTemplate(academyId, data), {
        status: 201,
      });
    } catch (error) {
      return handleError(error);
    }
  }

  async storeSlot(req: Request, academyId: string) {
    try {
      const data = await parse(req, slotSchema);
      return NextResponse.json(await service.createSlot(academyId, data), {
        status: 201,
      });
    } catch (error) {
      return handleError(error);
    }
  }

  async updateSlot(req: Request, id: string, academyId: string) {
    try {
      const data = await parse(req, slotUpdateSchema);
      await service.updateSlot(id, academyId, data);
      return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }
}
