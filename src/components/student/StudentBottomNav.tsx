"use client";

import { CalendarDays, ClipboardList, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Aulas", href: "/aluno/aulas", icon: CalendarDays },
  { label: "Minhas Aulas", href: "/aluno/minhas-aulas", icon: ClipboardList },
  { label: "Perfil", href: "/aluno/perfil", icon: User },
];

export function StudentBottomNav() {
  const pathName = usePathname();
  const isActive = (href: string) =>
    pathName === href || pathName.startsWith(href + "/");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-white/60 bg-white/70 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      {tabs.map((t) => {
        const active = isActive(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] ${active ? "font-semibold text-cyan-700" : "text-slate-500"}`}
          >
            <t.icon className="h-5 w-5" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
