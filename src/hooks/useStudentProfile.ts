"use client";

import { apiPublic } from "@/lib/axios";
import { StudentProfileUpdateSchema } from "@/schemas/studentProfile.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface StudentProfile {
  name: string;
  cpf: string;
  birthDate: string | null;
  phone: string;
  email: string | null;
  heightCm: number | null;
  weightKg: string;
  package: {
    planName: string;
    creditsRemaining: number;
    creditsTotal: number;
    expiresAt: string;
    status: string;
  } | null;
}

export function useStudentProfile() {
  return useQuery({
    queryKey: ["student-profile"],
    queryFn: async () =>
      (await apiPublic.get<StudentProfile>("/student/profile")).data,
  });
}

export function useUpdateStudentProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StudentProfileUpdateSchema) =>
      apiPublic.patch("/student/profile", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student-profile"] }),
  });
}
