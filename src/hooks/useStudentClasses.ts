"use client";

import { apiPublic } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface StudentClass {
  id: string;
  name: string;
  startAt: string;
  durationMin: number;
  capacity: number;
  booked: number;
  professorName: string | null;
  status: string;
  myAppointment: { id: string; status: "BOOKED" | "CONFIRMED" } | null;
}

const KEY = "student-classes";

export function useStudentClasses(range: { from: string; to: string }) {
  return useQuery({
    queryKey: [KEY, range.from, range.to],
    queryFn: async () =>
      (
        await apiPublic.get<StudentClass[]>("/student/classes", {
          params: { from: range.from, to: range.to },
        })
      ).data,
  });
}

export function useBookClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (classSessionId: string) =>
      apiPublic.post("/student/appointments", { classSessionId }),
    onSuccess: () => {
      (qc.invalidateQueries({ queryKey: [KEY] }),
        qc.invalidateQueries({ queryKey: ["my-appointments"] }),
        qc.invalidateQueries({ queryKey: ["student-credits"] }),
        qc.invalidateQueries({ queryKey: ["student-history"] }));
    },
  });
}

export function useAppointmentAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "confirm" | "cancel";
    }) => apiPublic.patch(`/student/appointments/${id}`, { action }),
    onSuccess: () => {
      (qc.invalidateQueries({ queryKey: [KEY] }),
        qc.invalidateQueries({ queryKey: ["my-appointments"] }),
        qc.invalidateQueries({ queryKey: ["student-credits"] }),
        qc.invalidateQueries({ queryKey: ["student-history"] }));
    },
  });
}
