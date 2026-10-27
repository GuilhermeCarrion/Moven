"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CalendarDays, IdCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import z from "zod";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { maskCpf, maskDate } from "@/lib/format";
import { studentLoginSchema } from "@/schemas/studentAuth.schema";

// Os campos mostram máscara (000.000.000-00 e DD/MM/AAAA); aqui volta ao formato da API.
// Data digitada em vez do seletor nativo: no celular ele abre no ano atual e a pessoa rola décadas.
const formSchema = z.object({
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(studentLoginSchema.shape.cpf),
  birthDate: z
    .string()
    // o form guarda o valor antes da máscara: colar "03032000" chega sem barras
    .transform(maskDate)
    .pipe(z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Digite a data como DD/MM/AAAA"))
    .transform((v) => v.split("/").reverse().join("-"))
    .pipe(studentLoginSchema.shape.birthDate),
});

// text-base nos campos: 16px evita o zoom automático do iOS ao focar
const fieldWrap =
  "flex h-12 items-center gap-3 rounded-xl border border-[var(--mv-line)] bg-[var(--mv-field)] px-4 transition-colors focus-within:border-[var(--mv-brand)] focus-within:ring-4 focus-within:ring-[var(--mv-brand)]/15";
const fieldInput =
  "w-full bg-transparent text-base tabular-nums text-[var(--mv-text)] outline-none placeholder:text-[var(--mv-text-soft)]/70";
const label = "mb-2 block text-sm font-medium text-[var(--mv-text)]";
const fieldError = "mt-1.5 text-sm text-red-600 dark:text-red-400";

export function StudentLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useStudentAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(formSchema) });

  const onSubmit = async (data: z.output<typeof formSchema>) => {
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
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="student-cpf" className={label}>
          CPF
        </label>
        <div className={fieldWrap}>
          <IdCard className="h-[18px] w-[18px] flex-shrink-0 text-[var(--mv-text-soft)]" />
          <input
            id="student-cpf"
            inputMode="numeric"
            enterKeyHint="next"
            maxLength={14}
            placeholder="000.000.000-00"
            aria-invalid={!!errors.cpf}
            aria-describedby={errors.cpf ? "student-cpf-error" : undefined}
            className={fieldInput}
            {...register("cpf", {
              onChange: (e) => {
                e.target.value = maskCpf(e.target.value);
                // CPF completo: já leva para a data
                if (e.target.value.length === 14) setFocus("birthDate");
              },
            })}
          />
        </div>
        {errors.cpf && (
          <p id="student-cpf-error" className={fieldError}>
            {errors.cpf.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="student-birth" className={label}>
          Data de nascimento
        </label>
        <div className={fieldWrap}>
          <CalendarDays className="h-[18px] w-[18px] flex-shrink-0 text-[var(--mv-text-soft)]" />
          <input
            id="student-birth"
            inputMode="numeric"
            enterKeyHint="go"
            maxLength={10}
            placeholder="DD/MM/AAAA"
            aria-invalid={!!errors.birthDate}
            aria-describedby={errors.birthDate ? "student-birth-error" : undefined}
            className={fieldInput}
            {...register("birthDate", {
              onChange: (e) => (e.target.value = maskDate(e.target.value)),
            })}
          />
        </div>
        {errors.birthDate && (
          <p id="student-birth-error" className={fieldError}>
            {errors.birthDate.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--mv-brand)] text-base font-semibold text-white shadow-[0_12px_28px_-12px_var(--mv-brand)] transition-all hover:brightness-110 disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-[18px] w-[18px] animate-spin" /> Entrando…
          </>
        ) : (
          <>
            Entrar
            <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
