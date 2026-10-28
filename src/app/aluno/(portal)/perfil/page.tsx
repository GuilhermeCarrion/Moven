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
import { LogOut, User, Package, Pencil } from "lucide-react";
import { RecurrenceCard } from "@/components/student/RecurrenceCard";

const fieldWrap =
  "flex items-center gap-2 rounded-xl border border-white/70 bg-white/50 px-3.5 py-3 transition-colors focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/25";
const fieldInput =
  "w-full min-w-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400";

const card =
  "rounded-2xl border border-white/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl";

const cpfMask = (cpf: string) =>
  cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
const dateBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
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
    return <p className="text-sm text-slate-400">Carregando...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-800">Perfil</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dados (só leitura) */}
        <div className={card}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
            <User className="h-4 w-4 text-[var(--primary)]" /> Dados pessoais
          </h2>
          <Row label="Nome" value={p.name} />
          <Row label="CPF" value={cpfMask(p.cpf)} />
          <Row label="Nascimento" value={dateBR(p.birthDate)} />
          <Row label="Celular" value={p.phone} />
          <p className="mt-3 text-xs text-slate-400">
            Para alterar esses dados, fale com a academia.
          </p>
        </div>

        {/* Pacote (só leitura) */}
        <div className={card}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Package className="h-4 w-4 text-[var(--primary)]" /> Meu pacote
          </h2>
          {p.package ? (
            <>
              <Row label="Plano" value={p.package.planName} />
              <Row
                label="Créditos"
                value={`${p.package.creditsRemaining} de ${p.package.creditsTotal}`}
              />
              <Row label="Válido até" value={dateBR(p.package.expiresAt)} />
            </>
          ) : (
            <p className="text-sm text-slate-400">
              Nenhum pacote ativo. Fale com a academia.
            </p>
          )}
        </div>

        <RecurrenceCard className={`${card} lg:col-span-2`} />

        {/* Editável */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`${card} lg:col-span-2`}
        >
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Pencil className="h-4 w-4 text-[var(--primary)]" /> Editar meus
            dados
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                E-mail
              </label>
              <div className={fieldWrap}>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className={fieldInput}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Peso (kg)
              </label>
              <div className={fieldWrap}>
                <input
                  type="number"
                  step="0.1"
                  className={fieldInput}
                  {...register("weightKg", { valueAsNumber: true })}
                />
              </div>
              {errors.weightKg && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.weightKg.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Altura (cm)
              </label>
              <div className={fieldWrap}>
                <input
                  type="number"
                  className={fieldInput}
                  {...register("heightCm", { valueAsNumber: true })}
                />
              </div>
              {errors.heightCm && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.heightCm.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={update.isPending || !isDirty}
            className="mt-5 w-full rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-focus)] disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {update.isPending ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>

      {/* Sair (mobile — no desktop o logout está no top nav) */}
      <button
        onClick={signOut}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600 lg:hidden"
      >
        <LogOut className="h-4 w-4" /> Sair
      </button>
    </div>
  );
}
