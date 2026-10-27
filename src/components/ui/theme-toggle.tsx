"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/** Alterna claro/escuro. O ícone troca por CSS (dark:), sem estado = sem erro de hidratação. */
export function ThemeToggle({
  className = "mv-glass flex h-10 w-10 items-center justify-center rounded-xl text-[var(--mv-text)] transition-transform hover:-translate-y-0.5",
}: {
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Alternar tema claro ou escuro"
      title="Tema claro/escuro"
      className={className}
    >
      <Sun className="hidden h-[18px] w-[18px] dark:block" />
      <Moon className="h-[18px] w-[18px] dark:hidden" />
    </button>
  );
}
