import { AppError, handleError } from "@/lib/errors";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { UserService } from "../services/UserService";
import {
  changePasswordSchema,
  ownProfileSchema,
  resetPasswordSchema,
  userCreateSchema,
  userUpdateSchema,
} from "@/schemas/user.schema";
import { clearAuthCookies } from "@/lib/auth/cookies";

const userService = new UserService();

interface Actor {
  id: string;
  role: Role;
  academyId: string;
}

const badInput = (issue: string) =>
  new AppError("Dados inválidos: " + issue, 400);

export class UserController {
  async index(academyId: string) {
    try {
      return NextResponse.json(await userService.list(academyId), {
        status: 200,
      });
    } catch (e) {
      return handleError(e);
    }
  }

  async store(req: Request, actor: Actor) {
    try {
      const parsed = userCreateSchema.safeParse(await req.json());
      if (!parsed.success) throw badInput(parsed.error.issues[0].message);
      const result = await userService.create(actor, parsed.data);
      return NextResponse.json(result, { status: 200 });
    } catch (e) {
      return handleError(e);
    }
  }

  async update(req: Request, id: string, actor: Actor) {
    try {
      const parsed = userUpdateSchema.safeParse(await req.json());
      if (!parsed.success) throw badInput(parsed.error.issues[0].message);
      const result = await userService.update(actor, id, parsed.data);
      return NextResponse.json(result, { status: 200 });
    } catch (e) {
      return handleError(e);
    }
  }

  async resetPassword(req: Request, id: string, actor: Actor) {
    try {
      const parsed = resetPasswordSchema.safeParse(await req.json());
      if (!parsed.success) throw badInput(parsed.error.issues[0].message);
      await userService.resetPassword(actor, id, parsed.data.password);
      return NextResponse.json(
        { message: "Senha redefinida" },
        { status: 200 },
      );
    } catch (e) {
      return handleError(e);
    }
  }

  async updateOwnProfile(req: Request, userId: string) {
    try {
      const parsed = ownProfileSchema.safeParse(await req.json());
      if (!parsed.success) throw badInput(parsed.error.issues[0].message);
      const result = await userService.updateOwnProfile(userId, parsed.data);
      return NextResponse.json(result, { status: 200 });
    } catch (e) {
      return handleError(e);
    }
  }

  async changeOwnPassword(req: Request, userId: string) {
    try {
      const parsed = changePasswordSchema.safeParse(await req.json());
      if (!parsed.success) throw badInput(parsed.error.issues[0].message);
      await userService.changeOwnPassword(
        userId,
        parsed.data.currentPassword,
        parsed.data.newPassword,
      );
      return NextResponse.json({ message: "Senha Alterada" }, { status: 200 });
    } catch (e) {
      return handleError(e);
    }
  }

  async logoutAll(userId: string) {
    try {
      await userService.logoutAllDevices(userId);
      const res = NextResponse.json({ ok: true }, { status: 200 });
      return clearAuthCookies(res);
    } catch (e) {
      return handleError(e);
    }
  }
}
