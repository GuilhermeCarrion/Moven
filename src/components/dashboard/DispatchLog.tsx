import { CheckCheck, CircleAlert, Clock } from "lucide-react";
import { DashCard } from "./DashCard";
import type { DashboardDispatch as Dispatch, DispatchStatus, JobType } from "./types";

const typeLabel: Record<JobType, string> = {
  PRESENCE_CONFIRMATION: "Confirmação de presença",
  WELCOME: "Boas-vindas",
  PLAN_EXPIRY: "Aviso de vencimento",
};

const statusUi: Record<DispatchStatus, { icon: typeof CheckCheck; cls: string }> = {
  SENT: { icon: CheckCheck, cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  FAILED: { icon: CircleAlert, cls: "bg-red-500/10 text-red-700 dark:text-red-300" },
  PENDING: { icon: Clock, cls: "bg-amber-500/15 text-amber-800 dark:text-amber-300" },
};

function statusText(d: Dispatch) {
  if (d.status === "FAILED") return "Falhou";
  if (d.status === "PENDING") return `Na fila · ${d.scheduledFor}`;
  return "Enviado";
}

/** Resumo do log do worker (a versão completa fica numa tela própria). */
export function DispatchLog({ dispatches, className }: { dispatches: Dispatch[]; className?: string }) {
  return (
    <DashCard title="Últimos disparos" subtitle="Mensagens automáticas do WhatsApp" className={className}>
      {dispatches.length === 0 && (
        <p className="py-6 text-center text-sm text-[var(--mv-text-soft)]">Nenhum disparo ainda.</p>
      )}
      <ul className="-mx-1 divide-y divide-[var(--mv-line)]">
        {dispatches.map((d, i) => {
          const s = statusUi[d.status];
          return (
            <li key={i} className="flex items-center gap-3 px-1 py-3" title={d.error}>
              <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${s.cls}`}>
                <s.icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--mv-text)]">{typeLabel[d.type]}</p>
                <p className="truncate text-sm text-[var(--mv-text-soft)]">
                  {d.to} · {statusText(d)}
                </p>
              </div>
              <span className="flex-shrink-0 text-sm tabular-nums text-[var(--mv-text-soft)]">{d.at}</span>
            </li>
          );
        })}
      </ul>
    </DashCard>
  );
}
