"use client";

import { DashCard } from "@/components/dashboard/DashCard";
import { initials, roleLabel } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { allRoles } from "@/components/user/UserForm";
import { useAuth } from "@/contexts/AuthContext";
import {
  useChangePassword,
  useLogoutAll,
  useUpdateProfile,
} from "@/hooks/useProfile";
import { apiError } from "@/lib/apiError";
import { LogOut } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function PerfilPage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const logoutAll = useLogoutAll();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const role = allRoles.find((r) => r.value === user?.role);

  // Erros da senha aparecem embaixo do campo enquanto a pessoa digita
  const nextError =
    next && next.length < 8 ? "Use pelo menos 8 caracteres" : null;
  const confirmError =
    confirm && next !== confirm ? "A confirmação não bate com a nova senha" : null;
  const canSavePassword = !!current && next.length >= 8 && next === confirm;

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      { name, email },
      {
        onSuccess: () => toast.success("Perfil atualizado"),
        onError: (err) => toast.error(apiError(err)),
      },
    );
  };

  const savePassword = (e: FormEvent) => {
    e.preventDefault();
    if (!canSavePassword) return;
    changePassword.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => {
          toast.success("Senha alterada");
          setCurrent("");
          setNext("");
          setConfirm("");
        },
        onError: (err) => toast.error(apiError(err)),
      },
    );
  };

  const handleLogoutAll = () =>
    logoutAll.mutate(undefined, {
      onSuccess: () => {
        toast.success("Você saiu de todos os dispositivos");
        window.location.href = "/login";
      },
      onError: (e) => toast.error(apiError(e)),
    });

  const err = "mt-1 text-sm text-destructive";

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow={`Perfil · ${roleLabel(user?.role)}`}
        title="Meu perfil"
        description="Seus dados de acesso, sua senha e os aparelhos conectados."
      />

      <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Seu crachá (mesmo do quadro de Usuários); acompanha o que você digita */}
        {/* brand-100 (não 50): aqui o crachá fica direto no fundo da página, sem card branco em volta */}
        <section className="relative flex flex-col items-center rounded-[22px] bg-[var(--mv-brand-100)] px-5 pb-6 pt-8 text-center">
          <span
            aria-hidden
            className="absolute top-3 h-2 w-12 rounded-full bg-[var(--mv-surface)] shadow-[inset_0_1px_2px_rgb(11_21_48/0.15)]"
          />
          <p className="mv-mono text-[10px] uppercase tracking-[0.18em] text-[var(--mv-brand-700)]">
            {user?.academy?.name ?? "Moven"}
          </p>
          <span className="mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--mv-brand)] text-2xl font-bold text-white shadow-[0_14px_30px_-16px_var(--mv-brand)]">
            {initials(name || user?.name)}
          </span>
          <p className="mt-3 max-w-full truncate text-lg font-bold text-[var(--mv-text)]">
            {name || "Seu nome"}
          </p>
          <p className="max-w-full truncate text-sm text-[var(--mv-text-soft)]">
            {email}
          </p>
          {role && (
            <>
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[var(--mv-surface)] px-3 py-1 text-xs font-semibold text-[var(--mv-brand-700)]">
                <role.icon className="h-3.5 w-3.5" /> {role.label}
              </span>
              <p className="mt-4 w-full border-t border-dashed border-[var(--mv-brand-200)] pt-3 text-sm text-[var(--mv-text-soft)]">
                {role.desc}
              </p>
            </>
          )}
        </section>

        <div className="space-y-4">
          <DashCard title="Dados" subtitle="Nome e e-mail que você usa para entrar.">
            <form onSubmit={saveProfile} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="w-full sm:w-auto sm:min-w-44"
                >
                  {updateProfile.isPending ? "Salvando..." : "Salvar dados"}
                </Button>
              </div>
            </form>
          </DashCard>

          <DashCard title="Senha" subtitle="Para trocar, confirme a senha atual.">
            <form onSubmit={savePassword} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 sm:w-1/2 sm:pr-2">
                  <Label htmlFor="current">Senha atual</Label>
                  <PasswordInput
                    id="current"
                    autoComplete="current-password"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="next">Nova senha</Label>
                  <PasswordInput
                    id="next"
                    autoComplete="new-password"
                    placeholder="mín. 8 caracteres"
                    aria-invalid={!!nextError}
                    aria-describedby={nextError ? "next-error" : undefined}
                    value={next}
                    onChange={(e) => setNext(e.target.value)}
                  />
                  {nextError && (
                    <p id="next-error" className={err}>
                      {nextError}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirm">Confirmar nova senha</Label>
                  <PasswordInput
                    id="confirm"
                    autoComplete="new-password"
                    aria-invalid={!!confirmError}
                    aria-describedby={confirmError ? "confirm-error" : undefined}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                  {confirmError && (
                    <p id="confirm-error" className={err}>
                      {confirmError}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <Button
                  type="submit"
                  disabled={changePassword.isPending || !canSavePassword}
                  className="w-full sm:w-auto sm:min-w-44"
                >
                  {changePassword.isPending ? "Salvando..." : "Trocar senha"}
                </Button>
              </div>
            </form>
          </DashCard>

          <DashCard
            title="Sessões"
            subtitle="Encerra o acesso em todos os aparelhos, incluindo este. Você precisará entrar de novo."
          >
            <Button
              variant="destructive"
              disabled={logoutAll.isPending}
              onClick={handleLogoutAll}
              className="w-full sm:w-auto"
            >
              <LogOut className="h-[18px] w-[18px]" /> Sair de todos os
              dispositivos
            </Button>
          </DashCard>
        </div>
      </div>
    </div>
  );
}
