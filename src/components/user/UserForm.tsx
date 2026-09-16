import { useAuth } from "@/contexts/AuthContext";
import { SystemUser } from "@/hooks/useUsers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { PasswordInput } from "../ui/password-input";

const allRoles = [
  { value: "GESTOR", label: "Gestor" },
  { value: "PROFESSOR", label: "Professor" },
  { value: "ADMIN", label: "Admin" },
] as const;

const makeSchema = (isEdit: boolean) =>
  z.object({
    name: z.string().trim().min(3, "Mínimo 3 caracteres"),
    email: z.string().trim().email("Email inválido"),
    role: z.enum(["ADMIN", "GESTOR", "PROFESSOR"]),
    password: isEdit
      ? z.string().optional()
      : z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  });

const selectCls =
  "mt-1 h-10 w-full rounded-lg border border-slate-200/70 bg-white/70 px-2.5 text-sm text-slate-700 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30";

interface Props {
  user?: SystemUser;
  onSubmit: (data: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export function UserForm({ user, onSubmit, isSubmitting }: Props) {
  const { user: current } = useAuth();
  const isEdit = !!user;
  const schema = makeSchema(isEdit);
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: user
      ? { name: user.name, email: user.email, role: user.role }
      : { role: "PROFESSOR" },
  });

  const roles = allRoles.filter(
    (r) => r.value !== "ADMIN" || current?.role === "ADMIN",
  );

  const err = "text-xs text-destructive mt-1";

  const submit = (values: Values) => {
    const payload: Record<string, unknown> = {
      name: values.name,
      email: values.email,
      role: values.role,
    };
    if (!isEdit && values.password) payload.password = values.password;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className={err}>{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className={err}>{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
        <div>
          <Label htmlFor="role">Papel</Label>
          <select id="role" className={selectCls} {...register("role")}>
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {!isEdit && (
          <div>
            <Label htmlFor="password">Senha inicial</Label>
            <PasswordInput
              id="password"
              placeholder="mín. 8 caracteres"
              {...register("password")}
            />
            {errors.password && (
              <p className={err}>{errors.password.message}</p>
            )}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : isEdit ? "Salvar" : "Criar usuário"}
      </Button>
    </form>
  );
}
