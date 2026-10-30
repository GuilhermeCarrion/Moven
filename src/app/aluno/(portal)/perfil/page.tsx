"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import {
  useStudentProfile,
  useUpdateStudentProfile,
} from "@/hooks/useStudentProfile";
import {
  studentProfileUpdateSchema,
  StudentProfileUpdateSchema,
} from "@/schemas/studentProfile.schema";
import { apiError } from "@/lib/apiError";
import { formatCpf, formatPhone } from "@/lib/format";
import { LogOut } from "lucide-react";
import { DashCard } from "@/components/dashboard/DashCard";
import { PackageCard } from "@/components/student/PackageCard";
import { RecurrenceCard } from "@/components/student/RecurrenceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// nascimento é só data (meia-noite UTC no banco): no fuso local cairia no dia anterior
const birthBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--mv-line)] py-3 last:border-0">
      <span className="text-sm text-[var(--mv-text-soft)]">{label}</span>
      <span className="text-right font-medium tabular-nums text-[var(--mv-text)]">{value}</span>
    </div>
  );
}

export default function PerfilPage() {
  const { signOut } = useStudentAuth();
  const { data: p, isLoading } = useStudentProfile();
  const update = useUpdateStudentProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<StudentProfileUpdateSchema>({
    resolver: zodResolver(studentProfileUpdateSchema),
    values: p
      ? {
          heightCm: p.heightCm as number,
          weightKg: Number(p.weightKg),
          email: p.email ?? "",
        }
      : undefined,
  });

  const onSubmit = (data: StudentProfileUpdateSchema) =>
    update.mutate(data, {
      onSuccess: () => toast.success("Perfil atualizado"),
      onError: (e) => toast.error(apiError(e)),
    });

  if (isLoading || !p) {
    return <p className="py-8 text-center text-[var(--mv-text-soft)]">Carregando...</p>;
  }

  const err = "mt-1 text-sm text-destructive";

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <PackageCard name={p.name} pkg={p.package} />

      <RecurrenceCard className="rounded-[22px] border border-[var(--mv-line)] bg-[var(--mv-surface)] p-4 shadow-[0_1px_2px_rgb(11_21_48/0.04)] sm:p-5 lg:row-span-2" />

      {/* Editável */}
      <DashCard title="Meus dados" subtitle="E-mail, peso e altura você mesmo atualiza.">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="st-email">E-mail</Label>
              <Input id="st-email" type="email" autoComplete="email" placeholder="seu@email.com" {...register("email")} />
              {errors.email && <p className={err}>{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="st-weight">Peso (kg)</Label>
              <Input
                id="st-weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                {...register("weightKg", { valueAsNumber: true })}
              />
              {errors.weightKg && <p className={err}>{errors.weightKg.message}</p>}
            </div>
            <div>
              <Label htmlFor="st-height">Altura (cm)</Label>
              <Input
                id="st-height"
                type="number"
                inputMode="numeric"
                {...register("heightCm", { valueAsNumber: true })}
              />
              {errors.heightCm && <p className={err}>{errors.heightCm.message}</p>}
            </div>
          </div>
          <Button
            type="submit"
            disabled={update.isPending || !isDirty}
            className="mt-5 h-12 w-full sm:w-auto sm:min-w-44"
          >
            {update.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </DashCard>

      {/* Só leitura */}
      <DashCard title="Dados do cadastro" subtitle="Para alterar, fale com a academia.">
        <Row label="CPF" value={formatCpf(p.cpf)} />
        <Row label="Nascimento" value={birthBR(p.birthDate)} />
        <Row label="Celular" value={formatPhone(p.phone)} />
      </DashCard>

      {/* No celular não há sidebar: o tema fica aqui */}
      <DashCard title="Aparência" subtitle="Tema claro ou escuro neste aparelho.">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--mv-brand-50)] px-4 py-3">
          <span className="font-medium text-[var(--mv-text)]">
            <span className="dark:hidden">Tema claro</span>
            <span className="hidden dark:inline">Tema escuro</span>
          </span>
          <ThemeToggle className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--mv-line)] bg-[var(--mv-surface)] px-4 text-[var(--mv-text)] transition-colors hover:bg-[var(--mv-brand-100)]" />
        </div>
      </DashCard>

      {/* Sair (celular — no desktop o sair fica na barra do topo) */}
      <button
        onClick={signOut}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 font-semibold text-red-600 transition-colors hover:bg-red-500/10 lg:hidden dark:text-red-300"
      >
        <LogOut className="h-[18px] w-[18px]" /> Sair
      </button>
    </div>
  );
}
