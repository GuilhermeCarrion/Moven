"use client";

import { initials } from "@/components/layout/Sidebar";
import { InboxMessage, useSendMessage, useThread } from "@/hooks/useInbox";
import { apiError } from "@/lib/apiError";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Check,
  CheckCheck,
  Lock,
  Send,
} from "lucide-react";
import { FormEvent, Fragment, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { inboxPanel } from "./ConversationList";

const hhmm = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

// Separador entre dias: "Hoje", "Ontem" ou a data
const dayLabel = (iso: string) => {
  const d = new Date(iso).toDateString();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d === today.toDateString()) return "Hoje";
  if (d === yesterday.toDateString()) return "Ontem";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
};

// ✓ enviada · ✓✓ entregue · ✓✓ azul lida · ! falhou
function StatusIcon({ status }: { status: InboxMessage["status"] }) {
  if (status === "READ")
    return <CheckCheck aria-label="Lida" className="h-3.5 w-3.5 text-sky-500" />;
  if (status === "DELIVERED") return <CheckCheck aria-label="Entregue" className="h-3.5 w-3.5" />;
  if (status === "FAILED")
    return <AlertCircle aria-label="Falhou" className="h-3.5 w-3.5 text-red-500" />;
  return <Check aria-label="Enviada" className="h-3.5 w-3.5" />;
}

function Bubble({ m }: { m: InboxMessage }) {
  const out = m.direction === "OUT";
  const auto = out && !m.sentById; // enviada pelo sistema, não por uma pessoa

  return (
    <div className={`flex ${out ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[15px] text-[var(--mv-text)] shadow-[0_1px_2px_rgb(11_21_48/0.06)] ${
          out
            ? auto
              ? "rounded-br-md border border-dashed border-[var(--mv-brand-200)] bg-[var(--mv-brand-50)]"
              : "rounded-br-md bg-[var(--mv-brand-100)]"
            : "rounded-bl-md border border-[var(--mv-line)] bg-[var(--mv-surface)]"
        }`}
      >
        {auto && (
          <div className="mv-mono mb-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-[var(--mv-brand-700)]">
            <Bot className="h-3 w-3" /> Automático
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{m.text ?? `[${m.type}]`}</p>
        <div className="mt-1 flex items-center justify-end gap-1 text-[11px] tabular-nums text-[var(--mv-text-soft)]">
          {hhmm(m.createdAt)}
          {out && <StatusIcon status={m.status} />}
        </div>
      </div>
    </div>
  );
}

export function ChatThread({ id, onBack }: { id: string; onBack: () => void }) {
  const { data } = useThread(id);
  const send = useSendMessage(id);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const count = data?.messages.length ?? 0;

  // Rola pro fim ao abrir uma conversa ou quando chega mensagem nova — não a cada polling
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [id, count]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    send.mutate(t, {
      onSuccess: () => setText(""),
      onError: (err) => toast.error(apiError(err)),
    });
  };

  if (!data)
    return (
      <div className={`${inboxPanel} flex h-full items-center justify-center text-sm text-[var(--mv-text-soft)]`}>
        Carregando...
      </div>
    );

  const { conversation: c, messages } = data;

  return (
    <div className={`${inboxPanel} flex h-full flex-col overflow-hidden`}>
      <header className="flex items-center gap-3 border-b border-[var(--mv-line)] px-3 py-3 sm:px-4">
        <button
          onClick={onBack}
          aria-label="Voltar para as conversas"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[var(--mv-text-soft)] hover:bg-[var(--mv-brand-50)] lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            c.student ? "bg-[var(--mv-brand)] text-white" : "bg-slate-500/15 text-slate-600 dark:text-slate-300"
          }`}
        >
          {initials(c.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-[var(--mv-text)]">{c.name}</p>
          <p className="truncate text-sm tabular-nums text-[var(--mv-text-soft)]">
            {c.student ? "Aluno" : "Contato"} · +{c.waId}
          </p>
        </div>
        {c.windowOpen ? (
          <span className="hidden flex-shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 sm:flex dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {c.windowClosesAt ? `Responder até ${hhmm(c.windowClosesAt)}` : "Pode responder"}
          </span>
        ) : (
          <span className="hidden flex-shrink-0 items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-semibold text-slate-600 sm:flex dark:text-slate-300">
            <Lock className="h-3 w-3" /> Janela fechada
          </span>
        )}
      </header>

      {/* Fundo pontilhado (mesma linguagem dos blocos), estático */}
      <div className="flex-1 space-y-2 overflow-y-auto bg-[color-mix(in_oklch,var(--mv-brand)_3%,var(--mv-bg))] bg-[radial-gradient(var(--mv-line)_1px,transparent_1px)] bg-[length:18px_18px] px-3 py-4 sm:px-5">
        {messages.map((m, i) => (
          <Fragment key={m.id}>
            {(i === 0 ||
              new Date(messages[i - 1].createdAt).toDateString() !== new Date(m.createdAt).toDateString()) && (
              <div className="sticky top-0 z-10 flex justify-center py-2">
                <span className="rounded-full border border-[var(--mv-line)] bg-[var(--mv-surface)] px-3 py-1 text-xs font-semibold text-[var(--mv-text-soft)] shadow-[0_1px_2px_rgb(11_21_48/0.06)]">
                  {dayLabel(m.createdAt)}
                </span>
              </div>
            )}
            <Bubble m={m} />
          </Fragment>
        ))}
        <div ref={endRef} />
      </div>

      {c.windowOpen ? (
        <form onSubmit={submit} className="flex items-end gap-2 border-t border-[var(--mv-line)] p-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Enter envia; Shift+Enter quebra linha (igual ao WhatsApp Web)
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            maxLength={4096}
            aria-label="Mensagem"
            placeholder="Digite uma mensagem"
            className="max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-[var(--mv-line)] bg-[var(--mv-field)] px-3.5 py-2.5 text-base text-[var(--mv-text)] outline-none placeholder:text-[var(--mv-text-soft)]/70 focus-visible:border-[var(--mv-brand)] focus-visible:ring-4 focus-visible:ring-[var(--mv-brand)]/15"
          />
          <button
            type="submit"
            disabled={send.isPending || !text.trim()}
            aria-label="Enviar"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--mv-brand)] text-white shadow-[0_10px_24px_-12px_var(--mv-brand)] transition-all hover:brightness-110 disabled:opacity-50"
          >
            <Send className="h-[18px] w-[18px]" />
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2.5 border-t border-[var(--mv-line)] bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <Lock className="h-4 w-4 flex-shrink-0" />
          Janela de 24h fechada: você poderá responder quando o contato enviar uma nova mensagem.
        </div>
      )}
    </div>
  );
}
