"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/contexts/AuthContext";
import {
  useChangePassword,
  useLogoutAll,
  useUpdateProfile,
} from "@/hooks/useProfile";
import { apiError } from "@/lib/apiError";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const glass =
  "border border-white/60 bg-white/55 backdrop-blur-2xl backdrop-saturate-150";
const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  GESTOR: "Gestor",
  PROFESSOR: "Professor",
};

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

  const saveProfile = () =>
    updateProfile.mutate(
      { name, email },
      {
        onSuccess: () => toast.success("Perfil atualizado"),
        onError: (e) => toast.error(apiError(e)),
      },
    );

  const savePassword = () => {
    if (next.length < 8)
      return toast.error("A nova senha deve ter no mínimo 8 caracteres");
    if (next !== confirm)
      return toast.error("A confirmação não bate com a nova senha");
    changePassword.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => {
          toast.success("Senha alterada");
          setCurrent("");
          setNext("");
          setConfirm("");
        },
        onError: (e) => toast.error(apiError(e)),
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

  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Meu perfil
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie seus dados, sua senha e suas sessões.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dados */}
        <div className={`rounded-2xl p-6 shadow-sm ${glass}`}>
          <h2 className="text-base font-bold text-slate-800">Dados</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Papel</Label>
              <div className="mt-1">
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                  {roleLabel[user?.role ?? ""] ?? "—"}
                </span>
              </div>
            </div>
            <Button
              className="w-full"
              disabled={updateProfile.isPending}
              onClick={saveProfile}
            >
              {updateProfile.isPending ? "Salvando..." : "Salvar dados"}
            </Button>
          </div>
        </div>

        {/* Senha */}
        <div className={`rounded-2xl p-6 shadow-sm ${glass}`}>
          <h2 className="text-base font-bold text-slate-800">Trocar senha</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="current">Senha atual</Label>
              <PasswordInput
                id="current"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="next">Nova senha</Label>
              <PasswordInput
                id="next"
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirm">Confirmar nova senha</Label>
              <PasswordInput
                id="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              disabled={changePassword.isPending}
              onClick={savePassword}
            >
              {changePassword.isPending ? "Salvando..." : "Trocar senha"}
            </Button>
          </div>
        </div>

        {/* Sessões */}
        <div className={`rounded-2xl p-6 shadow-sm lg:col-span-2 ${glass}`}>
          <h2 className="text-base font-bold text-slate-800">Sessões</h2>
          <p className="mt-1 text-sm text-slate-500">
            Encerra o acesso em todos os aparelhos (incluindo este) — você
            precisará entrar novamente.
          </p>
          <Button
            variant="destructive"
            className="mt-4"
            disabled={logoutAll.isPending}
            onClick={handleLogoutAll}
          >
            <LogOut className="h-4 w-4" /> Sair de todos os dispositivos
          </Button>
        </div>
      </div>
    </>
  );
}
