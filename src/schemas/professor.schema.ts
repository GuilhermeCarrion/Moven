import { z } from "zod";

export const professorSchema = z.object({
  name: z.string().trim().min(3, "O nome deve conter no mínimo 3 caracteres"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "Telefone deve conter 10 ou 11 dígitos numéricos"),
  cpf: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "CPF deve conter 11 dígitos numéricos"),
});

export type ProfessorSchema = z.infer<typeof professorSchema>;

export const professorUpdateSchema = professorSchema.partial();

export type ProfessorUpdateSchema = z.infer<typeof professorUpdateSchema>;
