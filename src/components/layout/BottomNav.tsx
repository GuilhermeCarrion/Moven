"use client";

import { CloudField } from "@/components/landing/CloudField";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  ShieldCheck,
  Users,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { initials, roleLabel, VERSION } from "./Sidebar";

const primary = [
  { label: "Início", href: "/dashboard", icon: LayoutDashboard },
  { label: "Alunos", href: "/alunos", icon: Users },
  { label: "Agenda", href: "/agendamentos", icon: Calendar },
  { label: "Mensagens", href: "/mensagens", icon: MessageSquare },
];

const extra = [
  { label: "Professores", href: "/professores", icon: GraduationCap },
  { label: "Planos", href: "/planos", icon: ClipboardList },
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
    roles: ["ADMIN", "GESTOR"],
  },
];

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

  // Esc fecha a gaveta
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMoreOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const tab = (active: boolean) =>
    `relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] ${
      active
        ? "font-semibold text-[var(--mv-brand-700)]"
        : "text-[var(--mv-text-soft)]"
    }`;

  return (
    <>
      {/* Gaveta "Mais": a sidebar do celular (menu em blocos, nuvens subindo e o usuário embaixo) */}
      {moreOpen && (
        <>
          <div
            className="animate-in fade-in-0 fixed inset-0 z-40 bg-[rgb(11_21_48/0.22)] backdrop-blur-[2px] duration-200 lg:hidden"
            onClick={() => setMoreOpen(false)}
          />
          {/* abre logo acima da barra, que continua visível (o "Mais" vira "X") */}
          <div
            role="dialog"
            aria-label="Mais opções"
            className="animate-in fade-in-0 slide-in-from-bottom-4 fixed inset-x-2 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 overflow-hidden rounded-[28px] border border-[var(--mv-glass-line)] bg-[var(--mv-surface)]/80 shadow-[inset_0_1px_0_var(--mv-glass-hi),0_30px_60px_-20px_var(--mv-glass-shadow)] backdrop-blur-2xl backdrop-saturate-150 duration-200 lg:hidden"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_75%)]"
              style={{ "--mv-ambient-alpha": 0.5 } as React.CSSProperties}
            >
              <CloudField ambient spotlight={false} />
            </div>

            <div className="relative p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="mv-mono pl-1 text-[10px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)]">
                  Menu
                </p>
                <ThemeToggle className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--mv-text-soft)] transition-colors hover:bg-[var(--mv-brand-50)] hover:text-[var(--mv-text)]" />
              </div>

              {/* blocos de 3 por linha: novas opções entram sem mudar o desenho */}
              <div className="grid grid-cols-3 gap-2">
                {extra
                  .filter((e) => !e.roles || e.roles.includes(user?.role))
                  .map((e) => {
                    const active = isActive(e.href);
                    return (
                      <Link
                        key={e.href}
                        href={e.href}
                        onClick={() => setMoreOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`mv-glass flex aspect-[5/4] flex-col items-center justify-center gap-1.5 rounded-2xl text-sm transition-transform active:scale-[0.97] ${
                          active
                            ? "font-semibold text-[var(--mv-brand-700)] ring-2 ring-[var(--mv-brand)]"
                            : "font-medium text-[var(--mv-text)]"
                        }`}
                      >
                        <e.icon className="h-6 w-6 text-[var(--mv-brand-700)]" />
                        {e.label}
                      </Link>
                    );
                  })}
              </div>

              {/* Usuário embaixo, sobre a base das nuvens (como na sidebar) */}
              <div className="mt-16 flex items-center gap-2 rounded-2xl border border-[var(--mv-line)] bg-[var(--mv-surface)]/70 p-2">
                <Link
                  href="/perfil"
                  onClick={() => setMoreOpen(false)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-[var(--mv-brand-50)]"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[var(--mv-brand)] text-sm font-bold text-white ring-4 ring-[var(--mv-brand)]/15">
                    {initials(user?.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-[var(--mv-text)]">
                      {user?.name || "Usuário"}
                    </span>
                    <span className="mv-mono block text-[10px] uppercase tracking-[0.14em] text-[var(--mv-brand-700)]">
                      {roleLabel(user?.role)}
                    </span>
                    <span className="mv-mono block text-[10px] text-[var(--mv-text-soft)]">
                      Moven {VERSION}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--mv-text-soft)]" />
                </Link>
                <button
                  onClick={onLogout}
                  aria-label="Sair"
                  title="Sair"
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-300"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Barra inferior (acima do escurecimento quando a gaveta está aberta) */}
      <nav
        className={`mv-glass fixed inset-x-2 bottom-2 flex items-stretch rounded-[22px] pb-[env(safe-area-inset-bottom)] lg:hidden ${
          moreOpen ? "z-50" : "z-30"
        }`}
      >
        {primary.map((p) => {
          const active = isActive(p.href);
          return (
            <Link
              key={p.href}
              href={p.href}
              onClick={() => setMoreOpen(false)}
              aria-current={active ? "page" : undefined}
              className={tab(active)}
            >
              {active && (
                <span className="absolute top-0 h-1 w-8 rounded-b-full bg-[var(--mv-brand)]" />
              )}
              <p.icon className="h-5 w-5" />
              {p.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className={tab(moreOpen)}
        >
          {moreOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <MoreHorizontal className="h-5 w-5" />
          )}
          {moreOpen ? "Fechar" : "Mais"}
        </button>
      </nav>
    </>
  );
}
