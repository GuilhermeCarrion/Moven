"use client";

import { DashCard } from "@/components/dashboard/DashCard";
import { initials } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { StudentForm } from "@/components/students/StudentForm";
import { StudentPackages } from "@/components/students/StudentPackages";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatTile } from "@/components/ui/stat-tile";
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
  UserCheck,
  UserMinus,
  UserX,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(iso));

const DAY = 24 * 60 * 60 * 1000;

/** Pacote ativo do aluno; "soon" = vence em até 7 dias. */
function packageInfo(s: Student) {
  const pkg = s.studentPackages?.[0];
  if (!pkg) return null;
  const daysLeft = Math.ceil((new Date(pkg.expiresAt).getTime() - Date.now()) / DAY);
  const soon = daysLeft <= 7;
  return {
    credits: `${pkg.creditsRemaining} ${pkg.creditsRemaining === 1 ? "crédito" : "créditos"}`,
    due: soon
      ? daysLeft <= 0
        ? "vence hoje"
        : `vence em ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}`
      : `vence ${fmtDate(pkg.expiresAt)}`,
    soon,
  };
}

/** Créditos na tabela (desktop). */
function Credits({ s }: { s: Student }) {
  const p = packageInfo(s);
  if (!p) return <span className="text-sm text-[var(--mv-text-soft)]">Sem pacote</span>;
  return (
    <div>
      <span className="font-semibold text-[var(--mv-text)]">{p.credits}</span>
      <div
        className={`text-xs ${p.soon ? "font-semibold text-amber-700 dark:text-amber-300" : "text-[var(--mv-text-soft)]"}`}
      >
        {p.due}
      </div>
    </div>
  );
}

