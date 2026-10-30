"use client";

import { CalendarDays, Users, Wallet } from "lucide-react";
import { CloudField } from "@/components/landing/CloudField";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "./DashCard";
import { DispatchLog } from "./DispatchLog";
import { ExpiringPackages } from "./ExpiringPackages";
import { NextClass } from "./NextClass";
import { TodayClasses } from "./TodayClasses";
import type { DashboardData } from "./types";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** A tela de início inteira; o painel e a prévia da landing usam a mesma. */
export function DashboardOverview({
  data: d,
  nowMin,
  greeting,
  name,
  dateLabel,
  compact = false,
}: {
  data: DashboardData;
  nowMin: number; // minutos desde a meia-noite
  greeting: string;
  name: string;
  dateLabel: string;
  compact?: boolean; // totalizadores mais baixos (prévia da landing)
}) {
  const prev = d.revenue.previousMonth;
  const revenueDelta = prev ? (d.revenue.month - prev) / prev : null;
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
          <PageHeader eyebrow={`Início · ${dateLabel}`} title={greeting} highlight={`${name}.`} />
        </div>
      </div>

      {/* Totalizadores */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <NextClass classes={d.today} nowMin={nowMin} compact={compact} />
        <KpiCard
          compact={compact}
          icon={CalendarDays}
          label="Aulas hoje"
          value={String(d.today.length)}
          meter={todayCapacity ? todayBooked / todayCapacity : 0}
          detail={`${todayBooked} de ${todayCapacity} vagas`}
        />
        <KpiCard
          compact={compact}
          icon={Users}
          label="Alunos ativos"
          value={String(d.activeStudents.total)}
          delta={{ text: `+${d.activeStudents.newThisMonth}`, up: true }}
          detail="novos no mês"
        />
        <KpiCard
          compact={compact}
          highlight
          icon={Wallet}
          label="Faturamento do mês"
          value={brl.format(d.revenue.month)}
          delta={
            revenueDelta === null
              ? undefined
              : {
                  text: `${revenueDelta >= 0 ? "+" : ""}${Math.round(revenueDelta * 100)}%`,
                  up: revenueDelta >= 0,
                }
          }
          detail={`${d.revenue.packagesSold} pacotes vendidos`}
          trend={
            d.revenue.byMonth.length
              ? d.revenue.byMonth.map((m) => ({ ...m, text: `${m.label} ${brl.format(m.value)}` }))
              : undefined
          }
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
