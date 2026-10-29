import type { DashboardData } from "@/components/dashboard/types";

// Dados fictícios da prévia da dashboard na landing (o painel usa a API)
export const dashboardData: DashboardData = {
  revenue: {
    month: 12480,
    previousMonth: 10950,
    packagesSold: 37,
    byMonth: [
      { label: "Mai", value: 8900 },
      { label: "Jun", value: 9650 },
      { label: "Jul", value: 11200 },
      { label: "Ago", value: 10300 },
      { label: "Set", value: 10950 },
      { label: "Out", value: 12480 },
    ],
  },
  activeStudents: { total: 248, newThisMonth: 12 },
  today: [
    { time: "07:00", name: "Funcional", professor: "Rafa", booked: 12, capacity: 12, confirmed: 12, state: "done" },
    { time: "09:30", name: "Pilates", professor: "Marina", booked: 7, capacity: 10, confirmed: 6, state: "done" },
    { time: "12:00", name: "Funcional", professor: "Rafa", booked: 9, capacity: 12, confirmed: 8, state: "now" },
    { time: "18:00", name: "Muay Thai", professor: "Diego", booked: 15, capacity: 16, confirmed: 11, state: "later" },
    { time: "19:00", name: "Dança", professor: "Júlia", booked: 20, capacity: 20, confirmed: 14, state: "later" },
    { time: "20:00", name: "Jiu-jitsu", professor: "Diego", booked: 8, capacity: 16, confirmed: 3, state: "later" },
  ],
  packages: [
    { studentId: "mock-1", student: "Carla Dias", plan: "Mensal 16 aulas", used: 11, total: 16, daysLeft: -2 },
    { studentId: "mock-2", student: "Rui Nunes", plan: "Pacote 4 aulas", used: 2, total: 4, daysLeft: -5 },
    { studentId: "mock-3", student: "João Lima", plan: "Pacote 12 aulas", used: 12, total: 12, daysLeft: 9 },
    { studentId: "mock-4", student: "Lia Moura", plan: "Pacote 8 aulas", used: 8, total: 8, daysLeft: 14 },
    { studentId: "mock-5", student: "Pedro Alves", plan: "Aula avulsa", used: 0, total: 1, daysLeft: 1 },
    { studentId: "mock-6", student: "Bia Costa", plan: "Pacote 8 aulas", used: 6, total: 8, daysLeft: 3 },
  ],
  dispatches: [
    { at: "12:04", type: "PRESENCE_CONFIRMATION", to: "Ana Souza", status: "SENT" },
    { at: "11:58", type: "WELCOME", to: "Iris Prado", status: "SENT" },
    { at: "11:30", type: "PRESENCE_CONFIRMATION", to: "Pedro Alves", status: "FAILED", error: "Número sem WhatsApp" },
    { at: "10:00", type: "PLAN_EXPIRY", to: "Bia Costa", status: "SENT" },
    { at: "09:12", type: "PRESENCE_CONFIRMATION", to: "Júlia Reis", status: "SENT" },
    { at: "06:00", type: "PRESENCE_CONFIRMATION", to: "Nina Prates", status: "PENDING", scheduledFor: "18:00" },
  ],
};
