"use client";

import { apiPublic } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface GridSlot {
  id: string;
  weekday: number; // 0 = domingo
  time: string; // "HH:MM"
  name: string;
  professor: string;
}

export function useStudentRecurrence() {
  return useQuery({
    queryKey: ["student-recurrence"],
    queryFn: async () =>
      (
        await apiPublic.get<{ slots: GridSlot[]; mine: string[] }>(
          "/student/recurrence",
        )
      ).data,
  });
}

// Salvar cria/cancela reservas: atualiza tudo que mostra reserva ou crédito
export function useSaveRecurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slotIds: string[]) =>
      apiPublic.put("/student/recurrence", { slotIds }),
    onSuccess: () =>
      Promise.all(
        [
          "student-recurrence",
          "student-classes",
          "student-credits",
          "student-history",
          "my-appointments",
        ].map((k) => qc.invalidateQueries({ queryKey: [k] })),
      ),
  });
}
