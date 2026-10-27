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

/** Saudação + saldo de créditos (o bloco sólido da marca no portal). */
export function StudentHeader() {
  const { student } = useStudentAuth();
  const { data } = useStudentCredits();

  const firstName = student?.name?.split(" ")[0] ?? "";
  const credits = data?.credits ?? 0;
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());

  return (
    <header className="mb-5 flex items-end justify-between gap-3">
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

      {/* Créditos em formato de ingresso: ícone | picote | saldo */}
      <div
        className={`flex flex-shrink-0 items-stretch overflow-hidden rounded-2xl text-white shadow-[0_14px_30px_-16px_var(--mv-brand)] ${
          credits > 0
            ? "bg-[linear-gradient(135deg,var(--mv-brand),color-mix(in_oklch,var(--mv-brand)_72%,black))]"
            : "bg-[linear-gradient(135deg,#f59e0b,#d97706)]"
        }`}
        aria-label={`${credits} ${credits === 1 ? "crédito" : "créditos"} disponíveis`}
      >
        <span className="flex items-center border-r-2 border-dashed border-white/35 px-3">
          <Ticket className="h-5 w-5" />
        </span>
        <span className="px-3.5 py-2 leading-none">
          <span className="block text-2xl font-bold tabular-nums">{credits}</span>
          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-white/80">
            {credits === 1 ? "crédito" : "créditos"}
          </span>
        </span>
      </div>
    </header>
  );
}
