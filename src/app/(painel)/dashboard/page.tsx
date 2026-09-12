import { StatCard } from "@/components/dashboard/StatCard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen space-y-6">
      {/* Topo: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Alunos Ativos" value="128" icon="users" color="cyan" />
        <StatCard title="Aulas Hoje" value="6" icon="calendar" color="cyan" />
        <StatCard title="Ocupação" value="82%" icon="trending" color="cyan" />
        <StatCard title="Pendências" value="4" icon="alert" color="cyan" />
      </div>

      {/* Bento grid principal */}
      <div className="grid grid-cols-12 gap-6">
        {/* Linha operacional */}
        <div className="col-span-12 lg:col-span-8">
          {/* <NextClassCard /> */}
        </div>
        <div className="col-span-12 lg:col-span-4">
          {/* <DailySchedule /> */}
        </div>

        {/* Linha Administrativa */}
        <div className="col-span-12 lg:col-span-5">{/* <MessageLog /> */}</div>
        <div className="col-span-12 lg:col-span-7">
          {/* <FinanceChart /> */}
        </div>
      </div>
    </div>
  );
}
