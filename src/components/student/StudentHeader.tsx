"use client";

import Image from "next/image";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { useStudentAcademy } from "@/hooks/useStudentAcademy";
import { useStudentCredits } from "@/hooks/useStudentCredits";

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

const R = 26;
const C = 2 * Math.PI * R;

/** Saudação + anel de créditos (arco = livres, trilho = reservadas na agenda fixa). */
export function StudentHeader() {
  const { student } = useStudentAuth();
  const { data } = useStudentCredits();
  const { data: academy } = useStudentAcademy();

  const firstName = student?.name?.split(" ")[0] ?? "";
  const free = data?.free ?? 0;
  const reserved = data?.reserved ?? 0;
  const balance = data?.balance ?? 0;
  const warn = !!data && free === 0; // sem crédito livre: âmbar (atenção)
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());

  return (
    <header className="mb-5">
      {/* celular: academia no topo (no desktop ela fica na barra de cima) */}
      <div className="mb-4 flex items-center gap-2.5 lg:hidden">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white shadow-sm ring-1 ring-black/5">
          <Image src="/MovenLogo.png" alt="" width={32} height={32} className="scale-[1.35]" />
        </span>
        <span className="truncate text-lg font-bold tracking-tight text-[var(--mv-text)]">
          {academy?.name}
        </span>
      </div>

      <div className="flex items-end justify-between gap-4">
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

        <div
          role="img"
          aria-label={`${free} ${free === 1 ? "crédito livre" : "créditos livres"}${reserved ? `, ${reserved} reservados na agenda fixa` : ""}`}
          className="flex flex-shrink-0 flex-col items-center"
        >
          <span className="relative h-16 w-16">
            <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={R}
                fill="none"
                strokeWidth="6"
                className={
                  warn
                    ? "stroke-amber-500/30"
                    : balance
                      ? "stroke-[var(--mv-brand)]/35"
                      : "stroke-[var(--mv-line)]"
                }
              />
              {free > 0 && (
                <circle
                  cx="32"
                  cy="32"
                  r={R}
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(free / balance) * C} ${C}`}
                  className="stroke-[var(--mv-brand)]"
                />
              )}
            </svg>
            <span
              className={`absolute inset-0 flex items-center justify-center text-2xl font-bold tabular-nums ${
                warn ? "text-amber-600 dark:text-amber-400" : "text-[var(--mv-text)]"
              }`}
            >
              {free}
            </span>
          </span>
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--mv-text-soft)]">
            {free === 1 ? "livre" : "livres"}
          </span>
        </div>
      </div>

      {/* legenda do anel: só quando há reserva ou falta crédito */}
      {(reserved > 0 || warn) && (
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium tabular-nums text-[var(--mv-text-soft)]">
          {reserved > 0 && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--mv-brand)]" /> {free}{" "}
                {free === 1 ? "livre" : "livres"}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--mv-brand)]/35" /> {reserved}{" "}
                {reserved === 1 ? "reservada" : "reservadas"} na agenda fixa
                {data?.coveredUntil && ` · até ${ddmm(data.coveredUntil)}`}
              </span>
            </>
          )}
          {warn && (
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              {balance ? "Renove para agendar mais" : "Sem créditos · fale com a recepção"}
            </span>
          )}
        </p>
      )}
    </header>
  );
}
