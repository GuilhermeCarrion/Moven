"use client";

import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { apiPublic } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

// Nome da academia do aluno logado, pela rota pública que já existe (a mesma do cadastro pelo site)
export function useStudentAcademy() {
  const { student } = useStudentAuth();
  return useQuery({
    queryKey: ["academy", student?.academyId],
    enabled: !!student?.academyId,
    staleTime: Infinity,
    queryFn: async () =>
      (
        await apiPublic.get<{ name: string }>(
          `/public/academies/${student!.academyId}`,
        )
      ).data,
  });
}
