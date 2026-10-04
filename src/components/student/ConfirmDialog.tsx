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
        className="animate-in fade-in-0 fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="animate-in slide-in-from-bottom fixed inset-x-0 bottom-0 z-[70] rounded-t-3xl border-t border-white/60 bg-white/90 p-6 pb-8 shadow-2xl backdrop-blur-2xl sm:inset-0 sm:m-auto sm:h-fit sm:max-w-sm sm:rounded-3xl sm:border">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="text-center text-lg font-extrabold text-slate-800">
          {title}
        </h3>
        <p className="mt-2 text-center text-sm text-slate-500">{message}</p>
        <div className="mt-6 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/60 bg-white/70 py-2.5 text-sm font-semibold text-slate-600"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
