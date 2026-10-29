import { Ban, ChevronRight, CircleAlert, Clock } from "lucide-react";
import Link from "next/link";
import { initials } from "@/components/layout/Sidebar";
import { DashCard } from "./DashCard";
import type { DashboardPackage as Pkg } from "./types";

// Cor + ícone + texto: o estado nunca depende só da cor
function status(p: Pkg) {
  if (p.daysLeft < 0)
    return {
      key: "expired",
      text: `Venceu há ${-p.daysLeft} ${p.daysLeft === -1 ? "dia" : "dias"}`,
      icon: CircleAlert,
      cls: "bg-red-500/10 text-red-700 dark:text-red-300",
    };
  if (p.used >= p.total)
    return {
      key: "depleted",
      text: "Sem créditos",
      icon: Ban,
      cls: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    };
  return {
    key: "expiring",
    text: p.daysLeft <= 1 ? "Vence amanhã" : `Vence em ${p.daysLeft} dias`,
    icon: Clock,
    cls: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  };
}

export function ExpiringPackages({ packages, className }: { packages: Pkg[]; className?: string }) {
  const counts = packages.map(status).reduce<Record<string, number>>((acc, s) => {
    acc[s.key] = (acc[s.key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <DashCard
      title="Pacotes pedindo atenção"
      subtitle={`${counts.expired ?? 0} vencidos · ${counts.depleted ?? 0} sem créditos · ${counts.expiring ?? 0} vencendo`}
      className={className}
    >
      {packages.length === 0 && (
        <p className="py-6 text-center text-sm text-[var(--mv-text-soft)]">
          Nenhum pacote pedindo atenção.
        </p>
      )}
      <ul className="-mx-1 divide-y divide-[var(--mv-line)]">
        {packages.map((p) => {
          const s = status(p);
          const left = p.total - p.used;
          return (
            <li key={p.student}>
              <Link
                href={`/alunos?pacotes=${p.studentId}`}
                aria-label={`Ver pacotes de ${p.student}`}
                className="group flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-1 py-3 transition-colors hover:bg-[var(--mv-brand-50)] sm:px-2"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--mv-brand-100)] text-xs font-bold text-[var(--mv-brand-700)]">
                  {initials(p.student)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[var(--mv-text)]">{p.student}</p>
                  <p className="truncate text-sm text-[var(--mv-text-soft)]">
                    {p.plan} · {left} de {p.total} {p.total === 1 ? "crédito" : "créditos"}
                  </p>
                  <span
                    className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}
                  >
                    <s.icon className="h-3.5 w-3.5" aria-hidden />
                    {s.text}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--mv-text-soft)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </DashCard>
  );
}
