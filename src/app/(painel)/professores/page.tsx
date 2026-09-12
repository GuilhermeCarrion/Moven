"use client";

import { ProfessorForm } from "@/components/professors/ProfessorForm";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  useCreateProfessor,
  useDeleteProfessor,
  useProfessors,
  useUpdateProfessor,
} from "@/hooks/useProfessors";
import { apiError } from "@/lib/apiError";
import { formatCpf, formatPhone } from "@/lib/format";
import { Professor } from "@/types/models";
import { Pencil, Plus, Search, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const glass =
  "border border-white/60 bg-white/55 backdrop-blur-2xl backdrop-saturate-150";

const avatarPalette = [
  { bg: "#e0f2f7", fg: "#0e7490" },
  { bg: "#dcfce7", fg: "#15803d" },
  { bg: "#ede9fe", fg: "#6d28d9" },
];

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function ProfessoresPage() {
  const { data: professors, isLoading } = useProfessors();
  const create = useCreateProfessor();
  const remove = useDeleteProfessor();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Professor | null>(null);
  const [search, setSearch] = useState("");

  const update = useUpdateProfessor(editing?.id ?? "");

  const filtered = (professors ?? []).filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.cpf.toLowerCase().includes(q);
  });

  return (
    <>
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Professores
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cadastre e gerencie os professores da academia.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Novo Professor
        </Button>
      </div>

      {/* Card da tabela */}
      <div className={`overflow-hidden rounded-2xl shadow-xl ${glass}`}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-white/40 p-5">
          <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-white/70 bg-white/40 px-3.5 py-2.5">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              placeholder="Busque por nome ou CPF"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-white/40 bg-white/20 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Telefone</th>
                <th className="px-6 py-3">CPF</th>
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
                    Nenhum professor encontrado.
                  </td>
                </tr>
              )}
              {filtered.map((p, i) => {
                const pal = avatarPalette[i % avatarPalette.length];
                return (
                  <tr
                    key={p.id}
                    className="border-b border-white/30 transition-colors hover:bg-white/30"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                          style={{ background: pal.bg, color: pal.fg }}
                        >
                          {initials(p.name)}
                        </div>
                        <span className="font-semibold text-slate-800">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {formatPhone(p.phone)}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {formatCpf(p.cpf)}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditing(p)}
                          title="Editar"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          title="Inativar"
                          onClick={() =>
                            remove.mutate(p.id, {
                              onSuccess: () =>
                                toast.success(
                                  "Professor inativado com sucesso",
                                ),
                              onError: (e) => toast.error(apiError(e)),
                            })
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais */}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Novo professor"
      >
        <ProfessorForm
          isSubmitting={create.isPending}
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
      >
        {editing && (
          <ProfessorForm
            professor={editing}
            isSubmitting={update.isPending}
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
    </>
  );
}
