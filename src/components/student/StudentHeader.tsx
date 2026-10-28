"use client";

import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { useStudentCredits } from "@/hooks/useStudentCredits";
import { Ticket } from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const ddmm = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

export function StudentHeader() {
  const { student } = useStudentAuth();
  const { data } = useStudentCredits();

  const firstName = student?.name?.split(" ")[0] ?? "aluno";
  const free = data?.free ?? 0;

  return (
    <div className="mb-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{greeting()},</p>
          <h2 className="text-2xl font-extrabold capitalize leading-tight text-slate-800">
            {firstName}
          </h2>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-3.5 py-2.5 shadow-sm backdrop-blur-xl">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, var(--brand-cyan), var(--primary-focus))",
            }}
          >
            <Ticket className="h-5 w-5" />
          </div>
          <div className="pr-1 leading-none">
            <div className="text-2xl font-extrabold text-slate-800">{free}</div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {free === 1 ? "crédito livre" : "créditos livres"}
            </div>
          </div>
        </div>
      </div>

      {!!data?.reserved && (
        <p className="mt-3 text-xs font-medium text-slate-500">
          Saldo {data.balance} · {data.reserved}{" "}
          {data.reserved === 1 ? "reservada" : "reservadas"}
          {data.coveredUntil && ` · garantidas até ${ddmm(data.coveredUntil)}`}
          {data.free === 0 && (
            <span className="text-amber-600"> · renove para continuar</span>
          )}
        </p>
      )}
    </div>
  );
}
