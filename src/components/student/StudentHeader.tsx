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

export function StudentHeader() {
  const { student } = useStudentAuth();
  const { data } = useStudentCredits();

  const firstName = student?.name?.split(" ")[0] ?? "aluno";
  const credits = data?.credits ?? 0;

  return (
    <div className="mb-7 flex items-center justify-between gap-4">
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
          <div className="text-2xl font-extrabold text-slate-800">
            {credits}
          </div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {credits === 1 ? "crédito" : "créditos"}
          </div>
        </div>
      </div>
    </div>
  );
}
