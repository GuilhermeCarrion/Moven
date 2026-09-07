import { AppointmentSchema } from "@/schemas/appointment.schema";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { ClassSessionRepository } from "../repositories/ClassSessionRepository";
import { AppError } from "@/lib/errors";
import { StudentRepository } from "../repositories/StudentRepository";
import { StudentPackageRepository } from "../repositories/StudentPackageRepository";
import { AttendanceStatus, JobType } from "@prisma/client";
import { JobService } from "./JobService";

const appointmentRepository = new AppointmentRepository();
const sessionRepository = new ClassSessionRepository();
const studentRepository = new StudentRepository();
const packageRepository = new StudentPackageRepository();
const jobService = new JobService();

const CANCEL_WINDOW_HOURS = 2; // Cancelar com <2hrs não estorna
const ATTENDANCE_WINDOW_MIN = 30; // Presença só na janela aproximadamente 30min

export class AppointmentService {
  async listBySession(classSessionId: string, academyId: string) {
    return await appointmentRepository.findAllBySession(
      classSessionId,
      academyId,
    );
  }

  async create(data: AppointmentSchema, academyId: string) {
    // Validação de aula - Existe e aberta
    const session = await sessionRepository.findById(
      data.classSessionId,
      academyId,
    );

    if (!session) throw new AppError("Aula não encontrada", 404);
    if (session.status !== "OPEN")
      throw new AppError("Esta aula não está aberta para agendamentos", 409);

    // Validação de aluno - Existe e Ativo
    const student = await studentRepository.findById(data.studentId, academyId);

    if (!student) throw new AppError("Aluno não encontrado", 404);
    if (!student.active)
      throw new AppError("Aluno inativo não pode ser agendado", 409);

    // Validação de capacidade
    if (session._count.appointments >= session.capacity)
      throw new AppError("Esta aula já atingiu a capacidade máxima", 409);

    // Validação de aluno já agendado
    const duplicate = await appointmentRepository.findActiveDuplicate(
      data.studentId,
      data.classSessionId,
    );

    if (duplicate)
      throw new AppError("Aluno já está agendado para essa aula", 409);

    // Marca vencidos antes de procurar um pacote valido
    await packageRepository.expireStale(academyId);

    const pkg = await packageRepository.findActiveForBooking(
      data.studentId,
      academyId,
    );
    if (!pkg)
      throw new AppError(
        "Aluno não possui um pacote ativo com créditos disponíveis",
        409,
      );

    const appointment = await appointmentRepository.createWithDebit({
      academyId,
      studentId: data.studentId,
      classSessionId: data.classSessionId,
      studentPackageId: pkg.id,
    });

    try {
      const twelveHoursBefore = new Date(
        session.startAt.getTime() - 12 * 60 * 60 * 1000,
      );
      await jobService.enqueue({
        academyId,
        type: JobType.PRESENCE_CONFIRMATION,
        relatedId: appointment.id,
        payload: {
          to: "55" + student.phone,
          studentName: student.name,
          time: session.startAt.toLocaleString("pt-BR"),
        },
        scheduledFor: twelveHoursBefore,
      });
    } catch (e) {
      console.error("Falha ao enfileirar confirmação:", e);
    }

    return appointment;
  }

  async confirm(id: string, academyId: string) {
    const appt = await appointmentRepository.findById(id, academyId);
    if (!appt) throw new AppError("Agendamento não encontrado", 404);

    if (appt.status === "CANCELLED")
      throw new AppError("Agendemento cancelado não pode ser confirmado", 409);

    return await appointmentRepository.confirm(id);
  }

  async cancel(id: string, academyId: string) {
    const appt = await appointmentRepository.findById(id, academyId);
    if (!appt) throw new AppError("Agendamento não encontrado", 404);

    if (appt.status === "CANCELLED")
      throw new AppError("Agendemento cancelado não pode ser confirmado", 409);

    // Verifica se crédito foi debitado
    const creditWasDebited =
      !!appt.studentPackageId &&
      (appt.status === "BOOKED" || appt.status === "CONFIRMED");

    // Valida hora para inicio
    const hoursUntilStart =
      (appt.classSession.startAt.getTime() - Date.now()) / 3_600_000;

    // Verifica se vai fazer o "estorno" ou não
    const shouldRefound =
      creditWasDebited && hoursUntilStart >= CANCEL_WINDOW_HOURS;

    // Retorna resultado de todas as validações
    return await appointmentRepository.cancel(
      id,
      shouldRefound ? appt.studentPackageId : null,
    );
  }

  async reschedule(id: string, targetSessionId: string, academyId: string) {
    const old = await appointmentRepository.findById(id, academyId);
    if (!old) throw new AppError("Agendamento não encontrado", 404);
    if (old.status === "CANCELLED" || old.status === "RESCHEDULED")
      throw new AppError("Este agendamento não pode ser remarcado", 409);

    const target = await sessionRepository.findById(targetSessionId, academyId);
    if (!target) throw new AppError("Aula de destino não encontrada", 404);
    if (target.status !== "OPEN")
      throw new AppError("Aula de destino não está aberta", 409);

    if (target._count.appointments >= target.capacity)
      throw new AppError(
        "A aula de destino já atingiu a capacidade máxima",
        409,
      );

    const duplicate = await appointmentRepository.findActiveDuplicate(
      old.studentId,
      targetSessionId,
    );
    if (duplicate)
      throw new AppError("Aluno já está agendado para a aula de destino", 409);

    // Remarcar NÃO consome novo crédito - carrega o mesmo pacote
    return await appointmentRepository.reschedule(id, {
      academyId,
      studentId: old.studentId,
      classSessionId: targetSessionId,
      studentPackageId: old.studentPackageId,
    });
  }

  async setAttendance(
    id: string,
    attendance: AttendanceStatus,
    academyId: string,
    userId: string,
  ) {
    const appt = await appointmentRepository.findById(id, academyId);
    if (!appt) throw new AppError("Agendamento não encontrado", 404);

    if (appt.status === "CANCELLED" || appt.status === "RESCHEDULED")
      throw new AppError("Agendemento não está ativo", 409);

    const start = appt.classSession.startAt.getTime();
    const windowStart = start - ATTENDANCE_WINDOW_MIN * 60_000;
    const windowEnd =
      start +
      appt.classSession.durationMin * 60_000 +
      ATTENDANCE_WINDOW_MIN * 60_000;
    const now = Date.now();

    // Só permite registrar presença durante horario da aula
    if (now < windowStart || now > windowEnd)
      throw new AppError(
        "Presença só pode ser registrada na janela da aula (30min)",
        409,
      );

    return await appointmentRepository.setAttendance(id, attendance, userId);
  }
}
