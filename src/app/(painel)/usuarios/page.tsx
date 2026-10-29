"use client";

import { DashCard } from "@/components/dashboard/DashCard";
import { initials } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { allRoles, UserForm } from "@/components/user/UserForm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/contexts/AuthContext";
import {
  SystemUser,
  useCreateUser,
  useResetUserPassword,
  useUpdateUser,
  useUsers,
} from "@/hooks/useUsers";
import { apiError } from "@/lib/apiError";
import { KeyRound, Pencil, Plus, UserCheck, UserX } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const canManage = (cur?: string, row?: string) =>
  cur === "ADMIN" || (cur === "GESTOR" && row !== "ADMIN");

const iconBtn =
  "flex h-10 w-10 items-center justify-center rounded-xl text-[var(--mv-text-soft)] transition-colors";

const roleOrder = { ADMIN: 0, GESTOR: 1, PROFESSOR: 2 } as const;

// Avatar mais forte quanto mais acesso o papel tem
const avatarTone: Record<SystemUser["role"], string> = {
  ADMIN: "bg-[var(--mv-brand)] text-white",
  GESTOR: "bg-[var(--mv-brand-200)] text-[var(--mv-brand-700)]",
  PROFESSOR:
    "bg-[var(--mv-surface)] text-[var(--mv-brand-700)] ring-1 ring-[var(--mv-brand-200)]",
};

