"use client";

import { apiPublic } from "@/lib/axios";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Espelha AuthContext mas isolado e sem refresh
interface Student {
  id: string;
  name: string;
  academyId: string;
}

interface StudentAuthContextData {
  student: Student | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (cpf: string, birthDate: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const StudentAuthContext = createContext<StudentAuthContextData>(
  {} as StudentAuthContextData,
);

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const { data } = await apiPublic.get<Student>("/student/me");
        setStudent(data);
        setIsAuthenticated(true);
      } catch {
        setStudent(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const signIn = useCallback(async (cpf: string, birthDate: string) => {
    // Servidor grava o cookie httpOnly. Aqui só guarda o aluno retornado
    const { data } = await apiPublic.post<{ student: Student }>(
      "/student/login",
      {
        cpf,
        birthDate,
      },
    );
    setStudent(data.student);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiPublic.post("/student/logout");
    } catch {
    } finally {
      setStudent(null);
      setIsAuthenticated(false);
      if (typeof window !== "undefined") {
        window.location.href = "/aluno/login";
      }
    }
  }, []);

  return (
    <StudentAuthContext.Provider
      value={{ student, isAuthenticated, loading, signIn, signOut }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error("useStudentAuth must be used within a StudentAuthProvider");
  }
  return context;
};