/** Pacote em destaque no card do celular; tocar abre os pacotes do aluno. */
function PackageBox({ s, onOpen }: { s: Student; onOpen: () => void }) {
  const p = packageInfo(s);
  return (
    <button
      onClick={onOpen}
      aria-label={`Pacotes de ${s.name}`}
      className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors ${
        !p
          ? "border border-dashed border-[var(--mv-line)] text-[var(--mv-text-soft)] hover:bg-[var(--mv-brand-50)]"
          : p.soon
            ? "bg-amber-500/10 hover:bg-amber-500/15"
            : "bg-[var(--mv-brand-50)] hover:bg-[var(--mv-brand-100)]"
      }`}
    >
      <Package
        className={`h-[18px] w-[18px] flex-shrink-0 ${
          !p
            ? ""
            : p.soon
              ? "text-amber-700 dark:text-amber-300"
              : "text-[var(--mv-brand-700)]"
        }`}
      />
      {p ? (
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[var(--mv-text)]">{p.credits}</span>
          <span
            className={`block truncate text-xs ${p.soon ? "font-semibold text-amber-700 dark:text-amber-300" : "text-[var(--mv-text-soft)]"}`}
          >
            {p.due}
          </span>
        </span>
      ) : (
        <span className="text-sm">Atribuir pacote</span>
      )}
    </button>
  );
}


function StatusChip({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-slate-500/10 text-slate-600 dark:text-slate-300"
      }`}
    >
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

const iconBtn =
  "flex h-10 w-10 items-center justify-center rounded-xl text-[var(--mv-text-soft)] transition-colors";

export default function AlunosPage() {
  const { data: students, isLoading } = useStudents();
  const create = useCreateStudent();
  const inactivate = useInactivateStudent();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [packagesOf, setPackagesOf] = useState<Student | null>(null);

  // /alunos?pacotes=<id> (vindo da dashboard) abre direto os pacotes do aluno.
  // Lê a URL no navegador em vez de useSearchParams, que exigiria Suspense no build.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("pacotes");
    const found = id && students?.find((s) => s.id === id);
    if (found) setPackagesOf(found);
  }, [students]);

  const closePackages = () => {
    setPackagesOf(null);
    // tira o ?pacotes= para o modal não reabrir quando a lista recarregar
    window.history.replaceState(null, "", window.location.pathname);
  };

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

  const onInactivate = (s: Student) =>
    inactivate.mutate(s.id, {
      onSuccess: () => toast.success("Aluno inativado"),
      onError: (e) => toast.error(apiError(e)),
    });

  // No celular o pacote já tem a própria caixa (PackageBox), então o ícone sai
  const actions = (s: Student, withPackage = true) => (
    <div className="flex justify-end gap-1">
      {withPackage && (
        <button
          onClick={() => setPackagesOf(s)}
          title="Pacotes e créditos"
          aria-label={`Pacotes de ${s.name}`}
          className={`${iconBtn} bg-[var(--mv-brand-50)] text-[var(--mv-brand-700)] hover:bg-[var(--mv-brand-100)]`}
        >
          <Package className="h-[18px] w-[18px]" />
        </button>
      )}
      <button
        onClick={() => setEditing(s)}
        title="Editar"
        aria-label={`Editar ${s.name}`}
        className={`${iconBtn} hover:bg-[var(--mv-brand-50)] hover:text-[var(--mv-text)]`}
      >
        <Pencil className="h-[18px] w-[18px]" />
      </button>
      {s.active && (
        <button
          onClick={() => onInactivate(s)}
          title="Inativar"
          aria-label={`Inativar ${s.name}`}
          className={`${iconBtn} hover:bg-red-500/10 hover:text-red-600`}
        >
          <UserX className="h-[18px] w-[18px]" />
        </button>
      )}
    </div>
  );

  // Rodapé dos modais de formulário: o botão envia o StudentForm pelo id ("student-form")
  const formFooter = (onCancel: () => void, pending: boolean, label: string) => (
    <>
      <Button variant="secondary" onClick={onCancel} className="hidden sm:inline-flex">
        Cancelar
      </Button>
      <Button type="submit" form="student-form" disabled={pending} className="w-full sm:w-auto sm:min-w-44">
        {pending ? "Salvando..." : label}
      </Button>
    </>
  );

  const avatar = (s: Student) => (
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--mv-brand-100)] text-xs font-bold text-[var(--mv-brand-700)]">
      {initials(s.name)}
    </span>
  );

  const empty = isLoading ? "Carregando..." : filtered.length === 0 ? "Nenhum aluno encontrado." : null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow={`Alunos · ${ativos} ativos`}
        title="Alunos"
        description="Cadastre alunos, atribua pacotes e acompanhe os créditos de cada um."
      />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatTile tone="brand" icon={Users} label="Ativos" value={ativos} />
        <StatTile tone="cyan" icon={UserCheck} label="Total" value={total} />
        <StatTile tone="amber" icon={UserMinus} label="Inativos" value={inativos} />
      </div>

      <DashCard
        title="Lista de alunos"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "aluno" : "alunos"}`}
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-[18px] w-[18px]" /> Novo aluno
          </Button>
        }
      >
        {/* Busca + filtro de inativos */}
        <div className="mb-3 flex gap-2">
          <div className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-[var(--mv-line)] bg-[var(--mv-field)] px-3.5 focus-within:border-[var(--mv-brand)] focus-within:ring-4 focus-within:ring-[var(--mv-brand)]/15">
            <Search className="h-[18px] w-[18px] flex-shrink-0 text-[var(--mv-text-soft)]" />
            <input
              aria-label="Buscar aluno"
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
            <UserMinus className="h-4 w-4" />
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
                  <th className="py-3 pr-4 font-normal">Aluno</th>
                  <th className="py-3 pr-4 font-normal">Telefone</th>
                  <th className="py-3 pr-4 font-normal">CPF</th>
                  <th className="py-3 pr-4 font-normal">Créditos</th>
                  <th className="py-3 pr-4 font-normal">Status</th>
                  <th className="py-3 text-right font-normal">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--mv-line)]">
                {filtered.map((s) => (
                  <tr key={s.id} className={s.active ? "" : "opacity-60"}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {avatar(s)}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[var(--mv-text)]">{s.name}</p>
                          {s.email && (
                            <p className="truncate text-xs text-[var(--mv-text-soft)]">{s.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 tabular-nums text-[var(--mv-text-soft)]">
                      {formatPhone(s.phone)}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 tabular-nums text-[var(--mv-text-soft)]">
                      {formatCpf(s.cpf)}
                    </td>
                    <td className="py-3 pr-4">
                      <Credits s={s} />
                    </td>
                    <td className="py-3 pr-4">
                      <StatusChip active={s.active} />
                    </td>
                    <td className="py-3">{actions(s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Celular: cards */}
        {!empty && (
          <ul className="-mx-1 divide-y divide-[var(--mv-line)] xl:hidden">
            {filtered.map((s) => (
              <li key={s.id} className={`px-1 py-3 ${s.active ? "" : "opacity-60"}`}>
                <div className="flex items-center gap-3">
                  {avatar(s)}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--mv-text)]">{s.name}</p>
                    <p className="text-sm tabular-nums text-[var(--mv-text-soft)]">
                      {formatPhone(s.phone)}
                    </p>
                  </div>
                  <StatusChip active={s.active} />
                </div>
                <div className="mt-2.5 flex items-center gap-2 pl-[52px]">
                  <PackageBox s={s} onOpen={() => setPackagesOf(s)} />
                  {actions(s, false)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashCard>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Novo aluno"
        description="Depois de cadastrar, atribua um pacote para o aluno poder agendar."
        footer={formFooter(() => setCreating(false), create.isPending, "Cadastrar aluno")}
      >
        <StudentForm
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
        description={editing?.name}
        footer={formFooter(() => setEditing(null), update.isPending, "Salvar alterações")}
      >
        {editing && (
          <StudentForm
            student={editing}
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
        onClose={closePackages}
        title="Pacotes e créditos"
        description={packagesOf?.name}
      >
        {packagesOf && (
          <StudentPackages studentId={packagesOf.id} studentActive={packagesOf.active} />
        )}
      </Modal>
    </div>
  );
}
