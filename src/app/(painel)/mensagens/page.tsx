"use client";

import { CloudField } from "@/components/landing/CloudField";
import { ChatThread } from "@/components/inbox/ChatThread";
import { ConversationList, inboxPanel } from "@/components/inbox/ConversationList";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

export default function MensagensPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    // Altura fixa = tela menos o padding do main (topo + pb-28 da bottom nav; no lg, p-5); quem rola é a lista/conversa
    <div className="mx-auto flex h-[calc(100dvh-7.75rem)] max-w-[1400px] gap-4 sm:h-[calc(100dvh-8rem)] lg:h-[calc(100vh-2.5rem)]">
      {/* Lista: no mobile some quando uma conversa está aberta */}
      <div className={`${selectedId ? "hidden" : "flex"} w-full flex-col lg:flex lg:w-[340px] lg:shrink-0`}>
        <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      {/* Conversa: no mobile ocupa a tela; no desktop fica ao lado da lista */}
      <div className={`${selectedId ? "flex" : "hidden"} min-w-0 flex-1 flex-col lg:flex`}>
        {selectedId ? (
          <ChatThread id={selectedId} onBack={() => setSelectedId(null)} />
        ) : (
          <div className={`${inboxPanel} relative flex h-full flex-col items-center justify-center overflow-hidden px-6 text-center`}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_70%)]"
              style={{ "--mv-ambient-alpha": 0.45 } as React.CSSProperties}
            >
              <CloudField ambient spotlight={false} />
            </div>
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--mv-brand-100)] text-[var(--mv-brand-700)]">
              <MessageSquare className="h-6 w-6" />
            </span>
            <p className="relative mt-4 text-lg font-bold text-[var(--mv-text)]">Selecione uma conversa</p>
            <p className="relative mt-1 max-w-sm text-sm text-[var(--mv-text-soft)]">
              As mensagens do WhatsApp da academia aparecem aqui, inclusive as automáticas de lembrete e confirmação.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
