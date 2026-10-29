// Formato que o GET /api/dashboard deve devolver (a prévia da landing usa dados fictícios nele)
export type JobType = "PRESENCE_CONFIRMATION" | "WELCOME" | "PLAN_EXPIRY";
export type DispatchStatus = "SENT" | "FAILED" | "PENDING";

export type DashboardClass = {
  time: string; // "HH:MM"
  name: string;
  professor: string;
  booked: number;
  capacity: number;
  confirmed: number;
  state: "done" | "now" | "later";
};

// daysLeft < 0 = vencido; créditos zerados = esgotado; senão = vencendo
export type DashboardPackage = {
  studentId: string; // abre /alunos?pacotes=<id>
  student: string;
  plan: string;
  used: number;
  total: number;
  daysLeft: number;
};

export type DashboardDispatch = {
  at: string;
  type: JobType;
  to: string;
  status: DispatchStatus;
  error?: string;
  scheduledFor?: string;
};

export type DashboardData = {
  revenue: {
    month: number;
    previousMonth: number;
    packagesSold: number;
    byMonth: { label: string; value: number }[]; // o último é o mês atual
  };
  activeStudents: { total: number; newThisMonth: number };
  today: DashboardClass[];
  packages: DashboardPackage[];
  dispatches: DashboardDispatch[];
};
