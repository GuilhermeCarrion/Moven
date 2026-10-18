import z from "zod";

export const inboxSendSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Digite uma mensagem")
    .max(4096, "Mensagem muito longa"),
});
