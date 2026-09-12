"use client";

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
import { Pencil, Plus, Power, Ticket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const glass =
  "border border-white/60 bg-white/55 backdrop-blur-2xl backdrop-saturate-150";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function PlanosPage() {
  const { data: plans, isLoading } = usePlans();
  const create = useCreatePlan();
  const deactivate = useDeactivatePlan();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const update = useUpdatePlan(editing?.id ?? "");

  return (
    <>
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Planos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Crie planos e defina créditos, validade e preço.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Novo plano
        </Button>
      </div>

      {/* Card da tabela */}
      <div className={`overflow-hidden rounded-2xl shadow-xl ${glass}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/40 bg-white/20 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Aulas</th>
                <th className="px-6 py-3">Validade</th>
                <th className="px-6 py-3">Preço</th>
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
              {!isLoading && plans?.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-6 text-center text-slate-400"
                    colSpan={6}
                  >
                    Nenhum plano cadastrado.
                  </td>
                </tr>
              )}
              {plans?.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-white/30 transition-colors hover:bg-white/30"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                        <Ticket className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-slate-800">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">{p.credits}</td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {p.validityDays} dias
                  </td>
                  <td className="px-6 py-3.5 font-medium text-slate-700">
                    {brl.format(Number(p.price))}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        p.active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200/70 text-slate-500"
                      }`}
                    >
                      {p.active ? "Ativo" : "Inativo"}
                    </span>
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
                      {p.active && (
                        <button
                          title="Desativar"
                          onClick={() =>
                            deactivate.mutate(p.id, {
                              onSuccess: () =>
                                toast.success("Plano desativado"),
                              onError: (e) => toast.error(apiError(e)),
                            })
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais */}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Novo plano"
      >
        <PlanForm
          isSubmitting={create.isPending}
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
      >
        {editing && (
          <PlanForm
            plan={editing}
            isSubmitting={update.isPending}
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
    </>
  );
}
