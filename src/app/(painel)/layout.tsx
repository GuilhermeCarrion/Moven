"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

// shortcut: cor fixa (azul Moven); trocar por academy.brandColor quando existir no banco
const ACADEMY_BRAND = "#1463ff";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <div
        className="mv-app mv-canvas relative flex h-screen overflow-hidden"
        style={{ "--mv-brand": ACADEMY_BRAND } as React.CSSProperties}
      >
        {/* Sidebar: só desktop */}
        <div className="relative hidden lg:block">
          <Sidebar
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed((v) => !v)}
            onLogout={signOut}
            user={user}
          />
        </div>

        <main className="relative flex-1 overflow-y-auto p-3 pb-28 sm:p-4 sm:pb-28 lg:p-5 lg:pl-2">
          {children}
        </main>

        {/* Barra inferior: só mobile */}
        <BottomNav user={user} onLogout={signOut} />
      </div>
    </ProtectedRoute>
  );
}
