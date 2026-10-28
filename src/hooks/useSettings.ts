"use client";

import { apiPrivate } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Settings {
  cancelWindowHours: number;
  templates: {
    id: string;
    name: string;
    durationMin: number;
    capacity: number;
    minCapacity: number;
    active: boolean;
  }[];
  slots: {
    id: string;
    weekday: number;
    time: string;
    active: boolean;
    professorId: string;
    templateId: string;
    professor: { name: string };
    template: { name: string };
  }[];
}

const KEY = ["settings"];

export function useSettings() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await apiPrivate.get<Settings>("/settings")).data,
  });
}

// Toda mutação desta tela invalida a mesma query: ela inteira vem de um GET só
function useSettingsMutation<T>(fn: (data: T) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export const useUpdateSettings = () =>
  useSettingsMutation((data: unknown) => apiPrivate.patch("/settings", data));
export const useCreateTemplate = () =>
  useSettingsMutation((data: unknown) =>
    apiPrivate.post("/settings/templates", data),
  );
export const useCreateSlot = () =>
  useSettingsMutation((data: unknown) =>
    apiPrivate.post("/settings/slots", data),
  );
export const useUpdateSlot = () =>
  useSettingsMutation(({ id, data }: { id: string; data: unknown }) =>
    apiPrivate.patch(`/settings/slots/${id}`, data),
  );
