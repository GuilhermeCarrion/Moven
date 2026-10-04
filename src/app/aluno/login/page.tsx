import { StudentLoginForm } from "@/components/student/StudentLoginForm";

const CANVAS_BG =
  "linear-gradient(160deg, oklch(0.95 0.015 255), oklch(0.97 0.01 300) 45%, oklch(0.96 0.012 258))";

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex h-11 w-11 items-center justify-center rounded-xl"
        style={{
          background: "var(--brand-cyan)",
          boxShadow: "0 8px 20px -6px var(--brand-cyan)",
        }}
      >
        <div
          className="absolute h-2 w-4 rounded bg-white"
          style={{ transform: "rotate(-30deg)", top: 13, left: 8 }}
        />
        <div
          className="absolute h-2 w-4 rounded bg-white"
          style={{ transform: "rotate(-30deg)", bottom: 12, right: 7 }}
        />
      </div>
      <span className="text-2xl font-extrabold tracking-tight text-slate-800">
        Moven
      </span>
    </div>
  );
}

export default function StudentLoginPage() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-6"
      style={{ background: CANVAS_BG }}
    >
      {/* Pontilhado de fundo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(100,130,160,0.25) 1px, transparent 1.5px)",
          backgroundSize: "22px 22px",
          opacity: 0.5,
        }}
      />

      {/* blobs */}
      <div
        className="pointer-events-none absolute h-[520px] w-[520px] rounded-full"
        style={{
          top: -180,
          right: -140,
          background:
            "radial-gradient(circle, var(--brand-cyan), transparent 70%)",
          opacity: 0.22,
          filter: "blur(50px)",
        }}
      />
      <div
        className="pointer-events-none absolute h-[500px] w-[500px] rounded-full"
        style={{
          bottom: -220,
          left: -180,
          background:
            "radial-gradient(circle, var(--brand-yellow), transparent 72%)",
          opacity: 0.16,
          filter: "blur(50px)",
        }}
      />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-6 flex justify-center">
          <BrandMark />
        </div>

        <div
          className="rounded-3xl border border-white/50 bg-white/40 p-8 backdrop-blur-2xl backdrop-saturate-150"
          style={{
            boxShadow:
              "0 30px 70px -25px rgba(8,90,120,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <div className="mb-6 h-1 w-10 rounded-full bg-[var(--primary)]" />
          <h2 className="text-2xl font-extrabold text-slate-800">
            Área do aluno
          </h2>
          <p className="mt-1.5 mb-8 text-sm text-slate-500">
            Entre com seu CPF e data de nascimento.
          </p>

          <StudentLoginForm />
        </div>
      </div>
    </div>
  );
}
