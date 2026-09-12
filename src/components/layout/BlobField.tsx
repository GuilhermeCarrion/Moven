"use client";

import { usePathname } from "next/navigation";

const routes = [
  "/dashboard",
  "/alunos",
  "/professores",
  "/planos",
  "/agendamentos",
  "/mensagens",
];

export function BlobField() {
  const pathname = usePathname();

  const idx = Math.max(
    0,
    routes.findIndex((r) => pathname === r || pathname.startsWith(r + "/")),
  );
  const shift = (idx - (routes.length - 1) / 2) * 48;

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 transition-transform duration-700 ease-out"
      style={{ top: -200, bottom: -200, transform: `translateY(${shift}px)` }}
    >
      {/* Azul forte, em cima */}
      <div
        className="absolute h-[640px] w-[640px] rounded-full"
        style={{
          top: -10,
          left: 0,
          background:
            "radial-gradient(circle, var(--brand-cyan), transparent 70%)",
          opacity: 0.18,
          filter: "blur(60px)",
        }}
      />

      {/* Amarelo */}
      <div
        className="absolute h-[600px] w-[600px] rounded-full"
        style={{
          bottom: -100,
          left: 20,
          background:
            "radial-gradient(circle, var(--brand-yellow), transparent 72%)",
          opacity: 0.3,
          filter: "blur(50px)",
        }}
      />

      {/* Azul claro */}
      <div
        className="absolute h-[600px] w-[600px] rounded-full"
        style={{
          top: "30%",
          right: "18%",
          background:
            "radial-gradient(circle, oklch(0.75 0.14 200), transparent 72%)",
          opacity: 0.18,
          filter: "blur(45px)",
        }}
      />
    </div>
  );
}
