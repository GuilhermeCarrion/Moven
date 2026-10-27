"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MovenLogo } from "@/components/layout/MovenLogo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { studentTabs } from "./StudentBottomNav";

/** Barra de vidro do desktop; no celular a navegação é a barra de baixo. */
export function StudentTopNav() {
  const pathname = usePathname();
  const { signOut } = useStudentAuth();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="mv-glass fixed inset-x-3 top-3 z-30 mx-auto hidden h-16 max-w-4xl items-center justify-between rounded-[22px] px-4 lg:flex">
      <MovenLogo />

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
