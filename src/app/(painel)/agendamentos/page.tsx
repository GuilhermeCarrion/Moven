"use client";

import { CloudField } from "@/components/landing/CloudField";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClassSessionForm } from "@/components/schedule/ClassSessionForm";
import { DayAgenda } from "@/components/schedule/DayAgenda";
import { MonthCalendar } from "@/components/schedule/MonthCalendar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  useClassSessions,
  useCreateClassSession,
} from "@/hooks/useClassSessions";
import { apiError } from "@/lib/apiError";
import { Plus } from "lucide-react";
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

  const monthCount = (sessions ?? []).filter((s) => {
    const d = new Date(s.startAt);
    return d.getMonth() === cursor.getMonth() && d.getFullYear() === cursor.getFullYear();
  }).length;

  const shiftMonth = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  const goToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setCursor(startOfMonth(now));
    setSelected(now);
  };

  return (
    // altura da tela menos o padding do main (p-5): o template do painel tem altura automática, então % não funciona
    <div className="relative xl:min-h-[calc(100vh-2.5rem)]">
      {/* Nuvens só de fundo, em duas zonas (canto inferior direito e topo direito), atrás dos cards.
          Só com calendário e dia lado a lado (xl): abaixo disso não sobra espaço livre. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-y-5 -right-5 left-0 hidden xl:block"
        style={
          {
            "--mv-ambient-alpha": 0.5,
            maskImage:
              "radial-gradient(ellipse 130% 105% at 100% 100%, black 40%, transparent 85%), radial-gradient(ellipse 55% 45% at 100% 0%, black 30%, transparent 90%)",
          } as React.CSSProperties
        }
      >
        <CloudField ambient spotlight={false} />
      </div>

      <div className="relative mx-auto max-w-[1400px] space-y-4 sm:space-y-5">
        <PageHeader
          eyebrow={`Agenda · ${monthCount} ${monthCount === 1 ? "aula" : "aulas"} em ${cursor.toLocaleDateString("pt-BR", { month: "long" })}`}
          title="Agendamentos"
          description="Escolha um dia no calendário para ver as aulas, agendar alunos e marcar presença."
          actions={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-[18px] w-[18px]" /> Nova aula
            </Button>
          }
        />

        {/* Calendário → horários do dia (lado a lado só a partir de 1280px) */}
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
          <MonthCalendar
            cursor={cursor}
            selected={selected}
            sessionsByDay={sessionsByDay}
            onSelect={setSelected}
            onPrev={() => shiftMonth(-1)}
            onNext={() => shiftMonth(1)}
            onToday={goToday}
          />
          <DayAgenda date={selected} sessions={daySessions} isLoading={isLoading} />
        </div>

        <Modal
          open={creating}
          onClose={() => setCreating(false)}
          title="Nova aula"
          description="A aula aparece no calendário e os alunos já podem ser agendados."
          footer={
            <>
              <Button variant="secondary" onClick={() => setCreating(false)} className="hidden sm:inline-flex">
                Cancelar
              </Button>
              <Button
                type="submit"
                form="class-session-form"
                disabled={create.isPending}
                className="w-full sm:w-auto sm:min-w-44"
              >
                {create.isPending ? "Salvando..." : "Criar aula"}
              </Button>
            </>
          }
        >
          <ClassSessionForm
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
      </div>
    </div>
  );
}
