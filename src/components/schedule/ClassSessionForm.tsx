"use client";

import { useProfessors } from "@/hooks/useProfessors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AlertTriangle } from "lucide-react";

const formSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome da aula"),
  professorId: z.string().uuid("Selecione um professor"),
  startAt: z.string().min(1, "Informe data e hora"),
  durationMin: z.coerce.number().int().positive("Duração inválida"),
  capacity: z.coerce.number().int().positive("Capacidade inválida"),
  minCapacity: z.coerce.number().int().positive("Mínimo inválido"),
});

type FormValues = z.input<typeof formSchema>;

interface Props {
  onSubmit: (data: Record<string, unknown>) => void;
  // os botões ficam no rodapé do Modal e enviam este form via atributo `form={formId}`
  formId?: string;
}

function defaultStartDatetime() {
  const d = new Date(Date.now() + 5 * 60 * 1000); // agora + 5 min
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export const selectCls =
  "h-11 w-full min-w-0 rounded-xl border border-[var(--mv-line)] bg-[var(--mv-field)] px-3 text-base text-[var(--mv-text)] outline-none focus-visible:border-[var(--mv-brand)] focus-visible:ring-4 focus-visible:ring-[var(--mv-brand)]/15";

export function ClassSessionForm({ onSubmit, formId = "class-session-form" }: Props) {
  const { data: professors } = useProfessors();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      durationMin: 60,
      capacity: 12,
      minCapacity: 3,
      startAt: defaultStartDatetime(),
    },
  });

  const startAtValue = watch("startAt");
  const isPast =
    !!startAtValue && new Date(startAtValue).getTime() < Date.now() - 60_000;

  const err = "text-sm text-destructive mt-1";
  const hint = "mt-1 text-xs text-[var(--mv-text-soft)]";
  const sectionTitle =
    "mv-mono mb-4 flex w-full items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)] after:h-px after:flex-1 after:bg-[var(--mv-line)]";

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((v) => {
        const data = formSchema.parse(v);
        // o navegador sabe o fuso de quem digitou, o servidor(UTC do provedor) não.
        onSubmit({ ...data, startAt: new Date(data.startAt).toISOString() });
      })}
      className="space-y-7"
      noValidate
    >
      <fieldset className="space-y-4">
        <legend className={sectionTitle}>Aula</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Nome da aula</Label>
            <Input id="name" placeholder="Ex.: Bungee Iniciante" {...register("name")} />
            {errors.name && <p className={err}>{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="professorId">Professor</Label>
            <select id="professorId" className={selectCls} {...register("professorId")}>
              <option value="">Selecione...</option>
              {professors?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.professorId && <p className={err}>{errors.professorId.message}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={sectionTitle}>Quando</legend>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="col-span-2">
            <Label htmlFor="startAt">Data e hora</Label>
            <Input id="startAt" type="datetime-local" {...register("startAt")} />
            {errors.startAt && <p className={err}>{errors.startAt.message}</p>}
            {isPast && !errors.startAt && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                Essa data já passou — a aula será criada no passado.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="durationMin">Duração (min)</Label>
            <Input id="durationMin" type="number" inputMode="numeric" {...register("durationMin")} />
            {errors.durationMin && <p className={err}>{errors.durationMin.message}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={sectionTitle}>Vagas</legend>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="capacity">Capacidade máx.</Label>
            <Input id="capacity" type="number" inputMode="numeric" {...register("capacity")} />
            {errors.capacity ? <p className={err}>{errors.capacity.message}</p> : <p className={hint}>Alunos por aula</p>}
          </div>
          <div>
            <Label htmlFor="minCapacity">Mínimo</Label>
            <Input id="minCapacity" type="number" inputMode="numeric" {...register("minCapacity")} />
            {errors.minCapacity ? (
              <p className={err}>{errors.minCapacity.message}</p>
            ) : (
              <p className={hint}>Para a aula acontecer</p>
            )}
          </div>
        </div>
      </fieldset>
    </form>
  );
}
