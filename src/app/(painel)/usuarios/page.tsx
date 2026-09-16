"use client";

import { UserForm } from "@/components/user/UserForm";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/contexts/AuthContext";
import {
  SystemUser,
  useCreateUser,
  useResetUserPassword,
  useUpdateUser,
  useUsers,
} from "@/hooks/useUsers";
import { apiError } from "@/lib/apiError";
import { KeyRound, Pencil, Plus, Search, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password-input";

const glass =
  "border border-white/60 bg-white/55 backdrop-blur-2xl backdrop-saturate-150";

const roleBadge: Record<string, string> = {
  ADMIN: "bg-violet-100 text-violet-700",
  GESTOR: "bg-cyan-100 text-cyan-700",
  PROFESSOR: "bg-slate-200/70 text-slate-600",
};
const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  GESTOR: "Gestor",
  PROFESSOR: "Professor",
};
const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const canManage = (cur?: string, row?: string) =>
  cur === "ADMIN" || (cur === "GESTOR" && row !== "ADMIN");

export default function UsuariosPage() {
  const { user: current } = useAuth();
  const { data: users, isLoading } = useUsers();
  const create = useCreateUser();
  const update = useUpdateUser();
  const resetPw = useResetUserPassword();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SystemUser | null>(null);
  const [resetting, setResetting] = useState<SystemUser | null>(null);
  const [newPw, setNewPw] = useState("");
  const [search, setSearch] = useState("");

  const filtered = (users ?? []).filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  const toggleActive = (u: SystemUser) =>
    update.mutate(
      { id: u.id, data: { active: !u.active } },
      {
        onSuccess: () =>
          toast.success(u.active ? "Usuário inativado" : "Usuário ativado"),
        onError: (e) => toast.error(apiError(e)),
      },
    );

  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Usuários
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Crie e gerencie os acessos da equipe (papéis, senhas e status).
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Novo usuário
        </Button>
      </div>

      <div className={`overflow-hidden rounded-2xl shadow-xl ${glass}`}>
        <div className="flex flex-wrap items-center gap-3 border-b border-white/40 p-5">
          <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-white/70 bg-white/40 px-3.5 py-2.5">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              placeholder="Buscar por nome ou e-mail"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-white/40 bg-white/20 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Usuário</th>
                <th className="px-6 py-3">Papel</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    className="px-6 py-6 text-center text-slate-400"
                    colSpan={4}
                  >
                    Carregando...
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-6 text-center text-slate-400"
                    colSpan={4}
                  >
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
              {filtered.map((u) => {
                const isSelf = u.id === current?.id;
                const manageable = !isSelf && canManage(current?.role, u.role);
                return (
                  <tr
                    key={u.id}
                    className="border-b border-white/30 transition-colors hover:bg-white/30"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-cyan-700">
                          {initials(u.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {u.name}
                            {isSelf && (
                              <span className="ml-2 text-xs font-normal text-slate-400">
                                (você)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${roleBadge[u.role]}`}
                      >
                        {roleLabel[u.role]}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${u.active ? "bg-green-100 text-green-700" : "bg-slate-200/70 text-slate-500"}`}
                      >
                        {u.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-2">
                        {manageable ? (
                          <>
                            <button
                              onClick={() => setEditing(u)}
                              title="Editar"
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setResetting(u);
                                setNewPw("");
                              }}
                              title="Redefinir senha"
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition-colors hover:bg-amber-100"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => toggleActive(u)}
                              title={u.active ? "Inativar" : "Ativar"}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${u.active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                            >
                              {u.active ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Criar */}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Novo usuário"
      >
        <UserForm
          isSubmitting={create.isPending}
          onSubmit={(data) =>
            create.mutate(data, {
              onSuccess: () => {
                toast.success("Usuário criado");
                setCreating(false);
              },
              onError: (e) => toast.error(apiError(e)),
            })
          }
        />
      </Modal>

      {/* Editar */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar usuário"
      >
        {editing && (
          <UserForm
            user={editing}
            isSubmitting={update.isPending}
            onSubmit={(data) =>
              update.mutate(
                { id: editing.id, data },
                {
                  onSuccess: () => {
                    toast.success("Usuário atualizado");
                    setEditing(null);
                  },
                  onError: (e) => toast.error(apiError(e)),
                },
              )
            }
          />
        )}
      </Modal>

      {/* Resetar senha */}
      <Modal
        open={!!resetting}
        onClose={() => setResetting(null)}
        title={`Redefinir senha — ${resetting?.name ?? ""}`}
      >
        {resetting && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nova senha
              </label>
              <PasswordInput
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="mín. 8 caracteres"
              />
              <p className="mt-1 text-xs text-slate-400">
                Anote e repasse ao usuário — ele será desconectado de todos os
                dispositivos.
              </p>
            </div>
            <Button
              className="w-full"
              disabled={resetPw.isPending || newPw.length < 8}
              onClick={() =>
                resetPw.mutate(
                  { id: resetting.id, password: newPw },
                  {
                    onSuccess: () => {
                      toast.success("Senha redefinida");
                      setResetting(null);
                    },
                    onError: (e) => toast.error(apiError(e)),
                  },
                )
              }
            >
              {resetPw.isPending ? "Salvando..." : "Redefinir senha"}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
