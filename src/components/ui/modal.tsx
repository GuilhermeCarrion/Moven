"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode; // ações fixas embaixo, fora da rolagem (no mesmo vidro da janela)
}

/** Celular: gaveta que sobe de baixo. Desktop: janela central larga. */
export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [render, setRender] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => setMounted(true), []);

  // Controla o ciclo abrir -> fechar (mantém montado durante a saída)
  useEffect(() => {
    if (open) {
      setRender(true);
      setClosing(false);
    } else if (render) {
      setClosing(true);
      const t = setTimeout(() => setRender(false), 200);
      return () => clearTimeout(t);
    }
  }, [open, render]);

  // Esc + trava scroll enquanto aberto
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted || !render) return null;

  const backdropAnim = closing
    ? "animate-out fade-out-0"
    : "animate-in fade-in-0";
  const cardAnim = closing
    ? "animate-out fade-out-0 slide-out-to-bottom-6 sm:slide-out-to-bottom-0 sm:zoom-out-95"
    : "animate-in fade-in-0 slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      {/* Fundo embaçado */}
      <div
        className={`${backdropAnim} fixed inset-0 bg-[rgb(11_21_48/0.22)] duration-200`}
        onClick={onClose}
      />

      {/* Sheet / card em vidro: a página aparece desfocada por trás */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`${cardAnim} relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] border border-[var(--mv-glass-line)] bg-[var(--mv-surface)]/70 shadow-[inset_0_1px_0_var(--mv-glass-hi),0_30px_70px_-25px_rgb(11_21_48/0.55)] backdrop-blur-2xl backdrop-saturate-150 duration-200 sm:max-h-[88vh] sm:max-w-3xl sm:rounded-[28px]`}
      >
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-[var(--mv-line)] sm:hidden" />

        <div className="flex items-start justify-between gap-3 border-b border-[var(--mv-line)] px-5 py-4 sm:px-7 sm:py-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[var(--mv-text)] sm:text-2xl sm:tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-[var(--mv-text-soft)]">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[var(--mv-text-soft)] transition-colors hover:bg-[var(--mv-brand-50)] hover:text-[var(--mv-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:px-7 sm:py-6">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-[var(--mv-line)] px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-7 sm:pb-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    // Dentro do .mv-app: herda os tokens, a cor da academia e o tema escuro
    document.querySelector(".mv-app") ?? document.body,
  );
}
