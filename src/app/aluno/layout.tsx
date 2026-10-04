"use client";

import { StudentAuthProvider } from "@/contexts/StudentAuthContext";
import React from "react";

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentAuthProvider>{children}</StudentAuthProvider>;
}
