"use client";

import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { useStudentCredits } from "@/hooks/useStudentCredits";
import { Ticket } from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia,";
  if (h < 18) return "Boa tarde,";
  return "Boa noite,";
}

const ddmm = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

/** Saudação + créditos livres (o bloco sólido da marca no portal). */
export function StudentHeader() {
  const { student } = useStudentAuth();
  const { data } = useStudentCredits();

  const firstName = student?.name?.split(" ")[0] ?? "";
  const free = data?.free ?? 0;
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());

  return (
    <header className="mb-5">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="mv-mono text-[11px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)]">
            {today.replace(/\./g, "")}
          </p>
          <h1 className="mt-1.5 text-[28px] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--mv-text)] sm:text-4xl">
            {greeting()}
            <span className="block truncate capitalize text-[var(--mv-brand)] dark:text-[var(--mv-brand-light)]">
              {firstName}.
            </span>
          </h1>
        </div>

        {/* Créditos em formato de ingresso: ícone | picote | livres */}
        <div
          className={`flex flex-shrink-0 items-stretch overflow-hidden rounded-2xl text-white shadow-[0_14px_30px_-16px_var(--mv-brand)] ${
            free > 0
              ? "bg-[linear-gradient(135deg,var(--mv-brand),color-mix(in_oklch,var(--mv-brand)_72%,black))]"
              : "bg-[linear-gradient(135deg,#f59e0b,#d97706)]"
          }`}
          aria-label={`${free} ${free === 1 ? "crédito livre" : "créditos livres"}`}
        >
          <span className="flex items-center border-r-2 border-dashed border-white/35 px-3">
            <Ticket className="h-5 w-5" />
          </span>
          <span className="px-3.5 py-2 leading-none">
            <span className="block text-2xl font-bold tabular-nums">
              {free}
            </span>
            <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-white/80">
              {free === 1 ? "livre" : "livres"}
            </span>
          </span>
        </div>
      </div>

      {!!data?.reserved && (
        <p className="mt-3 text-xs font-medium tabular-nums text-[var(--mv-text-soft)]">
          Saldo {data.balance} · {data.reserved}{" "}
          {data.reserved === 1 ? "reservada" : "reservadas"}
          {data.coveredUntil && ` · garantidas até ${ddmm(data.coveredUntil)}`}
          {data.free === 0 && (
            <span className="text-amber-600 dark:text-amber-400">
              {" "}
              · renove para continuar
            </span>
          )}
        </p>
      )}
    </header>
  );
}
