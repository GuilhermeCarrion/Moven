"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { loginSchema, LoginSchema } from "@/schemas/auth.schema";

const fieldWrap =
  "flex items-center gap-3 rounded-xl border border-white/70 bg-white/50 px-3.5 py-3 transition-colors focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/25";
const fieldInput =
  "w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400";

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
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-600">
          Email
        </label>
        <div className={fieldWrap}>
          <Mail className="h-4 w-4 flex-shrink-0 text-slate-400" />
          <input
            type="email"
            placeholder="seu@email.com"
            className={fieldInput}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-600">
          Senha
        </label>
        <div className={fieldWrap}>
          <Lock className="h-4 w-4 flex-shrink-0 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={fieldInput}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">
          <input type="checkbox" className="accent-[var(--primary)] h-4 w-4" />
          Lembrar-me
        </label>
        <a
          href="#"
          className="text-sm font-medium text-[var(--primary)] hover:underline"
        >
          Esqueci a senha
        </a>
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
