import { apiPrivate } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: { name?: string; email?: string }) =>
      apiPrivate.patch("/profile", data),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiPrivate.post("/profile/password", data),
  });
}

export function useLogoutAll() {
  return useMutation({
    mutationFn: () => apiPrivate.post("/profile/logout-all"),
  });
}
