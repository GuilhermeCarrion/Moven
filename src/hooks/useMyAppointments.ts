"use client";

import { apiPublic } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface MyAppointment {
  id: string;
  status: "BOOKED" | "CONFIRMED" | "CANCELLED";
  attendance: "PENDING" | "PRESENT" | "ABSENT" | "NO_SHOW";
  confirmationSentAt: string | null;
  className: string;
  startAt: string;
  durationMin: number;
}

export function useMyAppointments() {
  return useQuery({
    queryKey: ["my-appointments"],
    queryFn: async () =>
      (await apiPublic.get<MyAppointment[]>("/student/appointments")).data,
  });
}
