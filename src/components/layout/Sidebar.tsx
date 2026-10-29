"use client";

import {
  Calendar,
  ChevronLeft,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloudField } from "@/components/landing/CloudField";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  user: any;
}

export const VERSION = "v1.0.2";

const navItems = [
  { label: "Início", href: "/dashboard", icon: LayoutDashboard },
  { label: "Alunos", href: "/alunos", icon: Users },
  { label: "Professores", href: "/professores", icon: GraduationCap },
  { label: "Planos", href: "/planos", icon: ClipboardList },
  { label: "Agendamentos", href: "/agendamentos", icon: Calendar },
  { label: "Mensagens", href: "/mensagens", icon: MessageSquare },
  {
    label: "Usuários",
    href: "/usuarios",
    icon: ShieldCheck,
    roles: ["ADMIN", "GESTOR"],
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    role: ["ADMIN", "GESTOR"],
  },
];

export const roleLabel = (r?: string) =>
  r === "ADMIN"
    ? "Administrador"
    : r === "GESTOR"
      ? "Gestor"
      : r === "PROFESSOR"
        ? "Professor"
        : "";

export const initials = (name?: string) =>
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
  const academy = user?.academy?.name || "Minha academia";

  return (
    <aside
      className={`mv-glass m-3 mr-2 flex h-[calc(100vh-24px)] flex-col overflow-hidden rounded-[24px] transition-[width] duration-300 ${
        isCollapsed ? "w-[76px]" : "w-64"
      }`}
    >
      {/* Academia + recolher */}
      <div className="flex h-[72px] items-center gap-3 px-4">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--mv-brand)] text-xs font-extrabold text-white shadow-[0_8px_18px_-8px_var(--mv-brand)]">
          {initials(academy)}
        </span>
        {!isCollapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-[var(--mv-text)]">{academy}</p>
              <p className="mv-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mv-text-soft)]">
                Painel
              </p>
            </div>
            <button
              onClick={onToggle}
              aria-label="Recolher menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--mv-text-soft)] transition-colors hover:bg-[var(--mv-brand-50)] hover:text-[var(--mv-text)]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {isCollapsed && (
        <button
          onClick={onToggle}
          aria-label="Expandir menu"
          className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--mv-text-soft)] transition-colors hover:bg-[var(--mv-brand-50)]"
        >
          <ChevronLeft className="h-5 w-5 rotate-180" />
        </button>
      )}

      {/* Área do menu: as nuvens sobem da base (logo acima do usuário) e somem no topo */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent)]"
          style={{ "--mv-ambient-alpha": 0.55 } as React.CSSProperties}
        >
          <CloudField ambient spotlight={false} />
        </div>

        <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {!isCollapsed && (
            <div className="flex items-center justify-between pb-1 pl-3">
              <p className="mv-mono text-[10px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)]">
                Menu
              </p>
              <ThemeToggle className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--mv-text-soft)] transition-colors hover:bg-[var(--mv-brand-50)] hover:text-[var(--mv-text)]" />
            </div>
          )}
          {navItems
            .filter((item) => !item.roles || item.roles.includes(user?.role))
            .map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors ${
                    isCollapsed ? "justify-center" : ""
                  } ${
                    active
                      ? "bg-[var(--mv-brand-100)] font-semibold text-[var(--mv-brand-700)]"
                      : "text-[var(--mv-text-soft)] hover:bg-[var(--mv-brand-50)] hover:text-[var(--mv-text)]"
                  }`}
                >
                  {active && (
                    <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[var(--mv-brand)]" />
                  )}
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
        </nav>
      </div>

      {/* Usuário: embutido na sidebar. A área inteira leva ao perfil; sair e versão ficam aqui. */}
      <div className="border-t border-[var(--mv-line)] bg-[var(--mv-surface)]/60 p-3">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/perfil"
              title={`${user?.name ?? "Usuário"} · Meu perfil`}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[var(--mv-brand)] text-xs font-bold text-white ring-4 ring-[var(--mv-brand-100)] transition-transform hover:scale-105"
            >
              {initials(user?.name)}
            </Link>
            <ThemeToggle className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--mv-text-soft)] transition-colors hover:bg-[var(--mv-brand-50)] hover:text-[var(--mv-text)]" />
            <button
              onClick={onLogout}
              title="Sair"
              aria-label="Sair"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--mv-text-soft)] transition-colors hover:bg-red-500/10 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Link
              href="/perfil"
              title="Meu perfil"
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[var(--mv-brand-50)]"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[var(--mv-brand)] text-sm font-bold text-white ring-4 ring-[var(--mv-brand-100)]">
                {initials(user?.name)}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-[var(--mv-text)]">
                  {user?.name || "Usuário"}
                </span>
                <span className="mv-mono block text-[10px] uppercase tracking-[0.16em] text-[var(--mv-brand-700)]">
                  {roleLabel(user?.role)}
                </span>
                <span className="mv-mono block text-[10px] text-[var(--mv-text-soft)]">
                  Moven {VERSION}
                </span>
              </span>
            </Link>
            <button
              onClick={onLogout}
              title="Sair"
              aria-label="Sair"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[var(--mv-text-soft)] transition-colors hover:bg-red-500/10 hover:text-red-600"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
