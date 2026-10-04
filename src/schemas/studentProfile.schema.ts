import z from "zod";

export const studentProfileUpdateSchema = z.object({
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  heightCm: z
    .number()
    .int()
    .min(140, "A altura mínima para a prática é de 140cm")
    .max(250, "Altura inválida"),
  weightKg: z
    .number()
    .min(42, "O peso minimo para a prática é de 42 Kg")
    .max(107, "O peso máximo para a prática é de 107Kg"),
});

export type StudentProfileUpdateSchema = z.infer<
  typeof studentProfileUpdateSchema
>;
