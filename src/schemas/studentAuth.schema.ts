import z from "zod";

export const studentLoginSchema = z.object({
  cpf: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data Inválida"),
});

export type StudentLoginSchema = z.infer<typeof studentLoginSchema>;
