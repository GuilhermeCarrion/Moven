import z from "zod";

export const studentBookSchema = z.object({
  classSessionId: z.string().uuid("Aula inválida"),
  releaseAppointmentId: z.string().uuid().optional(), // reserva que o aluno escolheu cancelar
});

export const studentApptActionSchema = z.object({
  action: z.enum(["confirm", "cancel"]),
});

export type StudentBookSchema = z.infer<typeof studentBookSchema>;
export type StudentApptActionSchema = z.infer<typeof studentApptActionSchema>;
