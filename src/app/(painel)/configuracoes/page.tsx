"use client";

import { DashCard } from "@/components/dashboard/DashCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { selectCls } from "@/components/schedule/ClassSessionForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfessors } from "@/hooks/useProfessors";
import {
  useCreateSlot,
  useCreateTemplate,
  useSettings,
  useUpdateSettings,
  useUpdateSlot,
} from "@/hooks/useSettings";
import { apiError } from "@/lib/apiError";
import { Clock, Plus, Users } from "lucide-react";
import { FormEvent } from "react";
import { toast } from "sonner";

const WEEKDAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // exibe começando pela segunda

const legend =
  "mv-mono mb-3 flex w-full items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)] after:h-px after:flex-1 after:bg-[var(--mv-line)]";
const chip =
  "inline-flex items-center gap-1 rounded-full bg-[var(--mv-surface)] px-2 py-0.5 text-xs font-semibold text-[var(--mv-brand-700)]";

// Lê o formulário como objeto; os campos listados viram número
const read = (e: FormEvent<HTMLFormElement>, numbers: string[] = []) => {
  e.preventDefault();
  const data: Record<string, string | number> = Object.fromEntries(
    new FormData(e.currentTarget) as unknown as Iterable<[string, string]>,
  );
  for (const k of numbers) data[k] = Number(data[k]);
  return data;
};

const feedback = (msg: string, form?: HTMLFormElement) => ({
  onSuccess: () => {
    toast.success(msg);
    form?.reset();
  },
  onError: (e: unknown) => toast.error(apiError(e)),
});

