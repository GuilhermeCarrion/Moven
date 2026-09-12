"use client";

import { StudentForm } from "@/components/students/StudentForm";
import { StudentPackages } from "@/components/students/StudentPackages";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  useCreateStudent,
  useInactivateStudent,
  useStudents,
  useUpdateStudent,
} from "@/hooks/useStudents";
import { apiError } from "@/lib/apiError";
import { formatCpf, formatPhone } from "@/lib/format";
import { Student } from "@/types/models";
import {
  Package,
  Pencil,
  Plus,
  Search,
  UserX,
  Users,
  UserCheck,
  UserMinus,
} from "lucide-react";
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

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(iso));

export default function AlunosPage() {
  const { data: students, isLoading } = useStudents();
  const create = useCreateStudent();
  const inactivate = useInactivateStudent();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [packagesOf, setPackagesOf] = useState<Student | null>(null);

  const update = useUpdateStudent(editing?.id ?? "");

  const filtered = (students ?? []).filter((s) => {
    if (!showInactive && !s.active) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return s.name.toLowerCase().includes(q) || s.cpf.includes(q);
  });

  const total = students?.length ?? 0;
  const ativos = (students ?? []).filter((s) => s.active).length;
  const inativos = total - ativos;

  const stats = [
    {
      label: "Alunos ativos",
      value: ativos,
      Icon: Users,
      tint: "#e0f2f7",
      fg: "#0e7490",
    },
    {
      label: "Total de alunos",
      value: total,
      Icon: UserCheck,
      tint: "#dcfce7",
      fg: "#15803d",
    },
    {
      label: "Inativos",
      value: inativos,
      Icon: UserMinus,
      tint: "#fef3c7",
      fg: "#b45309",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Alunos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cadastre, edite e gerencie os alunos, seus pacotes e créditos.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Novo Aluno
        </Button>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`flex flex-col items-start gap-1 rounded-2xl p-3 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:p-5 ${glass}`}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl sm:h-11 sm:w-11"
              style={{ background: s.tint, color: s.fg }}
            >
              <s.Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="text-lg font-bold leading-none text-slate-800 sm:text-xl">
                {s.value}
              </div>
              <div className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Card da tabela */}
      <div className={`overflow-hidden rounded-2xl shadow-xl ${glass}`}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-white/40 p-5">
          <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-white/70 bg-white/40 px-3.5 py-2.5">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              placeholder="Buscar por nome ou CPF"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-500">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="accent-[var(--primary)] h-4 w-4"
            />
            Mostrar inativos
          </label>
        </div>

        {/* Tabela */}
        {/* Container de rolagem horizontal */}
        <div className="overflow-y-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-white/40 bg-white/20 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Telefone</th>
                <th className="px-6 py-3">CPF</th>
                <th className="px-6 py-3">Créditos</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    className="px-6 py-6 text-center text-slate-400"
                    colSpan={6}
                  >
                    Carregando...
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-6 text-center text-slate-400"
                    colSpan={6}
                  >
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              )}
              {filtered.map((s, i) => {
                const pal = avatarPalette[i % avatarPalette.length];
                return (
                  <tr
                    key={s.id}
                    className="border-b border-white/30 transition-colors hover:bg-white/30"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                          style={{ background: pal.bg, color: pal.fg }}
                        >
                          {initials(s.name)}
                        </div>
                        <span className="font-semibold text-slate-800">
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {formatPhone(s.phone)}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {formatCpf(s.cpf)}
                    </td>
                    <td className="px-6 py-3.5">
                      {s.studentPackages?.[0] ? (
                        <div>
                          <span className="font-semibold text-slate-800">
                            {s.studentPackages[0].creditsRemaining}
                          </span>
                          <span className="text-slate-400"> créditos</span>
                          <div className="text-xs text-slate-400">
                            vence {fmtDate(s.studentPackages[0].expiresAt)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Sem pacote
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          s.active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-200/70 text-slate-500"
                        }`}
                      >
                        {s.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setPackagesOf(s)}
                          title="Pacotes"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition-colors hover:bg-amber-100"
                        >
                          <Package className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditing(s)}
                          title="Editar"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {s.active && (
                          <button
                            title="Inativar"
                            onClick={() =>
                              inactivate.mutate(s.id, {
                                onSuccess: () =>
                                  toast.success("Aluno inativado"),
                                onError: (e) => toast.error(apiError(e)),
                              })
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
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

      {/* Modais (inalterados) */}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Novo aluno"
      >
        <StudentForm
          isSubmitting={create.isPending}
          onSubmit={(data) =>
            create.mutate(data, {
              onSuccess: () => {
                toast.success("Aluno cadastrado");
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
        title="Editar aluno"
      >
        {editing && (
          <StudentForm
            student={editing}
            isSubmitting={update.isPending}
            onSubmit={(data) => {
              update.mutate(data, {
                onSuccess: () => {
                  toast.success("Aluno atualizado");
                  setEditing(null);
                },
                onError: (e) => toast.error(apiError(e)),
              });
            }}
          />
        )}
      </Modal>

      <Modal
        open={!!packagesOf}
        onClose={() => setPackagesOf(null)}
        title={`Pacotes - ${packagesOf?.name ?? ""}`}
      >
        {packagesOf && (
          <StudentPackages
            studentId={packagesOf.id}
            studentActive={packagesOf.active}
          />
        )}
      </Modal>
    </>
  );
}
