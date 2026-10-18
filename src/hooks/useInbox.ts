"use client";

import { apiPrivate } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ConversationItem {
  id: string;
  name: string;
  isStudent: boolean;
  unreadCount: number;
  lastMessageAt: string | null;
  preview: {
    text: string | null;
    type: string;
    direction: "IN" | "OUT";
    createdAt: string;
  } | null;
  windowOpen: boolean;
}

export interface InboxMessage {
  id: string;
  direction: "IN" | "OUT";
  type: string;
  text: string | null;
  status: "RECEIVED" | "SENT" | "DELIVERED" | "READ" | "FAILED";
  sentById: string | null;
  createdAt: string;
}

export interface Thread {
  conversation: {
    id: string;
    name: string;
    waId: string;
    student: { id: string; name: string } | null;
    windowOpen: boolean;
    windowClosesAt: string | null;
  };
  messages: InboxMessage[];
}

const POLL_MS = 5000; // "tempo real" por polling: busca de novo a cada 5s

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () =>
      (await apiPrivate.get<ConversationItem[]>("/conversations")).data,
    refetchInterval: POLL_MS,
  });
}

export function useThread(id: string | null) {
  return useQuery({
    queryKey: ["thread", id],
    queryFn: async () =>
      (await apiPrivate.get<Thread>(`/conversations/${id}/messages`)).data,
    enabled: !!id, // sem conversa selecionada, não busca nada
    refetchInterval: POLL_MS,
  });
}

export function useSendMessage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      apiPrivate.post(`/conversations/${id}/messages`, { text }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["thread", id] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
