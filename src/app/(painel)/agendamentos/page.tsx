"use client";

import { ClassSessionForm } from "@/components/schedule/ClassSessionForm";
import { SessionDetail } from "@/components/schedule/SessionDetail";
import { MonthCalendar } from "@/components/schedule/MonthCalendar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  useClassSessions,
  useCreateClassSession,
} from "@/hooks/useClassSessions";
import { apiError } from "@/lib/apiError";
import { ChevronDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const sameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);

function gridRange(cursor: Date) {
  const first = startOfMonth(cursor);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 42);
  return { start, end };
}

export default function AgendamentosPage() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { start, end } = gridRange(cursor);
  const { data: sessions, isLoading } = useClassSessions({
    from: start.toISOString(),
    to: end.toISOString(),
  });
  const create = useCreateClassSession();

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, { id: string; name: string }[]>();
    (sessions ?? []).forEach((s) => {
      const k = dayKey(new Date(s.startAt));
      const arr = map.get(k) ?? [];
      arr.push({ id: s.id, name: s.name });
      map.set(k, arr);
    });
    return map;
  }, [sessions]);

  const daySessions = (sessions ?? [])
    .filter((s) => sameDay(new Date(s.startAt), selected))
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );

  const shiftMonth = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  const goToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setCursor(startOfMonth(now));
    setSelected(now);
  };

  const time = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const endTime = (iso: string, min: number) =>
    new Date(new Date(iso).getTime() + min * 60000).toLocaleTimeString(
      "pt-BR",
      { hour: "2-digit", minute: "2-digit" },
    );

  const panelLabel = selected.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Agendamentos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe as aulas do dia, marque presença e agende alunos.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Nova aula
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <MonthCalendar
          cursor={cursor}
          selected={selected}
          sessionsByDay={sessionsByDay}
          onSelect={setSelected}
          onPrev={() => shiftMonth(-1)}
          onNext={() => shiftMonth(1)}
          onToday={goToday}
        />

        <div className="rounded-2xl border border-white/60 bg-white/55 p-4 shadow-xl backdrop-blur-2xl backdrop-saturate-150">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-800">
              Agenda do dia
            </h2>
            <p className="text-sm capitalize text-slate-500">{panelLabel}</p>
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-400">Carregando...</p>
          ) : daySessions.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma aula neste dia.</p>
          ) : (
            <div className="space-y-3">
              {daySessions.map((s) => {
                const occupancy = s._count?.appointments ?? 0;
                const open = expandedId === s.id;
                return (
                  <div
                    key={s.id}
                    className="overflow-hidden rounded-xl border border-white/60 bg-white/50"
                  >
                    <button
                      onClick={() => setExpandedId(open ? null : s.id)}
                      className="flex w-full items-start justify-between gap-2 p-3 text-left"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">
                          {s.name}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {time(s.startAt)} –{" "}
                          {endTime(s.startAt, s.durationMin)}
                          {" · Prof. "}
                          {s.professor?.name ?? "--"}
                        </div>
                        <div className="mt-1 text-xs font-medium text-cyan-700">
                          {occupancy}/{s.capacity} agendados
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    {open && (
                      <div className="border-t border-white/60 p-3">
                        <SessionDetail session={s} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Nova aula"
      >
        <ClassSessionForm
          isSubmitting={create.isPending}
          onSubmit={(data) =>
            create.mutate(data, {
              onSuccess: () => {
                toast.success("Aula criada");
                setCreating(false);
              },
              onError: (e) => toast.error(apiError(e)),
            })
          }
        />
      </Modal>
    </>
  );
}
