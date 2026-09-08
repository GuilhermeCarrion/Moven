"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import "./globals.css";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta
          name="facebook-domain-verification"
          content="qn4rogbvi01fydbz5d5fbns9pa1ynn"
        />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>

        {/* Razão social visível para verificação da empresa na Meta */}
        <footer className="fixed bottom-0 left-0 w-full text-center text-[10px] text-gray-400 py-1 pointer-events-none">
          RR RIBEIRO REPRESENTACOES COMERCIAIS LTDA — CNPJ 24.893.658/0001-38
        </footer>
      </body>
    </html>
  );
}
