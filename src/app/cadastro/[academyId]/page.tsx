"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, MessageCircle } from "lucide-react";
import { apiPublic } from "@/lib/axios";
import { studentSchema, StudentSchema } from "@/schemas/students.schema";
import { apiError } from "@/lib/apiError";

const CANVAS_BG =
  "linear-gradient(160deg, oklch(0.95 0.015 255), oklch(0.97 0.01 300) 45%, oklch(0.96 0.012 258))";
const WHATS_TEXT =
  "Terminei meu cadastro! Vamos marcar minha aula experimental?";

const fieldWrap =
  "flex items-center gap-2 rounded-xl border border-white/70 bg-white/50 px-3.5 py-3 transition-colors focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/25";
const fieldInput =
  "w-full min-w-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400";
const digits = (max: number) => (e: any) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, max);
};

export default function CadastroPage() {
  const { academyId } = useParams<{ academyId: string }>();
  const [academyName, setAcademyName] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    apiPublic
      .get(`/public/academies/${academyId}`)
      .then((r) => setAcademyName(r.data.name))
      .catch(() => setAcademyName(null));
  }, [academyId]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentSchema>({ resolver: zodResolver(studentSchema) });

  const onSubmit = async (data: StudentSchema) => {
    try {
      await apiPublic.post(`/public/academies/${academyId}/students`, data);
      setDone(true);
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(WHATS_TEXT);
    toast.success("Texto copiado!");
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-6"
      style={{ background: CANVAS_BG }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(100,130,160,0.25) 1px, transparent 1.5px)",
          backgroundSize: "22px 22px",
          opacity: 0.5,
        }}
      />
      <div
        className="pointer-events-none absolute h-[520px] w-[520px] rounded-full"
        style={{
          top: -180,
          right: -140,
          background:
            "radial-gradient(circle, var(--brand-cyan), transparent 70%)",
          opacity: 0.22,
          filter: "blur(50px)",
        }}
      />

      <div className="relative z-10 w-full max-w-[480px]">
        <div
          className="rounded-3xl border border-white/50 bg-white/40 p-8 backdrop-blur-2xl backdrop-saturate-150"
          style={{
            boxShadow:
              "0 30px 70px -25px rgba(8,90,120,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          {done ? (
            // ── Tela de sucesso (handoff pro WhatsApp) ──
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800">
                Cadastro concluído!
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Agora é só voltar ao WhatsApp da academia para marcarmos sua{" "}
                <b>aula experimental</b> com um profissional.
              </p>

              <div className="mt-6 rounded-2xl border border-white/60 bg-white/60 p-4 text-left">
                <p className="text-sm text-slate-700">“{WHATS_TEXT}”</p>
              </div>

              <button
                onClick={copy}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-focus)]"
              >
                <Copy className="h-4 w-4" /> Copiar mensagem
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <MessageCircle className="h-3.5 w-3.5" /> Cole no WhatsApp da
                academia
              </p>
            </div>
          ) : (
            // ── Formulário ──
            <>
              <div className="mb-6 h-1 w-10 rounded-full bg-[var(--primary)]" />
              <h2 className="text-2xl font-extrabold text-slate-800">
                Fazer meu cadastro
              </h2>
              <p className="mt-1.5 mb-6 text-sm text-slate-500">
                {academyName
                  ? academyName
                  : "Preencha seus dados para começar."}
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                <Field label="Nome completo" error={errors.name?.message}>
                  <input className={fieldInput} {...register("name")} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Celular (DDD)" error={errors.phone?.message}>
                    <input
                      inputMode="numeric"
                      placeholder="11999999999"
                      className={fieldInput}
                      {...register("phone", { onChange: digits(11) })}
                    />
                  </Field>
                  <Field label="CPF" error={errors.cpf?.message}>
                    <input
                      inputMode="numeric"
                      placeholder="Somente números"
                      className={fieldInput}
                      {...register("cpf", { onChange: digits(11) })}
                    />
                  </Field>
                </div>

                <Field
                  label="Data de nascimento"
                  error={errors.birthDate?.message}
                >
                  <input
                    type="date"
                    className={fieldInput}
                    {...register("birthDate", {
                      setValueAs: (v) => (v === "" ? undefined : v),
                    })}
                  />
                </Field>

                <Field label="E-mail (opcional)" error={errors.email?.message}>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className={fieldInput}
                    {...register("email")}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Peso (kg)" error={errors.weightKg?.message}>
                    <input
                      type="number"
                      step="0.1"
                      className={fieldInput}
                      {...register("weightKg", { valueAsNumber: true })}
                    />
                  </Field>
                  <Field label="Altura (cm)" error={errors.heightCm?.message}>
                    <input
                      type="number"
                      className={fieldInput}
                      {...register("heightCm", { valueAsNumber: true })}
                    />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-focus)] disabled:opacity-60"
                >
                  {isSubmitting ? "Enviando..." : "Enviar cadastro"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
      </label>
      <div className={fieldWrap}>{children}</div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
