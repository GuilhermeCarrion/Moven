"use client";

import {
  Calendar,
  ChevronLeft,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  user: any;
}

const VERSION = "v1.0.2";

const navItems = [
  { label: "Início", href: "/dashboard", icon: LayoutDashboard },
  { label: "Alunos", href: "/alunos", icon: Users },
  { label: "Professores", href: "/professores", icon: GraduationCap },
  { label: "Planos", href: "/planos", icon: ClipboardList },
  { label: "Agendamentos", href: "/agendamentos", icon: Calendar },
  { label: "Mensagens", href: "/mensagens", icon: MessageSquare },
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

export function Sidebar({
  isCollapsed,
  onToggle,
  onLogout,
  user,
}: SidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`flex h-screen flex-col border-r border-white/50 bg-white/50 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Branding + toggle */}
      <div className="flex h-16 items-center justify-between px-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-[11px] font-extrabold text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--brand-cyan) 50%, var(--brand-yellow) 50%)",
            }}
          >
            FB
          </div>
          {!isCollapsed && (
            <span className="truncate text-base font-bold text-slate-800">
              {user?.academy?.name || "Fly Bungee"}
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={onToggle}
            className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-white/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mb-2 rounded-lg p-1 text-slate-500 transition-colors hover:bg-white/50"
        >
          <ChevronLeft className="h-5 w-5 rotate-180" />
        </button>
      )}

      {/* Navegação */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl p-3 text-sm transition-colors ${
                active
                  ? "bg-[var(--brand-cyan)]/15 font-semibold text-cyan-700 shadow-sm"
                  : "text-slate-500 hover:bg-white/40"
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Card do usuário */}
      <div className="relative p-3">
        <div className="relative rounded-2xl border border-white/60 bg-white/30 p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white/70"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand-cyan), #0aa8cf)",
              }}
              title={isCollapsed ? user?.name : undefined}
            >
              {initials(user?.name)}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-800">
                  {user?.name || "Usuário"}
                </div>
                <span className="mt-0.5 inline-block rounded-full bg-[var(--brand-yellow)]/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  {roleLabel(user?.role)}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed ? (
            <div className="mt-3 flex items-center justify-between border-t border-white/60 pt-2.5">
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5" /> Sair
              </button>
              <span className="rounded-full bg-[var(--brand-yellow)]/25 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                {VERSION}
              </span>
            </div>
          ) : (
            <button
              onClick={onLogout}
              title="Sair"
              className="mt-2 flex w-full justify-center rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
