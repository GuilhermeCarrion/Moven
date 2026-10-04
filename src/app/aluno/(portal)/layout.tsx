"use client";

import { ProtectedStudentRoute } from "@/components/student/ProtectedStudentRoute";
import { StudentBottomNav } from "@/components/student/StudentBottomNav";
import { StudentTopNav } from "@/components/student/StudentTopNav";
import { BlobField } from "@/components/layout/BlobField";
import { StudentHeader } from "@/components/student/StudentHeader";

const CANVAS_BG =
  "linear-gradient(160deg, oklch(0.95 0.015 255), oklch(0.97 0.01 300) 45%, oklch(0.96 0.012 258))";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedStudentRoute>
      <div
        className="relative min-h-screen overflow-hidden"
        style={{ background: CANVAS_BG }}
      >
        <BlobField />
        <StudentTopNav />

        <main className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 pt-6 lg:max-w-4xl lg:px-6 lg:pb-10 lg:pt-24">
          <StudentHeader />
          {children}
        </main>

        <StudentBottomNav />
      </div>
    </ProtectedStudentRoute>
  );
}
