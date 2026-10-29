"use client";

import { DashCard } from "@/components/dashboard/DashCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlanForm } from "@/components/plans/PlanForm";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  useCreatePlan,
  useDeactivatePlan,
  usePlans,
  useUpdatePlan,
} from "@/hooks/usePlans";
import { apiError } from "@/lib/apiError";
import { Plan } from "@/types/models";
import { CalendarClock, Pencil, Plus, Power, Ticket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const iconBtn =
  "flex h-10 w-10 items-center justify-center rounded-xl text-[var(--mv-text-soft)] transition-colors";

export default function PlanosPage() {
  const { data: plans, isLoading } = usePlans();
  const create = useCreatePlan();
  const deactivate = useDeactivatePlan();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const update = useUpdatePlan(editing?.id ?? "");

  const all = plans ?? [];
  const activeCount = all.filter((p) => p.active).length;
  // ativos primeiro quando os inativos aparecem
  const visible = all
    .filter((p) => showInactive || p.active)
    .sort((a, b) => Number(b.active) - Number(a.active));

  const onDeactivate = (p: Plan) =>
    deactivate.mutate(p.id, {
      onSuccess: () => toast.success("Plano desativado"),
      onError: (e) => toast.error(apiError(e)),
    });

  // Rodapé dos modais: o botão envia o PlanForm pelo id ("plan-form")
  const formFooter = (onCancel: () => void, pending: boolean, label: string) => (
    <>
      <Button variant="secondary" onClick={onCancel} className="hidden sm:inline-flex">
        Cancelar
      </Button>
      <Button type="submit" form="plan-form" disabled={pending} className="w-full sm:w-auto sm:min-w-44">
        {pending ? "Salvando..." : label}
      </Button>
    </>
  );

  const inactiveToggle = (display: string) => (
    <button
      type="button"
      onClick={() => setShowInactive((v) => !v)}
      aria-pressed={showInactive}
      className={`${display} h-11 flex-shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors ${
        showInactive
          ? "border-transparent bg-[var(--mv-brand-100)] text-[var(--mv-brand-700)]"
          : "border-[var(--mv-line)] text-[var(--mv-text-soft)] hover:bg-[var(--mv-brand-50)]"
      }`}
    >
      <Power className="h-4 w-4" />
      Mostrar inativos ({all.length - activeCount})
    </button>
  );

  const empty = isLoading
    ? "Carregando..."
    : visible.length === 0
      ? all.length
        ? "Nenhum plano ativo."
        : "Nenhum plano cadastrado."
      : null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow={`Planos · ${activeCount} ${activeCount === 1 ? "ativo" : "ativos"}`}
        title="Planos"
        description="Os pacotes de aulas que você vende: quantas aulas, por quantos dias e por quanto."
      />

      <DashCard
        title="Planos à venda"
        subtitle={`${visible.length} ${visible.length === 1 ? "plano" : "planos"}`}
        action={
          <div className="flex gap-2">
            {inactiveToggle("hidden sm:flex")}
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-[18px] w-[18px]" /> Novo plano
            </Button>
          </div>
        }
      >
        {/* No celular o filtro não cabe ao lado do botão: desce para cá */}
        <div className="mb-3 flex justify-end sm:hidden">{inactiveToggle("flex")}</div>

        {empty && <p className="py-8 text-center text-[var(--mv-text-soft)]">{empty}</p>}

        {/* Cada plano é um "ticket": preço em cima, picote, aulas e validade embaixo */}
        {!empty && (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((p) => {
              const price = Number(p.price);
              const credits = Number(p.credits);
              return (
                <li
                  key={p.id}
                  className={`relative flex flex-col overflow-hidden rounded-[18px] bg-[var(--mv-brand-50)] ${p.active ? "" : "opacity-60"}`}
                >
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 pt-2">
                        <p className="truncate text-base font-bold text-[var(--mv-text)] sm:text-lg">{p.name}</p>
                        {!p.active && (
                          <span className="mt-1 inline-block rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Inativo
                          </span>
                        )}
                      </div>
                      <div className="-mr-2 -mt-1 flex gap-1">
                        <button
                          onClick={() => setEditing(p)}
                          title="Editar"
                          aria-label={`Editar ${p.name}`}
                          className={`${iconBtn} hover:bg-[var(--mv-brand-100)] hover:text-[var(--mv-text)]`}
                        >
                          <Pencil className="h-[18px] w-[18px]" />
                        </button>
                        {p.active && (
                          <button
                            onClick={() => onDeactivate(p)}
                            title="Desativar"
                            aria-label={`Desativar ${p.name}`}
                            className={`${iconBtn} hover:bg-red-500/10 hover:text-red-600`}
                          >
                            <Power className="h-[18px] w-[18px]" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-3xl font-bold leading-none tracking-tight tabular-nums text-[var(--mv-text)] sm:text-4xl">
                      {brl.format(price)}
                    </p>
                    <p className="mt-1.5 text-sm tabular-nums text-[var(--mv-text-soft)]">
                      {brl.format(price / credits)} por aula
                    </p>
                  </div>

                  {/* Picote: dois recortes laterais com a cor do card de fora + linha tracejada */}
                  <div aria-hidden className="relative z-10">
                    <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-[var(--mv-surface)]" />
                    <span className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-[var(--mv-surface)]" />
                    <div className="mx-5 border-t-2 border-dashed border-[var(--mv-brand-200)]" />
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 bg-[var(--mv-brand-100)] px-4 py-3 text-sm font-semibold text-[var(--mv-brand-700)] sm:px-5">
                    <span className="flex items-center gap-1.5">
                      <Ticket className="h-4 w-4" /> {credits} {credits === 1 ? "aula" : "aulas"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarClock className="h-4 w-4" /> {p.validityDays} dias de validade
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DashCard>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Novo plano"
        description="O plano fica disponível para atribuir aos alunos."
        footer={formFooter(() => setCreating(false), create.isPending, "Criar plano")}
      >
        <PlanForm
          onSubmit={(data) =>
            create.mutate(data, {
              onSuccess: () => {
                toast.success("Plano criado");
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
        title="Editar plano"
        description={editing?.name}
        footer={formFooter(() => setEditing(null), update.isPending, "Salvar alterações")}
      >
        {editing && (
          <PlanForm
            plan={editing}
            onSubmit={(data) =>
              update.mutate(data, {
                onSuccess: () => {
                  toast.success("Plano atualizado");
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
