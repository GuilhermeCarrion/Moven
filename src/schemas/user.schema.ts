import { Role } from "@prisma/client";
import z, { email } from "zod";

export const userCreateSchema = z.object({
  name: z.string().trim().min(3, "Mínimo 3 caracteres"),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  role: z.nativeEnum(Role),
});

export type UserCreateSchema = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  name: z.string().trim().min(3).optional(),
  email: z.string().trim().email().optional(),
  role: z.nativeEnum(Role).optional(),
  active: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export const ownProfileSchema = z.object({
  name: z.string().trim().min(3).optional(),
  email: z.string().trim().email().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual"),
  newPassword: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});
