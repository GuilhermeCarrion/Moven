import { AppError } from "@/lib/errors";
import { AcademyReposistory } from "../repositories/AcademyRepository";
import { ProfessorRepository } from "../repositories/ProfessorRepository";
import { ScheduleRepository } from "../repositories/ScheduleRepository";

const repo = new ScheduleRepository();
const academies = new AcademyReposistory();
const professors = new ProfessorRepository();

type SlotRefs = { professorId?: string; templateId?: string };

export class ScheduleService {
  // a tela inteira em uma busca
  async get(academyId: string) {
    const [settings, templates, slots] = await Promise.all([
      academies.getSettings(academyId),
      repo.listTemplates(academyId),
      repo.listSlots(academyId),
    ]);
    return {
      cancelWindowHours: settings?.cancelWindowHours ?? 4,
      templates,
      slots,
    };
  }

  async updateSettings(academyId: string, data: { cancelWindowHours: number }) {
    return await academies.updateSettings(academyId, data);
  }

  async createTemplate(
    academyId: string,
    data: {
      name: string;
      durationMin: number;
      capacity: number;
      minCapacity: number;
    },
  ) {
    if (await repo.findTemplateByName(academyId, data.name))
      throw new AppError("Já existe um template come esse nome", 409);
    return await repo.createTemplate({ ...data, academyId });
  }

  async createSlot(
    academyId: string,
    data: {
      weekday: number;
      time: string;
      professorId: string;
      templateId: string;
    },
  ) {
    await this.assertRefs(academyId, data);
    if (await repo.findSlot(academyId, data.weekday, data.time))
      throw new AppError(
        "Já existe um horário nesse dia e hora. Se ele estiver desativado reative-o na lista.",
        409,
      );
    return await repo.createSlot({ ...data, academyId });
  }

  async updateSlot(
    id: string,
    academyId: string,
    data: SlotRefs & { active?: boolean },
  ) {
    await this.assertRefs(academyId, data);
    const result = await repo.updateSlot(id, academyId, data);
    if (result.count === 0) throw new AppError("Horario não encontrado", 404);
  }

  // Professor e template vem do front: precisa ser desta academia (e o professor ativo)
  private async assertRefs(academyId: string, data: SlotRefs) {
    if (data.professorId) {
      const p = await professors.findById(data.professorId, academyId);
      if (!p || !p.active)
        throw new AppError("Professor inválido ou inativo", 409);
    }
    if (
      data.templateId &&
      !(await repo.findTemplate(data.templateId, academyId))
    )
      throw new AppError("Template não encontrado", 404);
  }
}
