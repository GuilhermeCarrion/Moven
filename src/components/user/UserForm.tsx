import { useAuth } from "@/contexts/AuthContext";
import { SystemUser } from "@/hooks/useUsers";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, GraduationCap, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { PasswordInput } from "../ui/password-input";

// Descrições batem com as permissões das rotas da API (authorizeRequest)
export const allRoles = [
  {
    value: "ADMIN",
    label: "Administrador",
    group: "Administradores",
    desc: "Acesso total, inclusive a outros administradores.",
    icon: ShieldCheck,
  },
  {
    value: "GESTOR",
    label: "Gestor",
    group: "Gestores",
    desc: "Cuida de alunos, planos, agenda e equipe (menos administradores).",
    icon: Briefcase,
  },
  {
    value: "PROFESSOR",
    label: "Professor",
    group: "Professores",
    desc: "Cria aulas, agenda alunos, marca presença e responde mensagens.",
    icon: GraduationCap,
  },
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

interface Props {
  user?: SystemUser;
  onSubmit: (data: Record<string, unknown>) => void;
  // os botões ficam no rodapé do Modal e enviam este form via atributo `form={formId}`
  formId?: string;
}

export function UserForm({ user, onSubmit, formId = "user-form" }: Props) {
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

  const err = "text-sm text-destructive mt-1";
  const sectionTitle =
    "mv-mono mb-4 flex w-full items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)] after:h-px after:flex-1 after:bg-[var(--mv-line)]";

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
    <form id={formId} onSubmit={handleSubmit(submit)} className="space-y-7" noValidate>
      <fieldset className="space-y-4">
        <legend className={sectionTitle}>Dados de acesso</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex: Milena Souza" {...register("name")} />
            {errors.name && <p className={err}>{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="off" placeholder="nome@email.com" {...register("email")} />
            {errors.email && <p className={err}>{errors.email.message}</p>}
          </div>
        </div>
        {!isEdit && (
          <div className="sm:w-1/2 sm:pr-2">
            <Label htmlFor="password">Senha inicial</Label>
            <PasswordInput id="password" autoComplete="new-password" placeholder="mín. 8 caracteres" {...register("password")} />
            {errors.password ? (
              <p className={err}>{errors.password.message}</p>
            ) : (
              <p className="mt-1 text-xs text-[var(--mv-text-soft)]">Repasse para a pessoa; ela troca no perfil.</p>
            )}
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className={sectionTitle}>Papel</legend>
        {/* cartões em vez de select: cada papel já mostra o que pode fazer */}
        <div className="grid gap-3 sm:grid-cols-3">
          {roles.map((r) => (
            <label
              key={r.value}
              className="group flex cursor-pointer flex-col gap-1 rounded-2xl border border-[var(--mv-line)] p-3.5 transition-colors hover:bg-[var(--mv-brand-50)] has-[:checked]:border-[var(--mv-brand)] has-[:checked]:bg-[var(--mv-brand-50)] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[var(--mv-brand)]/15"
            >
              <span className="flex items-center gap-2">
                <input type="radio" value={r.value} className="sr-only" {...register("role")} />
                <r.icon className="h-[18px] w-[18px] text-[var(--mv-brand-700)]" />
                <span className="font-semibold text-[var(--mv-text)]">{r.label}</span>
                <span
                  aria-hidden
                  className="ml-auto h-4 w-4 rounded-full border-2 border-[var(--mv-line)] group-has-[:checked]:border-[5px] group-has-[:checked]:border-[var(--mv-brand)]"
                />
              </span>
              <span className="text-sm text-[var(--mv-text-soft)]">{r.desc}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </form>
  );
}
