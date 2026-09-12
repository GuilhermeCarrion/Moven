export interface Student {
  id: string;
  name: string;
  phone: string;
  cpf: string;
  email: string | null;
  birthDate: string | null;
  academyId: string;
  active: boolean;
  registredAt: string;
  heightCm: number | null;
  weightKg: string; // Prisma Decimal chega como string no JSON
  createdAt: string;
  updatedAt: string;
  // pacote ativo (vem do include na listagem) - 0 ou 1 item
  studentPackages?: { creditsRemaining: number; expiresAt: string }[];
}

export interface Professor {
  id: string;
  name: string;
  phone: string;
  cpf: string;
  academyId: string;
  userId: string | null;
  active: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  academyId: string;
  name: string;
  credits: string;
  validityDays: string;
  price: string; // Decimal - chega como string no JSON
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StudentPackageStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "DEPLETED"
  | "CANCELLED";

export interface StudentPackage {
  id: string;
  academyId: string;
  studentId: string;
  planId: string;
  creditsTotal: number;
  creditsRemaining: number;
  startedAt: string;
  expiresAt: string;
  status: StudentPackageStatus;
  createdAt: string;
  updatedAt: string;
  plan?: { name: string }; // vem do include no listByStudent
}

export type AttendanceStatus = "PENDING" | "PRESENT" | "ABSENT" | "NO_SHOW";
export type AppointmentStatus =
  | "BOOKED"
  | "CONFIRMED"
  | "CANCELLED"
  | "RESCHEDULED";

export interface ClassSession {
  id: string;
  academyId: string;
  professorId: string;
  name: string;
  startAt: string;
  durationMin: number;
  capacity: number;
  minCapacity: number;
  status: "OPEN" | "CANCELLED" | "COMPLETED";
  professor?: { name: string };
  _count?: { appointments: number };
}

export interface Appointment {
  id: string;
  studentId: string;
  classSessionId: string;
  studentPackageId: string | null;
  status: AppointmentStatus;
  attendance: AttendanceStatus;
  student?: { name: string };
  createdAt: string;
}
