"use client";

import { CalendarDays, ClipboardList, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudentAuth } from "@/contexts/StudentAuthContext";

const tabs = [
  { label: "Aulas", href: "/aluno/aulas", icon: CalendarDays },
  { label: "Minhas Aulas", href: "/aluno/minhas-aulas", icon: ClipboardList },
  { label: "Perfil", href: "/aluno/perfil", icon: User },
];

export function StudentTopNav() {
  const pathname = usePathname();
  const { signOut } = useStudentAuth();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="fixed inset-x-0 top-0 z-30 hidden border-b border-white/60 bg-white/70 backdrop-blur-xl lg:block">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div
            className="relative flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "var(--brand-cyan)" }}
          >
            <div
              className="absolute h-1.5 w-3 rounded bg-white"
              style={{ transform: "rotate(-30deg)", top: 10, left: 6 }}
            />
            <div
              className="absolute h-1.5 w-3 rounded bg-white"
              style={{ transform: "rotate(-30deg)", bottom: 9, right: 5 }}
            />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-800">
            Moven
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {tabs.map((t) => {
            const active = isActive(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors ${
                  active
                    ? "bg-cyan-50 font-semibold text-cyan-700"
                    : "text-slate-500 hover:bg-white/60"
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </Link>
            );
          })}
          <button
            onClick={signOut}
            aria-label="Sair"
            className="ml-2 flex items-center rounded-xl px-3 py-2 text-slate-400 transition-colors hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
