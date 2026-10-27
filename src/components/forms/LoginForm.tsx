"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { loginSchema, LoginSchema } from "@/schemas/auth.schema";

// text-base nos campos: 16px evita o zoom automático do iOS ao focar
const fieldWrap =
  "flex h-12 items-center gap-3 rounded-xl border border-[var(--mv-line)] bg-[var(--mv-field)] px-4 transition-colors focus-within:border-[var(--mv-brand)] focus-within:ring-4 focus-within:ring-[var(--mv-brand)]/15";
const fieldInput =
  "w-full bg-transparent text-base text-[var(--mv-text)] outline-none placeholder:text-[var(--mv-text-soft)]/70";
const label = "mb-2 block text-sm font-medium text-[var(--mv-text)]";
const fieldError = "mt-1.5 text-sm text-red-600 dark:text-red-400";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginSchema) => {
    try {
      setError(null);
      await signIn(data.email, data.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Email ou senha inválidos");
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
        <label htmlFor="login-email" className={label}>
          E-mail
        </label>
        <div className={fieldWrap}>
          <Mail className="h-[18px] w-[18px] flex-shrink-0 text-[var(--mv-text-soft)]" />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className={fieldInput}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p id="login-email-error" className={fieldError}>
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="login-password" className={label}>
          Senha
        </label>
        <div className={fieldWrap}>
          <Lock className="h-[18px] w-[18px] flex-shrink-0 text-[var(--mv-text-soft)]" />
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            className={fieldInput}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="-mr-2 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-[var(--mv-text-soft)] transition-colors hover:text-[var(--mv-text)]"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="h-[18px] w-[18px]" />
            ) : (
              <Eye className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="login-password-error" className={fieldError}>
            {errors.password.message}
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
