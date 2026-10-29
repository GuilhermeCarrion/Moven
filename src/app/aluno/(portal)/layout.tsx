"use client";

import { ProtectedStudentRoute } from "@/components/student/ProtectedStudentRoute";
import { StudentBottomNav } from "@/components/student/StudentBottomNav";
import { StudentTopNav } from "@/components/student/StudentTopNav";
import { StudentHeader } from "@/components/student/StudentHeader";

// shortcut: cor fixa (azul Moven), igual ao painel; trocar pela cor da academia quando existir no banco
const ACADEMY_BRAND = "#1463ff";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedStudentRoute>
      <div
        className="mv-app mv-canvas relative min-h-svh"
        style={{ "--mv-brand": ACADEMY_BRAND } as React.CSSProperties}
      >
        <StudentTopNav />

        {/* pb-28: espaço da barra flutuante do celular */}
        <main className="relative mx-auto w-full max-w-xl px-4 pb-28 pt-5 sm:px-6 lg:max-w-2xl lg:pb-12 lg:pt-28">
          <StudentHeader />
          {children}
        </main>

        <StudentBottomNav />
      </div>
    </ProtectedStudentRoute>
  );
}
