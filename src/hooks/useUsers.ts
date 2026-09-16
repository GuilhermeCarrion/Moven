"use client";

import { apiPrivate } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { string, unknown } from "zod";

const KEY = ["users"];

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "GESTOR" | "PROFESSOR";
  active: boolean;
  createdAt: string;
}

export function useUsers() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await apiPrivate.get<SystemUser[]>("/users")).data,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiPrivate.post("/users", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      apiPrivate.patch(`/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      apiPrivate.post(`/users/${id}/password`, { password }),
  });
}
