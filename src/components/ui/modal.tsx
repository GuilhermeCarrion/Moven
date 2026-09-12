"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: ModalProps) {
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
    ? "animate-out fade-out-0 slide-out-to-bottom-6 sm:zoom-out-95"
    : "animate-in fade-in-0 slide-in-from-bottom-6 sm:zoom-in-95";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Fundo embaçado */}
      <div
        className={`${backdropAnim} fixed inset-0 bg-slate-500/10 backdrop-blur-md duration-200`}
        onClick={onClose}
      />

      {/* Sheet / card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          boxShadow:
            "0 24px 60px -20px rgba(8,90,120,0.35), inset 0 1px 0 rgba(255,255,255,0.7)",
        }}
        className={`${cardAnim} relative z-10 flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-t-3xl border border-white/70 bg-white/55 backdrop-blur-2xl backdrop-saturate-150 duration-200 sm:max-h-[90vh] sm:rounded-2xl`}
      >
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-slate-300 sm:hidden" />

        <div className="flex items-center justify-between p-5 pb-1">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/60 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
