import { Student } from "@/types/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

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
    .max(107, "Peso mínimo de 107 kg"),
});

type FormValues = z.input<typeof formSchema>;

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export function StudentForm({
  student,
  onSubmit,
  isSubmitting,
}: StudentFormProps) {
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

  const field = "mt-1";
  const err = "text-xs text-destructive mt-1";

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          placeholder="Ex: Joao Silva Ribeiro"
          className={field}
          {...register("name")}
        />
        {errors.name && <p className={err}>{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Telefone (Só números)</Label>
          <Input
            id="phone"
            className={field}
            placeholder="Ex: 18999999999"
            {...register("phone")}
          />
          {errors.phone && <p className={err}>{errors.phone.message}</p>}
        </div>
        <div>
          <Label htmlFor="cpf">CPF (Só números)</Label>
          <Input
            id="cpf"
            placeholder="Ex: 99999999988"
            className={field}
            {...register("cpf")}
          />
          {errors.cpf && <p className={err}>{errors.cpf.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email (opcional)</Label>
        <Input
          id="email"
          className={field}
          type="email"
          {...register("email")}
        />
        {errors.email && <p className={err}>{errors.email.message}</p>}
      </div>

      <div className="col-span-2 sm:col-span-1">
        <Label htmlFor="birthDate">Nascimento</Label>
        <Input id="birthDate" type="date" {...register("birthDate")} />
        {errors.birthDate && <p className={err}>{errors.birthDate.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="heightCm">Altura (cm)</Label>
          <Input
            id="heightCm"
            className={field}
            type="number"
            placeholder="Ex: 170"
            {...register("heightCm")}
          />
          {errors.heightCm && <p className={err}>{errors.heightCm.message}</p>}
        </div>
        <div>
          <Label htmlFor="weightKg">Peso (kg)</Label>
          <Input
            id="weightKg"
            className={field}
            type="number"
            placeholder="Ex: 70"
            {...register("weightKg")}
          />
          {errors.weightKg && <p className={err}>{errors.weightKg.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
