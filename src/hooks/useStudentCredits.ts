"use client";

import { apiPublic } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface StudentCredits {
  balance: number; // créditos ainda não debitados
  reserved: number;
  free: number;
  coveredUntil: string | null;
  cancelWindowHours: number;
}

export function useStudentCredits() {
  return useQuery({
    queryKey: ["student-credits"],
    queryFn: async () =>
      (await apiPublic.get<StudentCredits>("/student/credits")).data,
  });
}
