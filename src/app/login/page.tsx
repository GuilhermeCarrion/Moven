import { LoginForm } from "@/components/forms/LoginForm";

const CANVAS_BG =
  "linear-gradient(160deg, oklch(0.95 0.015 255), oklch(0.97 0.01 300) 45%, oklch(0.96 0.012 258))";

const bullets = [
  {
    num: "01",
    title: "Agendamentos sem fricção",
    desc: "Sua equipe e alunos sempre no horário certo.",
  },
  {
    num: "02",
    title: "WhatsApp automático",
    desc: "Confirmações e avisos enviados sozinhos.",
  },
  {
    num: "03",
    title: "Planos e créditos",
    desc: "Pacotes e validade organizados e no controle.",
  },
];

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

export default function LoginPage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
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

      {/* blobs ... (continuam iguais, depois do pontilhado) */}
      {/* blobs */}
      <div
        className="pointer-events-none absolute h-[620px] w-[620px] rounded-full"
        style={{
          top: -200,
          right: -160,
          background:
            "radial-gradient(circle, var(--brand-cyan), transparent 70%)",
          opacity: 0.22,
          filter: "blur(50px)",
        }}
      />
      <div
        className="pointer-events-none absolute h-[600px] w-[600px] rounded-full"
        style={{
          bottom: -260,
          left: -200,
          background:
            "radial-gradient(circle, var(--brand-yellow), transparent 72%)",
          opacity: 0.16,
          filter: "blur(50px)",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="flex w-full max-w-6xl flex-wrap items-center justify-center gap-12 lg:flex-nowrap lg:justify-between lg:gap-16">
          {/* Painel de marca (desktop) */}
          <div className="hidden flex-1 lg:block lg:max-w-xl">
            <BrandMark />
            <h1 className="mt-14 max-w-lg text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-800 lg:text-6xl">
              Movimente seu negócio.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-500">
              Alunos, agenda, planos e avisos por WhatsApp — tudo num só lugar,
              para a sua academia não parar.
            </p>
            <div className="mt-12 border-t border-slate-200/70">
              {bullets.map((b) => (
                <div
                  key={b.num}
                  className="flex items-baseline gap-5 border-b border-slate-200/70 py-5"
                >
                  <span className="text-sm font-bold tracking-wide text-[var(--primary)]">
                    {b.num}
                  </span>
                  <div>
                    <div className="text-base font-bold text-slate-800">
                      {b.title}
                    </div>
                    <div className="mt-1 text-sm leading-relaxed text-slate-500">
                      {b.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card do form */}
          <div className="w-full max-w-[420px]">
            <div className="mb-6 flex justify-center lg:hidden">
              <BrandMark />
            </div>

            <div
              className="rounded-3xl border border-white/50 bg-white/40 p-10 backdrop-blur-2xl backdrop-saturate-150"
              style={{
                boxShadow:
                  "0 30px 70px -25px rgba(8,90,120,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              <div className="mb-6 h-1 w-10 rounded-full bg-[var(--primary)]" />
              <h2 className="text-2xl font-extrabold text-slate-800">
                Bem-vindo de volta
              </h2>
              <p className="mt-1.5 mb-8 text-sm text-slate-500">
                Acesse sua conta para continuar a gestão.
              </p>

              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
