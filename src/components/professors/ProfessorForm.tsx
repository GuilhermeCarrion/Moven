import { professorSchema, ProfessorSchema } from "@/schemas/professor.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Professor } from "@/types/models";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

interface ProfessorFromProps {
  professor?: Professor;
  onSubmit: (data: ProfessorSchema) => void;
  isSubmitting: boolean;
}

export function ProfessorForm({
  professor,
  onSubmit,
  isSubmitting,
}: ProfessorFromProps) {
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

  const field = "mt-1";
  const err = "text-xs text-destructive mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          placeholder="Ex: Ana Carolina Fontes"
          className={field}
          {...register("name")}
        />
        {errors.name && <p className={err}>{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Telefone (só números)</Label>
          <Input
            id="phone"
            className={field}
            placeholder="Ex: 18999998888"
            {...register("phone")}
          />
          {errors.phone && <p className={err}>{errors.phone.message}</p>}
        </div>
        <div>
          <Label htmlFor="cpf">CPF (só números)</Label>
          <Input
            id="cpf"
            placeholder="Ex: 99999999988"
            className={field}
            {...register("cpf")}
          />
          {errors.cpf && <p className={err}>{errors.cpf.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
