"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import "./globals.css";

const queryClient = new QueryClient();

// shortcut: escuro liberado só nas telas já refeitas; incluir rota a rota
const themedRoutes = [
  "/dashboard",
  "/alunos",
  "/professores",
  "/planos",
  "/agendamentos",
  "/mensagens",
  "/usuarios",
  "/perfil",
  "/configuracoes",
  "/aluno/login",
  "/aluno/aulas",
  "/aluno/minhas-aulas",
  "/aluno/perfil",
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta
          name="facebook-domain-verification"
          content="qn4rogbvi01fydbz5d5fbns9pa1ynn"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="MovenLogo.png" type="image/x-icon" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="mv-theme"
          forcedTheme={
            pathname.startsWith("/login") || themedRoutes.includes(pathname)
              ? undefined
              : "light"
          }
        >
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              {children}
              <Toaster position="top-center" />
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
