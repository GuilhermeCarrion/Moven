"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import {
  useSaveRecurrence,
  useStudentRecurrence,
} from "@/hooks/useStudentRecurrence";
import { apiError } from "@/lib/apiError";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MON_FIRST = [1, 2, 3, 4, 5, 6, 0];

export function RecurrenceCard({ className }: { className: string }) {
  const { data } = useStudentRecurrence();
  const save = useSaveRecurrence();
  // null = sem edição em andamento: mostra o que está salvo
  const [picked, setPicked] = useState<string[] | null>(null);

  if (!data) return null;

  const selected = picked ?? data.mine;
  const removed = data.mine.filter((id) => !selected.includes(id));
  const added = selected.filter((id) => !data.mine.includes(id));
  const label = (id: string) => {
    const s = data.slots.find((x) => x.id === id);
    return s ? `${DAYS[s.weekday]} ${s.time}` : "";
  };

  const toggle = (id: string) =>
    setPicked(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );

  const onSave = () =>
    save.mutate(selected, {
      onSuccess: () => {
        setPicked(null);
        toast.success("Agenda fixa salva");
      },
      onError: (e) => toast.error(apiError(e)),
    });

  return (
    <div className={className}>
      <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-600">
        <CalendarClock className="h-4 w-4 text-[var(--primary)]" /> Minha agenda
        fixa
      </h2>
      <p className="mb-4 text-xs text-slate-400">
        Reservamos esses horários pra você nos próximos 30 dias, enquanto houver
        crédito.
      </p>

      {data.slots.length === 0 ? (
        <p className="text-sm text-slate-400">
          A academia ainda não publicou a grade.
        </p>
      ) : (
        <div className="space-y-2.5">
          {MON_FIRST.map((day) => {
            const daySlots = data.slots.filter((s) => s.weekday === day);
            if (!daySlots.length) return null;
            return (
              <div key={day} className="flex items-center gap-3">
                <span className="w-9 shrink-0 text-xs font-semibold uppercase text-slate-400">
                  {DAYS[day]}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {daySlots.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggle(s.id)}
                      title={`${s.name} · Prof. ${s.professor}`}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                        selected.includes(s.id)
                          ? "bg-[var(--primary)] text-white"
                          : "border border-white/70 bg-white/60 text-slate-600 hover:bg-white"
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(removed.length > 0 || added.length > 0) && (
        <div className="mt-4 space-y-1 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-700">
          {removed.length > 0 && (
            <p>
              As reservas futuras de <b>{removed.map(label).join(", ")}</b>{" "}
              serão canceladas, sem custo.
            </p>
          )}
          {added.length > 0 && (
            <p>
              Novos horários: <b>{added.map(label).join(", ")}</b> — reservados
              conforme seu crédito.
            </p>
          )}
          <p>Aulas que já passaram ou já foram debitadas não mudam.</p>
        </div>
      )}

      <button
        type="button"
        disabled={save.isPending || (!added.length && !removed.length)}
        onClick={onSave}
        className="mt-4 w-full rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-focus)] disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {save.isPending ? "Salvando..." : "Salvar agenda"}
      </button>
    </div>
  );
}
