"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfessors } from "@/hooks/useProfessors";
import {
  useCreateSlot,
  useCreateTemplate,
  useSettings,
  useUpdateSettings,
  useUpdateSlot,
} from "@/hooks/useSettings";
import { apiError } from "@/lib/apiError";
import { FormEvent } from "react";
import { toast } from "sonner";

const glass =
  "rounded-2xl border border-white/60 bg-white/55 p-5 shadow-xl backdrop-blur-2xl backdrop-saturate-150";
const select =
  "h-10 w-full rounded-lg border border-slate-200/70 bg-white/70 px-2.5 text-sm text-slate-700 outline-none focus:border-[var(--primary)]";
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

  if (isLoading) return <p className="text-sm text-slate-400">Carregando...</p>;
  if (error || !data)
    return <p className="text-sm text-slate-500">{apiError(error)}</p>;

  const patchSlot = (id: string, patch: Record<string, unknown>) =>
    updateSlot.mutate({ id, data: patch }, feedback("Horário atualizado"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Grade de aulas e regras da academia.
        </p>
      </div>

      {/* Prazo de cancelamento */}
      <section className={glass}>
        <h2 className="mb-3 font-semibold text-slate-800">
          Prazo de cancelamento
        </h2>
        <form
          key={data.cancelWindowHours}
          onSubmit={(e) =>
            updateSettings.mutate(
              read(e, ["cancelWindowHours"]),
              feedback("Prazo salvo"),
            )
          }
          className="flex flex-wrap items-center gap-3"
        >
          <Input
            name="cancelWindowHours"
            type="number"
            min={0}
            max={48}
            defaultValue={data.cancelWindowHours}
            className="w-24"
          />
          <span className="text-sm text-slate-600">horas antes da aula</span>
          <Button type="submit" disabled={updateSettings.isPending}>
            Salvar
          </Button>
        </form>
        <p className="mt-2 text-xs text-slate-400">
          Até esse prazo o aluno cancela sem custo. No prazo, o crédito da aula
          é debitado.
        </p>
      </section>

      {/* Templates */}
      <section className={glass}>
        <h2 className="mb-3 font-semibold text-slate-800">Templates de aula</h2>
        <ul className="mb-4 space-y-1 text-sm text-slate-600">
          {data.templates.map((t) => (
            <li key={t.id}>
              <b className="text-slate-800">{t.name}</b> · {t.durationMin} min ·{" "}
              {t.minCapacity}–{t.capacity} alunos
            </li>
          ))}
          {!data.templates.length && (
            <li className="text-slate-400">Nenhum template ainda.</li>
          )}
        </ul>
        <form
          onSubmit={(e) =>
            createTemplate.mutate(
              read(e, ["durationMin", "minCapacity", "capacity"]),
              feedback("Template criado", e.currentTarget),
            )
          }
          className="grid grid-cols-2 gap-3 sm:grid-cols-5"
        >
          <Input
            name="name"
            placeholder="Nome (ex.: Padrão)"
            required
            className="col-span-2"
          />
          <Input
            name="durationMin"
            type="number"
            min={10}
            defaultValue={50}
            title="Duração (min)"
          />
          <Input
            name="minCapacity"
            type="number"
            min={1}
            defaultValue={3}
            title="Mínimo"
          />
          <Input
            name="capacity"
            type="number"
            min={1}
            defaultValue={7}
            title="Máximo"
          />
          <Button
            type="submit"
            disabled={createTemplate.isPending}
            className="col-span-2 sm:col-span-5"
          >
            Criar template
          </Button>
        </form>
      </section>

      {/* Grade semanal */}
      <section className={glass}>
        <h2 className="mb-3 font-semibold text-slate-800">Grade semanal</h2>

        <div className="mb-4 space-y-4">
          {WEEK_ORDER.map((wd) => {
            const slots = data.slots.filter((s) => s.weekday === wd);
            if (!slots.length) return null;
            return (
              <div key={wd}>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {WEEKDAYS[wd]}
                </h3>
                <div className="space-y-2">
                  {slots.map((s) => (
                    <div
                      key={s.id}
                      className={`grid grid-cols-[4rem_1fr_1fr_auto] items-center gap-2 ${s.active ? "" : "opacity-50"}`}
                    >
                      <span className="font-semibold text-slate-800">
                        {s.time}
                      </span>
                      <select
                        className={select}
                        value={s.templateId}
                        onChange={(e) =>
                          patchSlot(s.id, { templateId: e.target.value })
                        }
                      >
                        {data.templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <select
                        className={select}
                        value={s.professorId}
                        onChange={(e) =>
                          patchSlot(s.id, { professorId: e.target.value })
                        }
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
                      >
                        {s.active ? "Desativar" : "Reativar"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {!data.slots.length && (
            <p className="text-sm text-slate-400">
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
          className="grid grid-cols-2 gap-3 sm:grid-cols-5"
        >
          <select name="weekday" className={select} defaultValue={1}>
            {WEEK_ORDER.map((wd) => (
              <option key={wd} value={wd}>
                {WEEKDAYS[wd]}
              </option>
            ))}
          </select>
          <Input name="time" type="time" required />
          <select name="templateId" className={select} required defaultValue="">
            <option value="" disabled>
              Template
            </option>
            {data.templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            name="professorId"
            className={select}
            required
            defaultValue=""
          >
            <option value="" disabled>
              Professor
            </option>
            {professors?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={createSlot.isPending}>
            Adicionar
          </Button>
        </form>
      </section>
    </div>
  );
}