type Filter = "ALL" | SystemUser["role"];

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
  const [filter, setFilter] = useState<Filter>("ALL");

  const all = users ?? [];
  const activeCount = all.filter((u) => u.active).length;
  const count = (role: SystemUser["role"]) =>
    all.filter((u) => u.role === role).length;

  // Você primeiro; depois por papel e os ativos antes dos inativos
  const visible = all
    .filter((u) => filter === "ALL" || u.role === filter)
    .sort(
      (a, b) =>
        Number(b.id === current?.id) - Number(a.id === current?.id) ||
        roleOrder[a.role] - roleOrder[b.role] ||
        Number(b.active) - Number(a.active),
    );

  // Admin costuma ser só o dono: a aba só aparece quando há mais de um
  const tabs = [
    { value: "ALL" as Filter, label: "Todos", n: all.length },
    ...allRoles
      .filter((r) => r.value !== "ADMIN" || count("ADMIN") > 1)
      .map((r) => ({ value: r.value as Filter, label: r.group, n: count(r.value) })),
  ];
  const filterRole = allRoles.find((r) => r.value === filter);

  const toggleActive = (u: SystemUser) =>
    update.mutate(
      { id: u.id, data: { active: !u.active } },
      {
        onSuccess: () =>
          toast.success(u.active ? "Usuário inativado" : "Usuário ativado"),
        onError: (e) => toast.error(apiError(e)),
      },
    );

  const submitReset = () => {
    if (!resetting || newPw.length < 8) return;
    resetPw.mutate(
      { id: resetting.id, password: newPw },
      {
        onSuccess: () => {
          toast.success("Senha redefinida");
          setResetting(null);
        },
        onError: (e) => toast.error(apiError(e)),
      },
    );
  };

  // Rodapé dos modais: o botão envia o form pelo id
  const formFooter = (
    formId: string,
    onCancel: () => void,
    pending: boolean,
    label: string,
    disabled = false,
  ) => (
    <>
      <Button
        variant="secondary"
        onClick={onCancel}
        className="hidden sm:inline-flex"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        form={formId}
        disabled={pending || disabled}
        className="w-full sm:w-auto sm:min-w-44"
      >
        {pending ? "Salvando..." : label}
      </Button>
    </>
  );

  const actions = (u: SystemUser) => {
    if (u.id === current?.id)
      return (
        <Link
          href="/perfil"
          className="flex h-10 items-center whitespace-nowrap rounded-xl px-3 text-sm font-semibold text-[var(--mv-brand-700)] transition-colors hover:bg-[var(--mv-brand-100)]"
        >
          Editar no meu perfil
        </Link>
      );
    if (!canManage(current?.role, u.role))
      return (
        <span className="text-xs text-[var(--mv-text-soft)]">
          Só administradores editam
        </span>
      );
    return (
      <>
        <button
          onClick={() => setEditing(u)}
          title="Editar"
          aria-label={`Editar ${u.name}`}
          className={`${iconBtn} hover:bg-[var(--mv-brand-100)] hover:text-[var(--mv-text)]`}
        >
          <Pencil className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={() => {
            setResetting(u);
            setNewPw("");
          }}
          title="Redefinir senha"
          aria-label={`Redefinir senha de ${u.name}`}
          className={`${iconBtn} hover:bg-[var(--mv-brand-100)] hover:text-[var(--mv-text)]`}
        >
          <KeyRound className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={() => toggleActive(u)}
          title={u.active ? "Inativar" : "Ativar"}
          aria-label={`${u.active ? "Inativar" : "Ativar"} ${u.name}`}
          className={`${iconBtn} ${
            u.active
              ? "hover:bg-red-500/10 hover:text-red-600"
              : "hover:bg-emerald-500/15 hover:text-emerald-600"
          }`}
        >
          {u.active ? (
            <UserX className="h-[18px] w-[18px]" />
          ) : (
            <UserCheck className="h-[18px] w-[18px]" />
          )}
        </button>
      </>
    );
  };

  /** Crachá: furo do cordão no topo, avatar, nome, e-mail, papel e as ações. */
  const badge = (u: SystemUser) => {
    const role = allRoles.find((r) => r.value === u.role)!;
    return (
      <li
        key={u.id}
        className={`relative flex flex-col items-center rounded-[20px] bg-[var(--mv-brand-50)] px-4 pb-3 pt-6 text-center ${
          u.active ? "" : "opacity-60"
        }`}
      >
        <span
          aria-hidden
          className="absolute top-2.5 h-1.5 w-10 rounded-full bg-[var(--mv-surface)] shadow-[inset_0_1px_2px_rgb(11_21_48/0.15)]"
        />
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full text-base font-bold ${avatarTone[u.role]}`}
        >
          {initials(u.name)}
        </span>
        <p className="mt-2.5 flex max-w-full items-center gap-1.5 font-bold text-[var(--mv-text)]">
          <span className="truncate">{u.name}</span>
          {u.id === current?.id && (
            <span className="flex-shrink-0 rounded-full bg-[var(--mv-brand)] px-2 py-0.5 text-[10px] font-semibold text-white">
              Você
            </span>
          )}
        </p>
        <p className="max-w-full truncate text-sm text-[var(--mv-text-soft)]">
          {u.email}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--mv-surface)] px-2.5 py-0.5 text-xs font-semibold text-[var(--mv-brand-700)]">
            <role.icon className="h-3.5 w-3.5" /> {role.label}
          </span>
          {!u.active && (
            <span className="rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              Inativo
            </span>
          )}
        </div>

        <div className="mt-3 flex min-h-10 w-full items-center justify-center gap-1 border-t border-dashed border-[var(--mv-brand-200)] pt-2">
          {actions(u)}
        </div>
      </li>
    );
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow={`Usuários · ${activeCount} ${activeCount === 1 ? "acesso ativo" : "acessos ativos"}`}
        title="Usuários"
        description="Quem entra no painel da academia e o que cada pessoa pode fazer."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-[18px] w-[18px]" /> Novo usuário
          </Button>
        }
      />

      <DashCard
        title="Equipe"
        subtitle={`${all.length} ${all.length === 1 ? "pessoa" : "pessoas"} · ${count("GESTOR")} ${count("GESTOR") === 1 ? "gestor" : "gestores"} · ${count("PROFESSOR")} ${count("PROFESSOR") === 1 ? "professor" : "professores"}`}
      >
        {/* Filtro por papel; com um papel escolhido, mostra o que ele pode fazer */}
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--mv-line)] p-1">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilter(t.value)}
                aria-pressed={filter === t.value}
                className={`flex h-9 flex-shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors ${
                  filter === t.value
                    ? "bg-[var(--mv-brand-100)] text-[var(--mv-brand-700)]"
                    : "text-[var(--mv-text-soft)] hover:bg-[var(--mv-brand-50)]"
                }`}
              >
                {t.label}
                <span className="tabular-nums opacity-70">{t.n}</span>
              </button>
            ))}
          </div>
          {filterRole && (
            <p className="flex items-center gap-1.5 text-sm text-[var(--mv-text-soft)]">
              <filterRole.icon className="h-4 w-4 flex-shrink-0 text-[var(--mv-brand-700)]" />
              {filterRole.desc}
            </p>
          )}
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-[var(--mv-text-soft)]">
            Carregando...
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {visible.map(badge)}
            {/* crachá em branco: atalho para adicionar alguém à equipe */}
            <li>
              <button
                onClick={() => setCreating(true)}
                className="flex h-full min-h-48 w-full flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-[var(--mv-brand-200)] text-sm font-semibold text-[var(--mv-brand-700)] transition-colors hover:bg-[var(--mv-brand-50)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--mv-brand-100)]">
                  <Plus className="h-5 w-5" />
                </span>
                Adicionar à equipe
              </button>
            </li>
          </ul>
        )}
      </DashCard>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Novo usuário"
        description="A pessoa entra no painel com o e-mail e a senha inicial."
        footer={formFooter(
          "user-form",
          () => setCreating(false),
          create.isPending,
          "Criar usuário",
        )}
      >
        <UserForm
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

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar usuário"
        description={editing?.name}
        footer={formFooter(
          "user-form",
          () => setEditing(null),
          update.isPending,
          "Salvar alterações",
        )}
      >
        {editing && (
          <UserForm
            user={editing}
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

      <Modal
        open={!!resetting}
        onClose={() => setResetting(null)}
        title="Redefinir senha"
        description={resetting?.name}
        footer={formFooter(
          "reset-pw-form",
          () => setResetting(null),
          resetPw.isPending,
          "Redefinir senha",
          newPw.length < 8,
        )}
      >
        <form
          id="reset-pw-form"
          onSubmit={(e) => {
            e.preventDefault();
            submitReset();
          }}
          className="sm:max-w-sm"
        >
          <Label htmlFor="new-password">Nova senha</Label>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="mín. 8 caracteres"
          />
          <p className="mt-1 text-xs text-[var(--mv-text-soft)]">
            Anote e repasse ao usuário — ele será desconectado de todos os
            dispositivos.
          </p>
        </form>
      </Modal>
    </div>
  );
}
