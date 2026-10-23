"use client";

import { CalendarDays, ClipboardList, LayoutDashboard, Plus, Users } from "lucide-react";
import { useState } from "react";

/**
 * Demonstra a personalização por academia: a prévia só redefine --mv-brand,
 * e todos os tons derivados (.mv-themed) se recalculam sozinhos.
 */

const palettes = [
  { name: "Moven", academy: "Studio Ritmo", color: "#1463ff" },
  { name: "Verde", academy: "Arena Verde", color: "#14a44d" },
  { name: "Rosa", academy: "Bella Dança", color: "#e0287a" },
  { name: "Roxo", academy: "Kaizen Lutas", color: "#7c3aed" },
  { name: "Laranja", academy: "Fit Sol", color: "#f06418" },
];

const classes = [
  { h: "07:00", n: "Funcional", b: 9, c: 12 },
  { h: "18:00", n: "Jiu-jitsu", b: 16, c: 16 },
  { h: "19:00", n: "Zumba", b: 14, c: 20 },
];

export function ThemePreview() {
  const [active, setActive] = useState(palettes[0]);
  const initials = active.academy
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div>
        <p className="mv-mono text-xs uppercase tracking-[0.18em] text-[var(--mv-brand-light)]">
          Sua marca, suas cores
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          Depois do login, o Moven veste a camisa da sua academia.
        </h2>
        <p className="mt-5 max-w-lg text-lg leading-relaxed">
          Uma academia verde e branca usa o sistema verde e branco — a equipe no painel e o aluno
          no portal. Você escolhe a cor; o Moven cuida dos tons.
        </p>
        <div className="mt-8 flex flex-wrap gap-2.5">
          {palettes.map((p) => {
            const on = p.name === active.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setActive(p)}
                aria-pressed={on}
                className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all ${
                  on
                    ? "border-transparent bg-white text-[var(--mv-ink)] shadow-lg"
                    : "mv-glass text-white hover:-translate-y-0.5"
                }`}
              >
                <span className="h-4 w-4 rounded-full ring-2 ring-white" style={{ background: p.color }} />
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="mv-themed mv-glass-strong rounded-[28px] p-2 transition-colors"
        style={{ "--mv-brand": active.color } as React.CSSProperties}
      >
        <div className="flex overflow-hidden rounded-[22px] bg-[var(--mv-brand-50)] transition-colors duration-500">
          <aside className="flex w-14 flex-col items-center gap-2 bg-[var(--mv-brand-deep)] py-4 transition-colors duration-500 sm:w-16">
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--mv-brand)] text-[11px] font-extrabold text-white transition-colors duration-500">
              {initials}
            </span>
            {[LayoutDashboard, Users, CalendarDays, ClipboardList].map((Icon, i) => (
              <span
                key={i}
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  i === 2 ? "bg-white/15 text-white" : "text-white/55"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </aside>
          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs text-slate-500">{active.academy}</p>
                <p className="text-lg font-extrabold text-[var(--mv-ink)]">Agenda</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-xl bg-[var(--mv-brand)] px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_-8px_var(--mv-brand)] transition-colors duration-500">
                <Plus className="h-3.5 w-3.5" /> Nova aula
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {classes.map((c) => {
                const full = c.b >= c.c;
                return (
                  <div key={c.h} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                    <span className="rounded-lg bg-[var(--mv-brand-100)] px-2 py-1 text-[11px] font-bold tabular-nums text-[var(--mv-brand-700)] transition-colors duration-500">
                      {c.h}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--mv-ink)]">
                      {c.n}
                    </span>
                    <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 sm:block">
                      <div
                        className="h-full rounded-full bg-[var(--mv-brand)] transition-colors duration-500"
                        style={{ width: `${(c.b / c.c) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-[11px] font-semibold tabular-nums text-slate-500">
                      {full ? "Lotada" : `${c.b}/${c.c}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
