"use client";

import { usePlans } from "@/hooks/usePlans";
import {
  useAssignPackage,
  useCancelPackage,
  useStudentPackages,
} from "@/hooks/useStudentPackages";
import { apiError } from "@/lib/apiError";
import { StudentPackageStatus } from "@/types/models";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

const statusLabel: Record<StudentPackageStatus, string> = {
  ACTIVE: "Ativo",
  EXPIRED: "Vencido",
  DEPLETED: "Esgotado",
  CANCELLED: "Cancelado",
};

const statusColor: Record<StudentPackageStatus, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  EXPIRED: "bg-red-500/10 text-red-700 dark:text-red-300",
  DEPLETED: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  CANCELLED: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

export function StudentPackages({
  studentId,
  studentActive,
}: {
  studentId: string;
  studentActive: boolean;
}) {
  const { data: packages, isLoading } = useStudentPackages(studentId);
  const { data: plans } = usePlans(true); // Só planos ativos
  const assign = useAssignPackage();
  const cancel = useCancelPackage(studentId);
  const [planId, setPlanId] = useState("");

  const handleAssign = () => {
    if (!planId) return toast.error("Selecione um plano");
    assign.mutate(
      { studentId, planId },
      {
        onSuccess: () => {
          toast.success("Pacote atribuído");
          setPlanId("");
        },
        onError: (e) => toast.error(apiError(e)),
      },
    );
  };

  return (
    <div className="space-y-5">
      {isLoading && <p className="text-sm text-[var(--mv-text-soft)]">Carregando...</p>}
      {!isLoading && packages?.length === 0 && (
        <p className="rounded-xl border border-dashed border-[var(--mv-line)] p-4 text-center text-sm text-[var(--mv-text-soft)]">
          Nenhum pacote registrado.
        </p>
      )}

      {!!packages?.length && (
        <ul className="space-y-2">
          {packages.map((pkg) => (
            <li key={pkg.id} className="rounded-2xl border border-[var(--mv-line)] p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--mv-text)]">
                    {pkg.plan?.name ?? "Plano"}
                  </p>
                  <p className="text-sm text-[var(--mv-text-soft)]">
                    {pkg.creditsRemaining} de {pkg.creditsTotal} créditos · vence{" "}
                    {new Date(pkg.expiresAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[pkg.status]}`}
                >
                  {statusLabel[pkg.status]}
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--mv-brand-100)]">
                  <div
                    className="h-full rounded-full bg-[var(--mv-brand)]"
                    style={{ width: `${(pkg.creditsRemaining / pkg.creditsTotal) * 100}%` }}
                  />
                </div>
                {pkg.status === "ACTIVE" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      cancel.mutate(pkg.id, {
                        onSuccess: () => toast.success("Pacote cancelado"),
                        onError: (e) => toast.error(apiError(e)),
                      })
                    }
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {studentActive && (
        <div className="border-t border-[var(--mv-line)] pt-4">
          <label
            htmlFor="assign-plan"
            className="mb-1.5 block text-sm font-medium text-[var(--mv-text)]"
          >
            Atribuir novo pacote
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              id="assign-plan"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="h-11 w-full min-w-0 flex-1 rounded-xl border border-[var(--mv-line)] bg-[var(--mv-field)] px-3 text-base text-[var(--mv-text)] outline-none focus-visible:border-[var(--mv-brand)] focus-visible:ring-4 focus-visible:ring-[var(--mv-brand)]/15"
            >
              <option value="">Selecione um plano...</option>
              {plans?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.credits} aulas / {p.validityDays} dias
                </option>
              ))}
            </select>
            <Button onClick={handleAssign} disabled={assign.isPending}>
              {assign.isPending ? "Atribuindo..." : "Atribuir"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
