"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(function PasswordInput({ className, ...props }, ref) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        type={show ? "text" : "password"}
        className={cn(
          "h-11 w-full min-w-0 rounded-xl border border-[var(--mv-line)] bg-[var(--mv-field)] pl-3.5 pr-11 text-base text-[var(--mv-text)] transition-colors outline-none placeholder:text-[var(--mv-text-soft)]/70 focus-visible:border-[var(--mv-brand)] focus-visible:ring-4 focus-visible:ring-[var(--mv-brand)]/15 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />

      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--mv-text-soft)] transition-colors hover:text-[var(--mv-text)]"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
