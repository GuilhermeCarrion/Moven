"use client";

import { CalendarDays, ClipboardList, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const studentTabs = [
  { label: "Aulas", href: "/aluno/aulas", icon: CalendarDays },
  { label: "Minhas aulas", href: "/aluno/minhas-aulas", icon: ClipboardList },
  { label: "Perfil", href: "/aluno/perfil", icon: User },
];

/** Barra flutuante do celular (mesmo vidro da barra do painel). */
export function StudentBottomNav() {
  const pathName = usePathname();
  const isActive = (href: string) =>
    pathName === href || pathName.startsWith(href + "/");

  return (
    <nav className="mv-glass fixed inset-x-2 bottom-2 z-30 flex items-stretch rounded-[22px] pb-[env(safe-area-inset-bottom)] lg:hidden">
      {studentTabs.map((t) => {
        const active = isActive(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs ${
              active ? "font-semibold text-[var(--mv-brand-700)]" : "text-[var(--mv-text-soft)]"
            }`}
          >
            {active && <span className="absolute top-0 h-1 w-8 rounded-b-full bg-[var(--mv-brand)]" />}
            <t.icon className="h-[22px] w-[22px]" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
