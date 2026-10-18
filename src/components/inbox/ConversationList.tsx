"use client";

import { glass } from "@/app/(painel)/mensagens/page";
import { ConversationItem, useConversations } from "@/hooks/useInbox";

// Hoje mostra a hora; dias anteriores, a data
const when = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toDateString() === new Date().toDateString()
    ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};

// Mensagem sem texto (mídia) mostra o tipo
const previewText = (p: ConversationItem["preview"]) =>
  !p
    ? ""
    : `${p.direction === "OUT" ? "Você: " : ""}${p.text ?? `[${p.type}]`}`;

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export function ConversationList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { data, isLoading } = useConversations();

  return (
    <div className={`${glass} flex h-full flex-col overflow-hidden`}>
      <h1 className="border-b border-white/60 px-4 py-3 text-lg font-bold text-slate-800">
        Mensagens
      </h1>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {isLoading ? (
          <p className="p-3 text-sm text-slate-400">Carregando...</p>
        ) : !data?.length ? (
          <p className="p-3 text-sm text-slate-400">Nenhuma conversa ainda.</p>
        ) : (
          data.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                selectedId === c.id ? "bg-cyan-50" : "hover:bg-white/60"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                  c.isStudent ? "bg-[var(--primary)]" : "bg-slate-400"
                }`}
              >
                {initials(c.name)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold text-slate-800">
                    {c.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-slate-400">
                    {when(c.lastMessageAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-slate-500">
                    {previewText(c.preview)}
                  </span>
                  {c.unreadCount > 0 && (
                    <span className="shrink-0 rounded-full bg-[var(--primary)] px-1.5 text-[11px] font-bold text-white">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
