"use client";

import { Plan } from "@/types/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

// Inputs entregam string -> coerce converte antes de validar
const formSchema = z.object({
  name: z.string().trim().min(2, "Nome do plano é obrigatório"),
  credits: z.coerce
    .number()
    .int()
    .positive("A quantidade de aulas deve ser maior que zero"),
  validityDays: z.coerce
    .number()
    .int()
    .positive("A validade deve ser maior que zero"),
  price: z.coerce.number().nonnegative("Preço inválido"),
});

type FormValues = z.input<typeof formSchema>;

interface PlanFormProps {
  plan?: Plan;
  onSubmit: (data: Record<string, unknown>) => void;
  // os botões ficam no rodapé do Modal e enviam este form via atributo `form={formId}`
  formId?: string;
}

export function PlanForm({ plan, onSubmit, formId = "plan-form" }: PlanFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: plan
      ? {
          name: plan.name,
          credits: plan.credits,
          validityDays: plan.validityDays,
          price: Number(plan.price), // string -> number
        }
      : undefined,
  });

  const submit = (values: FormValues) => onSubmit(formSchema.parse(values));

  const err = "text-sm text-destructive mt-1";
  const hint = "mt-1 text-xs text-[var(--mv-text-soft)]";
  const sectionTitle =
    "mv-mono mb-4 flex w-full items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)] after:h-px after:flex-1 after:bg-[var(--mv-line)]";

  return (
    <form id={formId} onSubmit={handleSubmit(submit)} className="space-y-7" noValidate>
      <fieldset className="space-y-4">
        <legend className={sectionTitle}>Dados do plano</legend>
        <div>
          <Label htmlFor="name">Nome do plano</Label>
          <Input id="name" placeholder="Ex: Pacote 8 aulas" {...register("name")} />
          {errors.name && <p className={err}>{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="credits">Aulas</Label>
            <Input id="credits" type="number" inputMode="numeric" {...register("credits")} />
            {errors.credits ? (
              <p className={err}>{errors.credits.message}</p>
            ) : (
              <p className={hint}>Créditos do aluno</p>
            )}
          </div>
          <div>
            <Label htmlFor="validityDays">Validade (dias)</Label>
            <Input id="validityDays" type="number" inputMode="numeric" {...register("validityDays")} />
            {errors.validityDays ? (
              <p className={err}>{errors.validityDays.message}</p>
            ) : (
              <p className={hint}>A partir da atribuição</p>
            )}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="price">Preço (R$)</Label>
            <Input id="price" type="number" inputMode="decimal" step="0.01" {...register("price")} />
            {errors.price && <p className={err}>{errors.price.message}</p>}
          </div>
        </div>
      </fieldset>
    </form>
  );
}
