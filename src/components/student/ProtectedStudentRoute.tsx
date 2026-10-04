"use client";

import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export function ProtectedStudentRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useStudentAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/aluno/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
