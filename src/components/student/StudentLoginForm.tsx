"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IdCard, Calendar } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import {
  studentLoginSchema,
  StudentLoginSchema,
} from "@/schemas/studentAuth.schema";

const fieldWrap =
  "flex items-center gap-3 rounded-xl border border-white/70 bg-white/50 px-3.5 py-3 transition-colors focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/25";
const fieldInput =
  "w-full min-w-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400";

export function StudentLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useStudentAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentLoginSchema>({
    resolver: zodResolver(studentLoginSchema),
  });

  const onSubmit = async (data: StudentLoginSchema) => {
    try {
      setError(null);
      await signIn(data.cpf, data.birthDate);
      router.push("/aluno/aulas");
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "CPF ou data de nascimento inválidos",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-600">
          CPF
        </label>
        <div className={fieldWrap}>
          <IdCard className="h-4 w-4 flex-shrink-0 text-slate-400" />
          <input
            inputMode="numeric"
            maxLength={11}
            placeholder="Somente numeros"
            className={fieldInput}
            {...register("cpf", {
              onChange: (e) =>
                (e.target.value = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 11)),
            })}
          />
        </div>
        {errors.cpf && (
          <p className="mt-1 text-xs text-red-500">{errors.cpf.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-600">
          Data de nascimento
        </label>
        <div className={fieldWrap}>
          <Calendar className="h-4 w-4 flex-shrink-0 text-slate-400" />
          <input
            type="date"
            className={fieldInput}
            {...register("birthDate")}
          />
        </div>
        {errors.birthDate && (
          <p className="mt-1 text-xs text-red-500">
            {errors.birthDate.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--primary-focus)] disabled:opacity-60"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
