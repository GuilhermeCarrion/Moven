"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { initials } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { useStudentAcademy } from "@/hooks/useStudentAcademy";
import { studentTabs } from "./StudentBottomNav";

/** Barra de vidro do desktop; no celular a navegação é a barra de baixo. */
export function StudentTopNav() {
  const pathname = usePathname();
  const { signOut } = useStudentAuth();
  const { data: academy } = useStudentAcademy();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="mv-glass fixed inset-x-3 top-3 z-30 mx-auto hidden h-16 max-w-4xl items-center justify-between rounded-[22px] px-3 lg:flex">
      {/* identidade da academia, igual ao topo da sidebar do painel */}
      <Link href="/aluno/aulas" className="flex min-w-0 items-center gap-3 rounded-xl p-1 pr-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--mv-brand)] text-sm font-bold text-white shadow-[0_8px_18px_-10px_var(--mv-brand)]">
          {academy ? initials(academy.name) : ""}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-bold text-[var(--mv-text)]">
            {academy?.name ?? " "}
          </span>
          <span className="mv-mono block text-[10px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)]">
            Portal do aluno
          </span>
        </span>
      </Link>

      <nav className="flex items-center gap-1">
        {studentTabs.map((t) => {
          const active = isActive(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-10 items-center gap-2 rounded-xl px-4 text-sm transition-colors ${
                active
                  ? "bg-[var(--mv-brand-100)] font-semibold text-[var(--mv-brand-700)]"
                  : "text-[var(--mv-text-soft)] hover:bg-[var(--mv-brand-50)] hover:text-[var(--mv-text)]"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </Link>
          );
        })}
        <span className="mx-1 h-6 w-px bg-[var(--mv-line)]" />
        <ThemeToggle className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--mv-text-soft)] transition-colors hover:bg-[var(--mv-brand-50)] hover:text-[var(--mv-text)]" />
        <button
          onClick={signOut}
          aria-label="Sair"
          title="Sair"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--mv-text-soft)] transition-colors hover:bg-red-500/10 hover:text-red-600"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </nav>
    </header>
  );
}
