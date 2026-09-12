"use client";

import {
  Calendar,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const primary = [
  { label: "Início", href: "/dashboard", icon: LayoutDashboard },
  { label: "Alunos", href: "/alunos", icon: Users },
  { label: "Agenda", href: "/agendamentos", icon: Calendar },
  { label: "Mensagens", href: "/mensagens", icon: MessageSquare },
];

const extra = [
  { label: "Professores", href: "/professores", icon: GraduationCap },
  { label: "Planos", href: "/planos", icon: ClipboardList },
];

const roleLabel = (r?: string) =>
  r === "ADMIN"
    ? "Administrador"
    : r === "GESTOR"
      ? "Gestor"
      : r === "PROFESSOR"
        ? "Professor"
        : "";

const initials = (name?: string) =>
  (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export function BottomNav({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Sheet "Mais" */}
      {moreOpen && (
        <>
          <div
            className="animate-in fade-in-0 fixed inset-0 z-40 bg-slate-500/10 backdrop-blur-sm duration-200 lg:hidden"
            onClick={() => setMoreOpen(false)}
          />
          <div className="animate-in slide-in-from-bottom fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/60 bg-white/80 p-5 pb-8 shadow-2xl backdrop-blur-2xl duration-300 lg:hidden">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-300" />

            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand-cyan), #0aa8cf)",
                }}
              >
                {initials(user?.name)}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  {user?.name || "Usuário"}
                </div>
                <span className="inline-block rounded-full bg-[var(--brand-yellow)]/25 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                  {roleLabel(user?.role)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {extra.map((e) => {
                const active = isActive(e.href);
                return (
                  <Link
                    key={e.href}
                    href={e.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 rounded-xl p-3 text-sm ${
                      active
                        ? "bg-[var(--brand-cyan)]/15 font-semibold text-cyan-700"
                        : "text-slate-600 hover:bg-white/50"
                    }`}
                  >
                    <e.icon className="h-5 w-5" /> {e.label}
                  </Link>
                );
              })}
            </div>

            <button
              onClick={onLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </>
      )}

      {/* Barra inferior */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-white/60 bg-white/70 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {primary.map((p) => {
          const active = isActive(p.href);
          return (
            <Link
              key={p.href}
              href={p.href}
              onClick={() => setMoreOpen(false)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] ${
                active ? "font-semibold text-cyan-700" : "text-slate-500"
              }`}
            >
              <p.icon className="h-5 w-5" />
              {p.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] ${
            moreOpen ? "font-semibold text-cyan-700" : "text-slate-500"
          }`}
        >
          {moreOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <MoreHorizontal className="h-5 w-5" />
          )}
          Mais
        </button>
      </nav>
    </>
  );
}
