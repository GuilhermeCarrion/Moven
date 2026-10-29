import { Student } from "@/types/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

/**
 * Schema "de formulários": os inputs entregam STRINGS, então coagimos p/ números
 * e mantemos a data como string. As regras espelham o studentSchema do backend,
 * que continua sendo a validação autoritativa.
 */
const formSchema = z.object({
  name: z.string().trim().min(3, "Mínimo 3 caracteres"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos"),
  cpf: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  heightCm: z.coerce
    .number()
    .int()
    .min(140, "Altura mínima de 140 cm")
    .max(250, "Altura inválida"),
  weightKg: z.coerce
    .number()
    .min(42, "Peso mínimo de 42 kg")
    .max(107, "Peso máximo de 107 kg"),
});

type FormValues = z.input<typeof formSchema>;

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: Record<string, unknown>) => void;
  // os botões ficam no rodapé do Modal e enviam este form via atributo `form={formId}`
  formId?: string;
}

export function StudentForm({ student, onSubmit, formId = "student-form" }: StudentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: student
      ? {
          name: student.name,
          phone: student.phone,
          cpf: student.cpf,
          email: student.email ?? "",
          birthDate: student.birthDate ? student.birthDate.slice(0, 10) : "",
          heightCm: student.heightCm ?? undefined,
          weightKg: student.weightKg ? Number(student.weightKg) : undefined,
        }
      : undefined,
  });

  const submit = (values: FormValues) => {
    // Garante numeros coeridos
    const parsed = formSchema.parse(values);
    onSubmit({
      name: parsed.name,
      phone: parsed.phone,
      cpf: parsed.cpf,
      email: parsed.email || undefined,
      birthDate: parsed.birthDate || undefined,
      heightCm: parsed.heightCm,
      weightKg: parsed.weightKg,
    });
  };

  const err = "text-sm text-destructive mt-1";
  const hint = "mt-1 text-xs text-[var(--mv-text-soft)]";
  const section = "space-y-4";
  const sectionTitle =
    "mv-mono flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)] after:h-px after:flex-1 after:bg-[var(--mv-line)]";

  return (
    <form id={formId} onSubmit={handleSubmit(submit)} className="space-y-7" noValidate>
      <fieldset className={section}>
        <legend className={`${sectionTitle} mb-4 w-full`}>Dados pessoais</legend>
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" placeholder="Ex: João Silva Ribeiro" {...register("name")} />
          {errors.name && <p className={err}>{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" inputMode="numeric" placeholder="99999999988" {...register("cpf")} />
            {errors.cpf ? (
              <p className={err}>{errors.cpf.message}</p>
            ) : (
              <p className={hint}>Só números</p>
            )}
          </div>
          <div>
            <Label htmlFor="birthDate">Nascimento</Label>
            <Input id="birthDate" type="date" {...register("birthDate")} />
            {errors.birthDate && <p className={err}>{errors.birthDate.message}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className={`${sectionTitle} mb-4 w-full`}>Contato</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">WhatsApp</Label>
            <Input id="phone" inputMode="tel" placeholder="18999999999" {...register("phone")} />
            {errors.phone ? (
              <p className={err}>{errors.phone.message}</p>
            ) : (
              <p className={hint}>Só números, com DDD</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">E-mail (opcional)</Label>
            <Input id="email" type="email" placeholder="aluno@email.com" {...register("email")} />
            {errors.email && <p className={err}>{errors.email.message}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className={`${sectionTitle} mb-4 w-full`}>Medidas</legend>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="heightCm">Altura (cm)</Label>
            <Input id="heightCm" type="number" placeholder="170" {...register("heightCm")} />
            {errors.heightCm && <p className={err}>{errors.heightCm.message}</p>}
          </div>
          <div>
            <Label htmlFor="weightKg">Peso (kg)</Label>
            <Input id="weightKg" type="number" placeholder="70" {...register("weightKg")} />
            {errors.weightKg && <p className={err}>{errors.weightKg.message}</p>}
          </div>
          <p className="col-span-2 self-end rounded-xl bg-[var(--mv-brand-50)] px-3.5 py-2.5 text-sm text-[var(--mv-text-soft)] sm:col-span-1">
            Segurança: altura a partir de 140 cm e peso entre 42 e 107 kg.
          </p>
        </div>
      </fieldset>
    </form>
  );
}
