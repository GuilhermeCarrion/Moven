"use client";

import { useAuth } from "@/contexts/AuthContext";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import type { DashboardData } from "@/components/dashboard/types";

// shortcut: tudo zerado até ligar no GET /api/dashboard (formato em components/dashboard/types.ts)
const empty: DashboardData = {
  revenue: { month: 0, previousMonth: 0, packagesSold: 0, byMonth: [] },
  activeStudents: { total: 0, newThisMonth: 0 },
  today: [],
  packages: [],
  dispatches: [],
};

export default function DashboardPage() {
  const { user } = useAuth();

  const now = new Date();
  const hour = now.getHours();

  return (
    <DashboardOverview
      data={empty}
      nowMin={hour * 60 + now.getMinutes()}
      greeting={hour < 12 ? "Bom dia," : hour < 18 ? "Boa tarde," : "Boa noite,"}
      name={user?.name?.split(" ")[0] ?? ""}
      dateLabel={new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(now)}
    />
  );
}
