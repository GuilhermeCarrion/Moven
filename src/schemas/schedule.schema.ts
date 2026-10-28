import z from "zod";

export const settingsSchema = z.object({
  cancelWindowHours: z.number().int().min(0).max(40),
});

export const templateSchema = z
  .object({
    name: z.string().trim().min(2, "Informe o nome"),
    durationMin: z.number().int().min(10).max(240),
    capacity: z.number().int().positive("Capacidade inválida"),
    minCapacity: z.number().int().positive(),
  })
  .refine((d) => d.minCapacity <= d.capacity, {
    message: "O mínimo não pode passar da capacidade",
    path: ["minCapacity"],
  });

export const slotSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido (HH:MM)"),
  professorId: z.string().uuid("Selecione um professor"),
  templateId: z.string().uuid("Selecione um template"),
});

export const slotUpdateSchema = z
  .object({
    active: z.boolean(),
    professorId: z.string().uuid(),
    templateId: z.string().uuid(),
  })
  .partial();
