"use client";

import { useProfessors } from "@/hooks/useProfessors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const formSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome da aula"),
  professorId: z.string().uuid("Selecione um professor"),
  startAt: z.string().min(1, "Informe data e hora"),
  durationMin: z.coerce.number().int().positive(),
  capacity: z.coerce.number().int().positive("Capacidade inválida"),
  minCapacity: z.coerce.number().int().positive(),
});

type FormValues = z.input<typeof formSchema>;

interface Props {
  onSubmit: (data: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export function ClassSessionForm({ onSubmit, isSubmitting }: Props) {
  const { data: professors } = useProfessors();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { durationMin: 60, capacity: 12, minCapacity: 3 },
  });

  const field = "mt-1";
  const err = "text-xs text-destructive mt-1";
  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit(formSchema.parse(v)))}
      className="space-y-4"
      noValidate
    >
      <div>
        <Label htmlFor="name">Nome da aula</Label>
        <Input
          id="name"
          className={field}
          placeholder="Ex.: Bungee Iniciante"
          {...register("name")}
        />
        {errors.name && <p className={err}>{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="professorId">Professor</Label>
        <select
          id="professorId"
          className="mt-1 h-10 w-full rounded-lg border border-slate-200/70 bg-white/70 px-2.5 text-sm text-slate-700 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
          {...register("professorId")}
        >
          <option value="">Selecione...</option>
          {professors?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.professorId && (
          <p className={err}>{errors.professorId.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="startAt">Data e hora</Label>
        <Input
          id="startAt"
          type="datetime-local"
          className={field}
          {...register("startAt")}
        />
        {errors.startAt && <p className={err}>{errors.startAt.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="durationMin">Duração (min)</Label>
          <Input id="durationMin" type="number" {...register("durationMin")} />
        </div>
        <div>
          <Label htmlFor="capacity">Capacidade máx.</Label>
          <Input id="capacity" type="number" {...register("capacity")} />
          {errors.capacity && <p className={err}>{errors.capacity.message}</p>}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="minCapacity">Mínimo</Label>
          <Input id="minCapacity" type="number" {...register("minCapacity")} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Criar aula"}
      </Button>
    </form>
  );
}
