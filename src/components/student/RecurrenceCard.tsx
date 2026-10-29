"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
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
    <section className={className}>
      <h2 className="text-base font-bold text-[var(--mv-text)]">Minha agenda fixa</h2>
      <p className="mb-4 text-sm text-[var(--mv-text-soft)]">
        Toque nos horários que você faz toda semana. Reservamos para você nos
        próximos 30 dias, enquanto houver crédito.
      </p>

      {data.slots.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--mv-line)] py-6 text-center text-sm text-[var(--mv-text-soft)]">
          A academia ainda não publicou a grade.
        </p>
      ) : (
        <div className="space-y-3">
          {MON_FIRST.map((day) => {
            const daySlots = data.slots.filter((s) => s.weekday === day);
            if (!daySlots.length) return null;
            return (
              <div key={day} className="flex items-start gap-3">
                <span className="mv-mono w-9 flex-shrink-0 pt-3 text-[11px] uppercase tracking-[0.1em] text-[var(--mv-text-soft)]">
                  {DAYS[day]}
                </span>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((s) => {
                    const on = selected.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggle(s.id)}
                        aria-pressed={on}
                        aria-label={`${DAYS[s.weekday]} ${s.time}, ${s.name}, Prof. ${s.professor}`}
                        title={`${s.name} · Prof. ${s.professor}`}
                        className={`h-11 rounded-xl px-4 font-semibold tabular-nums transition-colors ${
                          on
                            ? "bg-[var(--mv-brand)] text-white shadow-[0_10px_22px_-12px_var(--mv-brand)]"
                            : "border border-[var(--mv-line)] bg-[var(--mv-surface)] text-[var(--mv-text)] hover:bg-[var(--mv-brand-50)]"
                        }`}
                      >
                        {s.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(removed.length > 0 || added.length > 0) && (
        <div className="mt-4 flex gap-2.5 rounded-2xl bg-amber-500/10 p-3.5 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div className="space-y-1">
            {removed.length > 0 && (
              <p>
                As reservas futuras de <b>{removed.map(label).join(", ")}</b>{" "}
                serão canceladas, sem custo.
              </p>
            )}
            {added.length > 0 && (
              <p>
                Novos horários: <b>{added.map(label).join(", ")}</b>, reservados
                conforme seu crédito.
              </p>
            )}
            <p>Aulas que já passaram ou já foram debitadas não mudam.</p>
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={save.isPending || (!added.length && !removed.length)}
        onClick={onSave}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[var(--mv-brand)] font-semibold text-white shadow-[0_12px_28px_-14px_var(--mv-brand)] transition-all hover:brightness-110 disabled:opacity-50 disabled:shadow-none sm:w-auto sm:min-w-44 sm:px-8"
      >
        {save.isPending ? "Salvando..." : "Salvar agenda"}
      </button>
    </section>
  );
}
