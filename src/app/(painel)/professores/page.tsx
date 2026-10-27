"use client";

import { DashCard } from "@/components/dashboard/DashCard";
import { initials } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfessorForm } from "@/components/professors/ProfessorForm";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatTile } from "@/components/ui/stat-tile";
import {
  useCreateProfessor,
  useDeleteProfessor,
  useProfessors,
  useUpdateProfessor,
} from "@/hooks/useProfessors";
import { apiError } from "@/lib/apiError";
import { formatCpf, formatPhone } from "@/lib/format";
import { Professor } from "@/types/models";
import { GraduationCap, KeyRound, Pencil, Plus, Search, UserRoundX, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const iconBtn =
  "flex h-10 w-10 items-center justify-center rounded-xl text-[var(--mv-text-soft)] transition-colors";

/** Professor com login próprio (vínculo com User) vê o painel. */
function AccessChip({ p }: { p: Professor }) {
  return p.userId ? (
    <span className="rounded-full bg-[var(--mv-brand-100)] px-2.5 py-1 text-xs font-semibold text-[var(--mv-brand-700)]">
      Acesso ao painel
    </span>
  ) : (
    <span className="rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
      Sem acesso
    </span>
  );
}

export default function ProfessoresPage() {
  const { data: professors, isLoading } = useProfessors();
  const create = useCreateProfessor();
  const remove = useDeleteProfessor();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Professor | null>(null);
  const [search, setSearch] = useState("");
  // shortcut: botão só visual; a API ainda não lista inativos — ligar no filtro quando listar
  const [showInactive, setShowInactive] = useState(false);

  const update = useUpdateProfessor(editing?.id ?? "");

  const filtered = (professors ?? []).filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.cpf.toLowerCase().includes(q);
  });

  const total = professors?.length ?? 0;
  const withAccess = (professors ?? []).filter((p) => p.userId).length;

  const onInactivate = (p: Professor) =>
    remove.mutate(p.id, {
      onSuccess: () => toast.success("Professor inativado"),
      onError: (e) => toast.error(apiError(e)),
    });

  const actions = (p: Professor) => (
    <div className="flex justify-end gap-1">
      <button
        onClick={() => setEditing(p)}
        title="Editar"
        aria-label={`Editar ${p.name}`}
        className={`${iconBtn} hover:bg-[var(--mv-brand-50)] hover:text-[var(--mv-text)]`}
      >
        <Pencil className="h-[18px] w-[18px]" />
      </button>
      <button
        onClick={() => onInactivate(p)}
        title="Inativar"
        aria-label={`Inativar ${p.name}`}
        className={`${iconBtn} hover:bg-red-500/10 hover:text-red-600`}
      >
        <UserX className="h-[18px] w-[18px]" />
      </button>
    </div>
  );

  const avatar = (p: Professor) => (
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--mv-brand-100)] text-xs font-bold text-[var(--mv-brand-700)]">
      {initials(p.name)}
    </span>
  );

  // Rodapé dos modais: o botão envia o ProfessorForm pelo id ("professor-form")
  const formFooter = (onCancel: () => void, pending: boolean, label: string) => (
    <>
      <Button variant="secondary" onClick={onCancel} className="hidden sm:inline-flex">
        Cancelar
      </Button>
      <Button type="submit" form="professor-form" disabled={pending} className="w-full sm:w-auto sm:min-w-44">
        {pending ? "Salvando..." : label}
      </Button>
    </>
  );

  const empty = isLoading
    ? "Carregando..."
    : filtered.length === 0
      ? "Nenhum professor encontrado."
      : null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow={`Professores · ${total} ${total === 1 ? "ativo" : "ativos"}`}
        title="Professores"
        description="Cadastre os professores que dão aula na academia. Quem tem login também acessa o painel."
      />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatTile tone="brand" icon={GraduationCap} label="Professores" value={total} />
        <StatTile tone="cyan" icon={KeyRound} label="Com acesso" value={withAccess} />
        <StatTile tone="amber" icon={UserRoundX} label="Sem acesso" value={total - withAccess} />
      </div>

      <DashCard
        title="Lista de professores"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "professor" : "professores"}`}
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-[18px] w-[18px]" /> Novo professor
          </Button>
        }
      >
        {/* Busca + filtro de inativos */}
        <div className="mb-3 flex gap-2">
          <div className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-[var(--mv-line)] bg-[var(--mv-field)] px-3.5 focus-within:border-[var(--mv-brand)] focus-within:ring-4 focus-within:ring-[var(--mv-brand)]/15">
            <Search className="h-[18px] w-[18px] flex-shrink-0 text-[var(--mv-text-soft)]" />
            <input
              aria-label="Buscar professor"
              placeholder="Buscar nome ou CPF"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-w-0 bg-transparent text-base text-[var(--mv-text)] outline-none placeholder:text-[var(--mv-text-soft)]/70"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowInactive((v) => !v)}
            aria-pressed={showInactive}
            className={`flex h-11 flex-shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors ${
              showInactive
                ? "border-transparent bg-[var(--mv-brand-100)] text-[var(--mv-brand-700)]"
                : "border-[var(--mv-line)] text-[var(--mv-text-soft)] hover:bg-[var(--mv-brand-50)]"
            }`}
          >
            <UserX className="h-4 w-4" />
            <span className="hidden sm:inline">Mostrar inativos</span>
            <span className="sm:hidden">Inativos</span>
          </button>
        </div>

        {empty && <p className="py-8 text-center text-[var(--mv-text-soft)]">{empty}</p>}

        {/* Desktop: tabela */}
        {!empty && (
          <div className="hidden xl:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="mv-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mv-text-soft)]">
                  <th className="py-3 pr-4 font-normal">Professor</th>
                  <th className="py-3 pr-4 font-normal">Telefone</th>
                  <th className="py-3 pr-4 font-normal">CPF</th>
                  <th className="py-3 pr-4 font-normal">Painel</th>
                  <th className="py-3 text-right font-normal">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--mv-line)]">
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {avatar(p)}
                        <p className="truncate font-semibold text-[var(--mv-text)]">{p.name}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 tabular-nums text-[var(--mv-text-soft)]">
                      {formatPhone(p.phone)}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 tabular-nums text-[var(--mv-text-soft)]">
                      {formatCpf(p.cpf)}
                    </td>
                    <td className="py-3 pr-4">
                      <AccessChip p={p} />
                    </td>
                    <td className="py-3">{actions(p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Celular e telas médias: cards */}
        {!empty && (
          <ul className="-mx-1 divide-y divide-[var(--mv-line)] xl:hidden">
            {filtered.map((p) => (
              <li key={p.id} className="px-1 py-3">
                <div className="flex items-center gap-3">
                  {avatar(p)}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--mv-text)]">{p.name}</p>
                    <p className="text-sm tabular-nums text-[var(--mv-text-soft)]">
                      {formatPhone(p.phone)}
                    </p>
                  </div>
                  <AccessChip p={p} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 pl-[52px]">
                  <span className="text-sm tabular-nums text-[var(--mv-text-soft)]">
                    CPF {formatCpf(p.cpf)}
                  </span>
                  {actions(p)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashCard>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Novo professor"
        description="O professor aparece na agenda para receber aulas."
        footer={formFooter(() => setCreating(false), create.isPending, "Cadastrar professor")}
      >
        <ProfessorForm
          onSubmit={(data) =>
            create.mutate(data, {
              onSuccess: () => {
                toast.success("Professor cadastrado");
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
        title="Editar professor"
        description={editing?.name}
        footer={formFooter(() => setEditing(null), update.isPending, "Salvar alterações")}
      >
        {editing && (
          <ProfessorForm
            professor={editing}
            onSubmit={(data) =>
              update.mutate(data, {
                onSuccess: () => {
                  toast.success("Professor atualizado");
                  setEditing(null);
                },
                onError: (e) => toast.error(apiError(e)),
              })
            }
          />
        )}
      </Modal>
    </div>
  );
}
