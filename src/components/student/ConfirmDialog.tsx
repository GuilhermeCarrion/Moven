"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Voltar",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !open) return null;

  return createPortal(
    <>
      <div
        className="animate-in fade-in-0 fixed inset-0 z-[60] bg-[rgb(11_21_48/0.22)] backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="animate-in slide-in-from-bottom-6 sm:zoom-in-95 fixed inset-x-0 bottom-0 z-[70] rounded-t-[28px] border border-[var(--mv-glass-line)] bg-[var(--mv-surface)]/85 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[inset_0_1px_0_var(--mv-glass-hi),0_30px_60px_-20px_var(--mv-glass-shadow)] backdrop-blur-2xl backdrop-saturate-150 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-sm sm:rounded-[28px] sm:pb-6"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 id="confirm-title" className="text-center text-lg font-bold text-[var(--mv-text)]">
          {title}
        </h3>
        <p id="confirm-message" className="mt-2 text-center text-[var(--mv-text-soft)]">
          {message}
        </p>
        {/* celular: empilhado, ação em cima e "Voltar" embaixo */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
          <button
            onClick={onCancel}
            className="h-12 rounded-xl border sm:flex-1 border-[var(--mv-line)] bg-[var(--mv-surface)] font-semibold text-[var(--mv-text)] transition-colors hover:bg-[var(--mv-brand-50)]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="h-12 rounded-xl bg-red-600 sm:flex-1 font-semibold text-white transition-colors hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>,
    // dentro do .mv-app para herdar tokens, cor da academia e tema
    document.querySelector(".mv-app") ?? document.body,
  );
}
