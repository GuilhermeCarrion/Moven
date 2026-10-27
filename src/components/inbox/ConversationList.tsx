"use client";

import { initials } from "@/components/layout/Sidebar";
import { ConversationItem, useConversations } from "@/hooks/useInbox";

/** Casca dos dois painéis da caixa de entrada (superfície sólida: dado não fica sobre vidro). */
export const inboxPanel =
  "rounded-[22px] border border-[var(--mv-line)] bg-[var(--mv-surface)] shadow-[0_1px_2px_rgb(11_21_48/0.04)]";

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

export function ConversationList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { data, isLoading } = useConversations();
  const unread = (data ?? []).filter((c) => c.unreadCount > 0).length;

  return (
    <div className={`${inboxPanel} flex h-full flex-col overflow-hidden`}>
      <header className="border-b border-[var(--mv-line)] px-4 pb-3 pt-4">
        <p className="mv-mono text-[10px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)]">WhatsApp</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--mv-text)]">Mensagens</h1>
        <p className="text-sm text-[var(--mv-text-soft)]">
          {data?.length ?? 0} {data?.length === 1 ? "conversa" : "conversas"}
          {unread > 0 && (
            <span className="font-semibold text-[var(--mv-brand-700)]">
              {" "}
              · {unread} {unread === 1 ? "não lida" : "não lidas"}
            </span>
          )}
        </p>
      </header>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {isLoading ? (
          <p className="p-3 text-sm text-[var(--mv-text-soft)]">Carregando...</p>
        ) : !data?.length ? (
          <p className="p-3 text-sm text-[var(--mv-text-soft)]">Nenhuma conversa ainda.</p>
        ) : (
          data.map((c) => {
            const active = selectedId === c.id;
            const hasUnread = c.unreadCount > 0;
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                aria-current={active || undefined}
                className={`relative flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors ${
                  active ? "bg-[var(--mv-brand-100)]" : "hover:bg-[var(--mv-brand-50)]"
                }`}
              >
                {active && (
                  <span aria-hidden className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-[var(--mv-brand)]" />
                )}
                <span className="relative flex-shrink-0">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold ${
                      c.isStudent
                        ? "bg-[var(--mv-brand)] text-white"
                        : "bg-slate-500/15 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {initials(c.name)}
                  </span>
                  {/* ponto verde: janela de 24h aberta, dá para responder */}
                  {c.windowOpen && (
                    <span
                      title="Pode responder"
                      className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--mv-surface)] bg-emerald-500"
                    />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className={`truncate text-[var(--mv-text)] ${hasUnread ? "font-bold" : "font-semibold"}`}>
                      {c.name}
                    </span>
                    <span
                      className={`flex-shrink-0 text-xs tabular-nums ${
                        hasUnread ? "font-semibold text-[var(--mv-brand-700)]" : "text-[var(--mv-text-soft)]"
                      }`}
                    >
                      {when(c.lastMessageAt)}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2">
                    <span
                      className={`truncate text-sm ${hasUnread ? "text-[var(--mv-text)]" : "text-[var(--mv-text-soft)]"}`}
                    >
                      {previewText(c.preview)}
                    </span>
                    {hasUnread && (
                      <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--mv-brand)] px-1.5 text-[11px] font-bold text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
