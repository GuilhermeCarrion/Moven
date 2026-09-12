"use client";

import { Plan } from "@/types/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

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
    .positive("A quantidade de aulas deve ser maior que zero"),
  price: z.coerce.number().nonnegative("Preço inválido"),
});

type FormValues = z.input<typeof formSchema>;

interface PlanFormProps {
  plan?: Plan;
  onSubmit: (data: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export function PlanForm({ plan, onSubmit, isSubmitting }: PlanFormProps) {
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

  const field = "mt-1";
  const err = "text-xs text-destructive mt-1";

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="name">Nome do plano</Label>
        <Input
          id="name"
          className={field}
          placeholder="Fly ..."
          {...register("name")}
        />
        {errors.name && <p className={err}>{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="credits">Aulas</Label>
          <Input id="credits" type="number" {...register("credits")} />
          {errors.credits && <p className={err}>{errors.credits.message}</p>}
        </div>
        <div>
          <Label htmlFor="validityDays">Validade (dias)</Label>
          <Input
            id="validityDays"
            type="number"
            {...register("validityDays")}
          />
          {errors.validityDays && (
            <p className={err}>{errors.validityDays.message}</p>
          )}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input id="price" type="number" step="0.01" {...register("price")} />
          {errors.price && <p className={err}>{errors.price.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
