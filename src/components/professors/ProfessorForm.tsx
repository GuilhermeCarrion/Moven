import { professorSchema, ProfessorSchema } from "@/schemas/professor.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Professor } from "@/types/models";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ProfessorFromProps {
  professor?: Professor;
  onSubmit: (data: ProfessorSchema) => void;
  // os botões ficam no rodapé do Modal e enviam este form via atributo `form={formId}`
  formId?: string;
}

export function ProfessorForm({ professor, onSubmit, formId = "professor-form" }: ProfessorFromProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfessorSchema>({
    resolver: zodResolver(professorSchema),
    defaultValues: professor
      ? { name: professor.name, phone: professor.phone, cpf: professor.cpf }
      : undefined,
  });

  const err = "text-sm text-destructive mt-1";
  const hint = "mt-1 text-xs text-[var(--mv-text-soft)]";
  const sectionTitle =
    "mv-mono mb-4 flex w-full items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)] after:h-px after:flex-1 after:bg-[var(--mv-line)]";

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-7" noValidate>
      <fieldset className="space-y-4">
        <legend className={sectionTitle}>Dados do professor</legend>
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" placeholder="Ex: Ana Carolina Fontes" {...register("name")} />
          {errors.name && <p className={err}>{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" inputMode="numeric" placeholder="99999999988" {...register("cpf")} />
            {errors.cpf ? <p className={err}>{errors.cpf.message}</p> : <p className={hint}>Só números</p>}
          </div>
          <div>
            <Label htmlFor="phone">WhatsApp</Label>
            <Input id="phone" inputMode="tel" placeholder="18999998888" {...register("phone")} />
            {errors.phone ? (
              <p className={err}>{errors.phone.message}</p>
            ) : (
              <p className={hint}>Só números, com DDD</p>
            )}
          </div>
        </div>
      </fieldset>
      {/* Próxima seção: "Acesso ao painel" (criar login do professor) */}
    </form>
  );
}