export default function ConfiguracoesPage() {
  const { data, isLoading, error } = useSettings();
  const { data: professors } = useProfessors();
  const updateSettings = useUpdateSettings();
  const createTemplate = useCreateTemplate();
  const createSlot = useCreateSlot();
  const updateSlot = useUpdateSlot();

  if (isLoading)
    return <p className="py-8 text-center text-[var(--mv-text-soft)]">Carregando...</p>;
  if (error || !data)
    return <p className="py-8 text-center text-[var(--mv-text-soft)]">{apiError(error)}</p>;

  const patchSlot = (id: string, patch: Record<string, unknown>) =>
    updateSlot.mutate({ id, data: patch }, feedback("Horário atualizado"));

  const activeSlots = data.slots.filter((s) => s.active).length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow={`Configurações · ${activeSlots} ${activeSlots === 1 ? "horário fixo" : "horários fixos"}`}
        title="Configurações"
        description="A grade fixa de aulas, os modelos de turma e o prazo de cancelamento."
      />

      <div className="grid items-start gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4">
          {/* Prazo de cancelamento */}
          <DashCard
            title="Prazo de cancelamento"
            subtitle="Até esse prazo o aluno cancela sem custo. Depois dele, o crédito da aula é debitado."
          >
            <form
              key={data.cancelWindowHours}
              onSubmit={(e) =>
                updateSettings.mutate(
                  read(e, ["cancelWindowHours"]),
                  feedback("Prazo salvo"),
                )
              }
              className="flex items-end gap-2"
            >
              <div className="flex-1">
                <Label htmlFor="cw-hours">Horas antes da aula</Label>
                <Input
                  id="cw-hours"
                  name="cancelWindowHours"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={48}
                  defaultValue={data.cancelWindowHours}
                />
              </div>
              <Button type="submit" disabled={updateSettings.isPending}>
                Salvar
              </Button>
            </form>
          </DashCard>

          {/* Templates */}
          <DashCard
            title="Templates de aula"
            subtitle="Modelos de turma usados na grade: duração e vagas."
          >
            <ul className="mb-5 space-y-2">
              {data.templates.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl bg-[var(--mv-brand-50)] px-3.5 py-3"
                >
                  <span className="min-w-0 flex-1 truncate font-semibold text-[var(--mv-text)]">
                    {t.name}
                  </span>
                  <span className={chip}>
                    <Clock className="h-3.5 w-3.5" /> {t.durationMin} min
                  </span>
                  <span className={chip}>
                    <Users className="h-3.5 w-3.5" /> {t.minCapacity}–{t.capacity}
                  </span>
                </li>
              ))}
              {!data.templates.length && (
                <li className="rounded-2xl border border-dashed border-[var(--mv-line)] py-5 text-center text-sm text-[var(--mv-text-soft)]">
                  Nenhum template ainda.
                </li>
              )}
            </ul>

            <form
              onSubmit={(e) =>
                createTemplate.mutate(
                  read(e, ["durationMin", "minCapacity", "capacity"]),
                  feedback("Template criado", e.currentTarget),
                )
              }
            >
              <fieldset className="space-y-3">
                <legend className={legend}>Novo template</legend>
                <div>
                  <Label htmlFor="tpl-name">Nome</Label>
                  <Input id="tpl-name" name="name" placeholder="Ex.: Padrão" required />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="tpl-duration">Duração</Label>
                    <Input id="tpl-duration" name="durationMin" type="number" inputMode="numeric" min={10} defaultValue={50} />
                  </div>
                  <div>
                    <Label htmlFor="tpl-min">Mínimo</Label>
                    <Input id="tpl-min" name="minCapacity" type="number" inputMode="numeric" min={1} defaultValue={3} />
                  </div>
                  <div>
                    <Label htmlFor="tpl-max">Máximo</Label>
                    <Input id="tpl-max" name="capacity" type="number" inputMode="numeric" min={1} defaultValue={7} />
                  </div>
                </div>
                <p className="text-xs text-[var(--mv-text-soft)]">Duração em minutos; mínimo e máximo de alunos.</p>
                <Button type="submit" variant="secondary" disabled={createTemplate.isPending} className="w-full">
                  <Plus className="h-[18px] w-[18px]" /> Criar template
                </Button>
              </fieldset>
            </form>
          </DashCard>
        </div>

        {/* Grade semanal */}
        <DashCard
          title="Grade semanal"
          subtitle="Horários fixos que viram aulas toda semana. Desative para pausar sem perder o horário."
        >
          <div className="mb-6 space-y-5">
            {WEEK_ORDER.map((wd) => {
              const slots = data.slots.filter((s) => s.weekday === wd);
              if (!slots.length) return null;
              return (
                <div key={wd}>
                  <h3 className={legend}>
                    {WEEKDAYS[wd]} · {slots.length}
                  </h3>
                  <ul className="space-y-2">
                    {slots.map((s) => (
                      // celular: horário + botão em cima, selects embaixo; desktop: tudo numa linha
                      <li
                        key={s.id}
                        className={`grid grid-cols-2 items-center gap-2 rounded-2xl p-2.5 sm:grid-cols-[4.5rem_1fr_1fr_auto] ${
                          s.active
                            ? "bg-[var(--mv-brand-50)]"
                            : "border border-dashed border-[var(--mv-line)] opacity-60"
                        }`}
                      >
                        <span className="pl-1.5 text-lg font-bold tabular-nums text-[var(--mv-text)]">
                          {s.time}
                        </span>
                        <select
                          aria-label={`Template das ${s.time}`}
                          className={`${selectCls} col-span-2 sm:col-span-1`}
                          value={s.templateId}
                          onChange={(e) => patchSlot(s.id, { templateId: e.target.value })}
                        >
                          {data.templates.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                        <select
                          aria-label={`Professor das ${s.time}`}
                          className={`${selectCls} col-span-2 sm:col-span-1`}
                          value={s.professorId}
                          onChange={(e) => patchSlot(s.id, { professorId: e.target.value })}
                        >
                          {professors?.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="outline"
                          onClick={() => patchSlot(s.id, { active: !s.active })}
                          className="col-start-2 row-start-1 justify-self-end sm:col-start-auto sm:row-start-auto"
                        >
                          {s.active ? "Desativar" : "Reativar"}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            {!data.slots.length && (
              <p className="rounded-2xl border border-dashed border-[var(--mv-line)] py-8 text-center text-sm text-[var(--mv-text-soft)]">
                Nenhum horário na grade ainda.
              </p>
            )}
          </div>

          <form
            onSubmit={(e) =>
              createSlot.mutate(
                read(e, ["weekday"]),
                feedback("Horário adicionado", e.currentTarget),
              )
            }
          >
            <fieldset>
              <legend className={legend}>Novo horário</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <Label htmlFor="slot-weekday">Dia</Label>
                  <select id="slot-weekday" name="weekday" className={selectCls} defaultValue={1}>
                    {WEEK_ORDER.map((wd) => (
                      <option key={wd} value={wd}>
                        {WEEKDAYS[wd]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="slot-time">Horário</Label>
                  <Input id="slot-time" name="time" type="time" required />
                </div>
                <div>
                  <Label htmlFor="slot-template">Template</Label>
                  <select id="slot-template" name="templateId" className={selectCls} required defaultValue="">
                    <option value="" disabled>
                      Selecione...
                    </option>
                    {data.templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="slot-professor">Professor</Label>
                  <select id="slot-professor" name="professorId" className={selectCls} required defaultValue="">
                    <option value="" disabled>
                      Selecione...
                    </option>
                    {professors?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={createSlot.isPending} className="w-full sm:w-auto sm:min-w-44">
                  <Plus className="h-[18px] w-[18px]" /> Adicionar horário
                </Button>
              </div>
            </fieldset>
          </form>
        </DashCard>
      </div>
    </div>
  );
}
