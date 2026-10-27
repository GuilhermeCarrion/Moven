"use client";

import { CalendarDays, Users, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CloudField } from "@/components/landing/CloudField";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/DashCard";
import { DispatchLog } from "@/components/dashboard/DispatchLog";
import { ExpiringPackages } from "@/components/dashboard/ExpiringPackages";
import { NextClass } from "@/components/dashboard/NextClass";
import { TodayClasses } from "@/components/dashboard/TodayClasses";
import { brl, dashboardMock } from "@/components/dashboard/mock";

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export default function DashboardPage() {
  const { user } = useAuth();
  const d = dashboardMock;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bom dia," : hour < 18 ? "Boa tarde," : "Boa noite,";
  const firstName = user?.name?.split(" ")[0] ?? "";
  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  const revenueDelta = (d.revenue.month - d.revenue.previousMonth) / d.revenue.previousMonth;
  const todayBooked = sum(d.today.map((c) => c.booked));
  const todayCapacity = sum(d.today.map((c) => c.capacity));

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 sm:space-y-5">
      {/* Nuvens em blocos no canto direito do topo (mesma linguagem da sidebar); o texto à esquerda fica limpo */}
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-3 -top-3 bottom-[-28px] sm:-inset-x-5 sm:-top-5 [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_70%)]"
          style={{ "--mv-ambient-alpha": 0.5 } as React.CSSProperties}
        >
          <CloudField ambient spotlight={false} />
        </div>
        <div className="relative py-3 sm:py-6">
          <PageHeader
            eyebrow={`Início · ${dateLabel} · dados de exemplo`}
            title={greeting}
            highlight={`${firstName}.`}
          />
        </div>
      </div>

      {/* Totalizadores */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <NextClass classes={d.today} now={now} />
        <KpiCard
          icon={CalendarDays}
          label="Aulas hoje"
          value={String(d.today.length)}
          meter={todayBooked / todayCapacity}
          detail={`${todayBooked} de ${todayCapacity} vagas`}
        />
        <KpiCard
          icon={Users}
          label="Alunos ativos"
          value={String(d.activeStudents.total)}
          delta={{ text: `+${d.activeStudents.newThisMonth}`, up: true }}
          detail="novos no mês"
        />
        <KpiCard
          highlight
          icon={Wallet}
          label="Faturamento do mês"
          value={brl.format(d.revenue.month)}
          delta={{
            text: `${revenueDelta >= 0 ? "+" : ""}${Math.round(revenueDelta * 100)}%`,
            up: revenueDelta >= 0,
          }}
          detail={`${d.revenue.packagesSold} pacotes vendidos`}
          trend={d.revenue.byMonth.map((m) => ({ ...m, text: `${m.label} ${brl.format(m.value)}` }))}
        />
      </div>

      <div className="grid items-start gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ExpiringPackages packages={d.packages} />
        <TodayClasses classes={d.today} />
        <DispatchLog dispatches={d.dispatches} className="md:col-span-2 xl:col-span-1" />
      </div>
    </div>
  );
}
