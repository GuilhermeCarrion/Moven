"use client";

import { glass } from "@/app/(painel)/mensagens/page";
import { InboxMessage, useSendMessage, useThread } from "@/hooks/useInbox";
import { apiError } from "@/lib/apiError";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCheck,
  Lock,
  Send,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const hhmm = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

// ✓ enviada · ✓✓ entregue · ✓✓ azul lida · ! falhou
function StatusIcon({ status }: { status: InboxMessage["status"] }) {
  if (status === "READ")
    return <CheckCheck className="h-3.5 w-3.5 text-sky-500" />;
  if (status === "DELIVERED") return <CheckCheck className="h-3.5 w-3.5" />;
  if (status === "FAILED")
    return <AlertCircle className="h-3.5 w-3.5 text-rose-500" />;
  return <Check className="h-3.5 w-3.5" />;
}

function Bubble({ m }: { m: InboxMessage }) {
  const out = m.direction === "OUT";
  const auto = out && !m.sentById; // enviada pelo sistema, não por uma pessoa

  return (
    <div className={`flex ${out ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm text-slate-800 shadow-sm ${
          out ? "rounded-br-md bg-cyan-50" : "rounded-bl-md bg-white/80"
        } ${auto ? "border border-dashed border-cyan-200" : ""}`}
      >
        {auto && (
          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-700">
            Automático
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">
          {m.text ?? `[${m.type}]`}
        </p>
        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
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
      <div
        className={`${glass} flex h-full items-center justify-center text-sm text-slate-400`}
      >
        Carregando...
      </div>
    );

  const { conversation: c, messages } = data;

  return (
    <div className={`${glass} flex h-full flex-col overflow-hidden`}>
      <div className="flex items-center gap-3 border-b border-white/60 px-4 py-3">
        <button onClick={onBack} className="lg:hidden" aria-label="Voltar">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </button>
        <div className="min-w-0">
          <div className="truncate font-semibold text-slate-800">{c.name}</div>
          <div className="text-xs text-slate-400">
            {c.student ? "Aluno" : "Contato"} · +{c.waId}
            {c.windowOpen &&
              c.windowClosesAt &&
              ` · responder até ${hhmm(c.windowClosesAt)}`}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <Bubble key={m.id} m={m} />
        ))}
        <div ref={endRef} />
      </div>

      {c.windowOpen ? (
        <form
          onSubmit={submit}
          className="flex items-end gap-2 border-t border-white/60 p-3"
        >
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
            placeholder="Digite uma mensagem"
            className="max-h-32 min-w-0 flex-1 resize-none rounded-xl border border-white/70 bg-white/60 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[var(--primary)]"
          />
          <button
            type="submit"
            disabled={send.isPending || !text.trim()}
            aria-label="Enviar"
            className="rounded-xl bg-[var(--primary)] p-3 text-white transition-colors hover:bg-[var(--primary-focus)] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2 border-t border-white/60 bg-amber-50/70 px-4 py-3 text-sm text-amber-700">
          <Lock className="h-4 w-4 shrink-0" />
          Janela de 24h fechada: você poderá responder quando o contato enviar
          uma nova mensagem.
        </div>
      )}
    </div>
  );
}
