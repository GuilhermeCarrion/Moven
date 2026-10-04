"use client";

import { apiPublic } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export function useStudentCredits() {
  return useQuery({
    queryKey: ["student-credits"],
    queryFn: async () =>
      (await apiPublic.get<{ credits: number }>("/student/credits")).data,
  });
}
