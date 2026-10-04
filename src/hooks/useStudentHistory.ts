"use client";

import { apiPublic } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type EventType =
  | "BOOKED"
  | "CONFIRMED"
  | "CANCELLED"
  | "RESCHEDULED"
  | "PRESENT"
  | "ABSENT"
  | "NO_SHOW";

export interface HistoryEvent {
  type: EventType;
  actorType: "STUDENT" | "STAFF" | "SYSTEM";
  creditRefunded: boolean | null;
  note: string | null;
  createdAt: string;
}

export interface ClassHistory {
  classSessionId: string;
  className: string;
  startAt: string;
  activeAppointment: {
    id: string;
    status: "BOOKED" | "CONFIRMED";
    confirmationSentAt: string | null;
  } | null;
  events: HistoryEvent[];
}

export function useStudentHistory() {
  return useQuery({
    queryKey: ["student-history"],
    queryFn: async () =>
      (await apiPublic.get<ClassHistory[]>("/student/history")).data,
  });
}
