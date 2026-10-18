"use client";

import { ChatThread } from "@/components/inbox/ChatThread";
import { ConversationList } from "@/components/inbox/ConversationList";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

export const glass =
  "rounded-2xl border border-white/60 bg-white/55 shadow-xl backdrop-blur-2xl backdrop-saturate-150";

export default function MensagensPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    // Altura fixa = tela menos o padding do layout; quem rola é a lista/thread, não a página
    <div className="flex h-[calc(100dvh-7rem)] gap-4 lg:h-[calc(100vh-3rem)]">
      {/* Lista: no mobile some quando uma conversa está aberta */}
      <div
        className={`${selectedId ? "hidden" : "flex"} w-full flex-col lg:flex lg:w-80 lg:shrink-0`}
      >
        <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      {/* Conversa: no mobile ocupa a tela; no desktop fica ao lado da lista */}
      <div
        className={`${selectedId ? "flex" : "hidden"} min-w-0 flex-1 flex-col lg:flex`}
      >
        {selectedId ? (
          <ChatThread id={selectedId} onBack={() => setSelectedId(null)} />
        ) : (
          <div
            className={`${glass} flex h-full flex-col items-center justify-center text-center`}
          >
            <MessageSquare className="h-10 w-10 text-[var(--primary)]" />
            <p className="mt-3 text-sm text-slate-500">
              Selecione uma conversa
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
