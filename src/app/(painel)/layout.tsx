"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { BlobField } from "@/components/layout/BlobField";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const CANVAS_BG =
  "linear-gradient(160deg, oklch(0.95 0.015 255), oklch(0.97 0.01 300) 45%, oklch(0.96 0.012 258))";

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
        className="relative h-screen overflow-hidden"
        style={{ background: CANVAS_BG }}
      >
        <BlobField />

        <div className="relative z-10 flex h-screen">
          {/* Sidebar: só desktop */}
          <div className="hidden lg:block">
            <Sidebar
              isCollapsed={isCollapsed}
              onToggle={() => setIsCollapsed((v) => !v)}
              onLogout={signOut}
              user={user}
            />
          </div>

          <main className="flex-1 overflow-y-auto p-4 pb-24 lg:p-6 lg:pb-6">
            {children}
          </main>
        </div>

        {/* Barra inferior: só mobile */}
        <BottomNav user={user} onLogout={signOut} />
      </div>
    </ProtectedRoute>
  );
}
