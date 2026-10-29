import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bike,
  Dumbbell,
  Flame,
  Flower2,
  Music,
  PersonStanding,
  Swords,
  Waves,
  Wind,
  BellRing,
  CalendarCheck,
  Check,
  MessageCircle,
  Palette,
  Repeat,
  Smartphone,
} from "lucide-react";
import { CloudField } from "@/components/landing/CloudField";
import { MovenLogo } from "@/components/layout/MovenLogo";
import { Reveal } from "@/components/landing/Reveal";
import { ThemePreview } from "@/components/landing/ThemePreview";
import {
  AgendaMock,
  DashboardMock,
  InboxMock,
  PackageMock,
  PhoneFrame,
  PresenceMock,
  StudentPortalMock,
  WhatsAppChat,
} from "@/components/landing/mocks";

export const metadata = {
  title: "Moven — Gestão para academias e estúdios",
  description:
    "Alunos, agenda, planos, créditos e confirmação de presença automática pelo WhatsApp. Para academias de dança, luta, funcional, musculação e estúdios.",
};

// Contato comercial (mesmo telefone do rodapé)
const WHATSAPP_URL = "https://wa.me/5518997254407";
const waText = (text: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;

const navLinks = [
  { href: "#sistema", label: "Sistema" },
  { href: "#whatsapp", label: "WhatsApp" },
  { href: "#recursos", label: "Recursos" },
  { href: "#planos", label: "Planos" },
];

const segments = [
  { label: "Dança", icon: Music },
  { label: "Lutas", icon: Swords },
  { label: "Funcional", icon: Activity },
  { label: "Musculação", icon: Dumbbell },
  { label: "Pilates", icon: PersonStanding },
  { label: "Yoga", icon: Flower2 },
  { label: "Cross training", icon: Flame },
  { label: "Bungee", icon: Wind },
  { label: "Natação", icon: Waves },
  { label: "Spinning", icon: Bike },
];

const steps = [
  {
    icon: CalendarCheck,
    title: "O aluno agenda",
    desc: "Pela recepção ou pelo portal. A vaga é reservada e 1 crédito sai do pacote na hora.",
  },
  {
    icon: BellRing,
    title: "12h antes, o Moven pergunta",
    desc: "Uma mensagem no WhatsApp com os botões Confirmar e Cancelar. Ninguém da equipe precisa ligar.",
  },
  {
    icon: Repeat,
    title: "A agenda se ajusta sozinha",
    desc: "Confirmou, fica verde. Cancelou com antecedência, a vaga abre e o crédito volta.",
  },
];

const plans = [
  {
    name: "Básico",
    tagline: "Para organizar a casa",
    items: [
      "Alunos e professores",
      "Planos, pacotes e créditos",
      "Agenda, lotação e presença",
      "Painel com indicadores",
      "Suas cores e sua marca",
    ],
  },
  {
    name: "Inteligente",
    tagline: "Tudo do Básico, mais",
    highlight: true,
    items: [
      "Portal do aluno (agenda e cancela sozinho)",
      "Autocadastro por link",
      "Regras de cancelamento e estorno",
      "Histórico completo do aluno",
    ],
  },
  {
    name: "Automático",
    tagline: "Tudo do Inteligente, mais",
    items: [
      "Confirmação de presença no WhatsApp",
      "Boas-vindas e aviso de vencimento",
      "Inbox de mensagens no sistema",
      "Reenvio automático em caso de falha",
    ],
  },
];


function SectionTitle({
  eyebrow,
  title,
  desc,
  center = false,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className="mv-mono text-xs uppercase tracking-[0.18em] text-[var(--mv-brand-light)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      {desc && <p className="mt-5 text-lg leading-relaxed">{desc}</p>}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="mv-landing">
      {/* Camada de conteúdo: passa por cima do fundo de pontos e, no fim, do rodapé */}
      <div className="relative z-10 -mb-14 overflow-clip rounded-b-[40px] bg-[var(--mv-canvas)] shadow-[0_40px_80px_-30px_rgba(11,21,48,0.45)] md:rounded-b-[56px]">
        {/* Fundo parado (sticky) */}
        <div className="pointer-events-none sticky top-0 -mb-[100svh] h-[100svh]">
          <CloudField ambient />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--mv-canvas)] to-transparent" />
        </div>

        <div className="relative">
          {/* Header */}
          <header className="sticky top-0 z-50 px-4 pt-3">
            <nav className="mv-glass mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl py-2 pl-3 pr-2">
              <Link href="/" aria-label="Moven — início">
                <MovenLogo />
              </Link>
              <div className="hidden items-center gap-1 md:flex">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="mv-mono rounded-lg px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-white"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  href="/aluno"
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
                >
                  Sou aluno
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[var(--mv-ink)] transition-transform hover:-translate-y-0.5"
                >
                  Entrar
                </Link>
              </div>
            </nav>
          </header>

          {/* Hero */}
          <section className="-mt-16 px-2 pt-2 sm:px-3 sm:pt-3">
            <div className="relative flex h-[calc(100svh-16px)] min-h-[620px] flex-col items-center overflow-hidden rounded-[28px] border border-white/10 bg-[#06070b] px-5 pt-[22svh] text-center sm:h-[calc(100svh-24px)] sm:rounded-[36px] sm:pt-[20svh]">
              <div className="absolute inset-0">
                <CloudField />
              </div>
              <div className="relative">
                <span className="mv-mono inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--mv-brand)]" />
                  Gestão para academias
                </span>
                <h1 className="mt-5 text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">
                  Tudo o que move
                  <span className="mv-serif block font-normal italic tracking-[-0.02em] text-white/90">
                    sua academia.
                  </span>
                </h1>
                <p className="mx-auto mt-5 max-w-lg text-base leading-snug text-white/60 sm:text-lg">
                  Agenda, alunos, créditos e WhatsApp num só sistema. Você cuida das aulas; o
                  Moven cuida do resto.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <a
                    href={waText("Olá! Quero conhecer o Moven para a minha academia.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--mv-brand)] px-5 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Falar no WhatsApp
                  </a>
                  <a
                    href="#sistema"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/40 px-5 py-3 font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
                  >
                    Ver o sistema <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Fita de segmentos: blocos rolando, separados por linhas finas */}
          <section
            aria-label="Tipos de academia atendidos"
            className="mt-10 overflow-hidden border-y border-white/10 bg-white/[0.035] backdrop-blur-2xl [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
          >
            {/* Duas cópias da lista: a animação anda -50% e emenda sem corte */}
            <div className="mv-marquee flex w-max">
              {[...segments, ...segments].map((s, i) => (
                <div
                  key={i}
                  aria-hidden={i >= segments.length}
                  className="flex w-40 flex-col items-center justify-center gap-3 border-r border-white/10 py-8 sm:w-48 sm:py-10"
                >
                  <s.icon className="h-7 w-7 text-[var(--mv-brand-light)]" strokeWidth={1.5} />
                  <span className="text-sm font-semibold text-white">{s.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Sistema */}
          <section id="sistema" className="scroll-mt-24 px-5 pb-24 pt-20">
            <div className="mx-auto max-w-6xl">
              <SectionTitle
                center
                eyebrow="O sistema"
                title="Tudo o que acontece na academia, numa tela só."
                desc="Quem vem hoje, quais aulas lotaram, quem confirmou pelo WhatsApp e quem está com o plano vencendo."
              />
              <Reveal className="mt-12">
                <div className="mv-glass-strong rounded-[30px] p-2 md:p-2.5">
                  <DashboardMock />
                </div>
              </Reveal>
            </div>
          </section>

          {/* WhatsApp — faixa de ponta a ponta em vidro fosco */}
          <section
            id="whatsapp"
            className="scroll-mt-24 border-y border-white/10 bg-white/[0.035] backdrop-blur-2xl"
          >
            <Reveal>
              <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
                <div className="grid items-center gap-14 lg:grid-cols-[1fr_auto]">
                  <div>
                    <SectionTitle
                      eyebrow="WhatsApp automático"
                      title="A confirmação que sua recepção fazia no braço, agora sozinha."
                    />
                    <ol className="mt-10 space-y-3">
                      {steps.map((s, i) => (
                        <li
                          key={s.title}
                          className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md"
                        >
                          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-[var(--mv-brand)]">
                            <s.icon className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="font-bold text-white">
                              <span className="mr-2 text-white/40 tabular-nums">0{i + 1}</span>
                              {s.title}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-white/70">{s.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <PhoneFrame className="mx-auto w-full max-w-[340px]">
                    <WhatsAppChat />
                  </PhoneFrame>
                </div>
              </div>
            </Reveal>
          </section>

          {/* Recursos (bento) */}
          <section id="recursos" className="scroll-mt-24 px-5 py-24">
            <div className="mx-auto max-w-6xl">
              <SectionTitle
                eyebrow="Recursos"
                title="As regras da sua academia, aplicadas sem você lembrar delas."
              />
              <div className="mt-12 grid gap-4 md:grid-cols-6">
                <Reveal className="md:col-span-4">
                  <div className="mv-glass h-full rounded-[28px] p-5">
                    <h3 className="text-lg font-bold text-white">Agenda e lotação</h3>
                    <p className="mt-1 text-sm">
                      Capacidade por aula, vagas liberadas no cancelamento e nada de dois horários no mesmo
                      lugar.
                    </p>
                    <div className="mt-5">
                      <AgendaMock />
                    </div>
                  </div>
                </Reveal>
                <Reveal className="md:col-span-2" delay={80}>
                  <div className="mv-glass h-full rounded-[28px] p-5">
                    <h3 className="text-lg font-bold text-white">Planos e créditos</h3>
                    <p className="mt-1 text-sm">
                      Cada aula agendada desconta um crédito. Validade e saldo sempre à vista.
                    </p>
                    <div className="mt-5">
                      <PackageMock />
                    </div>
                  </div>
                </Reveal>
                <Reveal className="md:col-span-2">
                  <div className="mv-glass h-full rounded-[28px] p-5">
                    <h3 className="text-lg font-bold text-white">Presença em segundos</h3>
                    <p className="mt-1 text-sm">A chamada abre 30 minutos antes e fecha 30 depois da aula.</p>
                    <div className="mt-5">
                      <PresenceMock />
                    </div>
                  </div>
                </Reveal>
                <Reveal className="md:col-span-2" delay={80}>
                  <div className="mv-glass flex h-full flex-col overflow-hidden rounded-[28px] p-5 pb-0">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                      <Smartphone className="h-5 w-5 text-[var(--mv-brand)]" /> Portal do aluno
                    </h3>
                    <p className="mt-1 text-sm">
                      Entra com CPF e data de nascimento, agenda e cancela sem chamar a recepção.
                    </p>
                    <div className="mx-auto mt-5 w-52 translate-y-2 overflow-hidden rounded-t-[30px] border-x-[6px] border-t-[6px] border-white/80 shadow-xl">
                      <StudentPortalMock />
                    </div>
                  </div>
                </Reveal>
                <Reveal className="md:col-span-2" delay={160}>
                  <div className="mv-glass h-full rounded-[28px] p-5">
                    <h3 className="text-lg font-bold text-white">Mensagens no sistema</h3>
                    <p className="mt-1 text-sm">
                      As conversas do WhatsApp da academia, ligadas à ficha de cada aluno.
                    </p>
                    <div className="mt-5">
                      <InboxMock />
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Personalização por academia */}
          <section id="marca" className="scroll-mt-24 px-5 pb-24">
            <div className="mx-auto max-w-6xl">
              <Reveal>
                <ThemePreview />
              </Reveal>
            </div>
          </section>

          {/* Planos */}
          <section id="planos" className="scroll-mt-24 px-5 pb-24">
            <div className="mx-auto max-w-6xl">
              <SectionTitle
                center
                eyebrow="Planos"
                title="Comece pelo essencial. Ligue os módulos quando quiser."
              />
              <div className="mt-12 grid gap-4 lg:grid-cols-3">
                {plans.map((p, i) => (
                  <Reveal key={p.name} delay={i * 90}>
                    <div
                      className={`flex h-full flex-col rounded-[28px] p-7 ${
                        p.highlight
                          ? "bg-[var(--mv-brand-deep)] text-white ring-1 ring-[var(--mv-brand)] shadow-[0_40px_80px_-30px_var(--mv-brand)]"
                          : "mv-glass"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3
                          className={`text-2xl font-extrabold text-white`}
                        >
                          {p.name}
                        </h3>
                        {p.highlight && (
                          <span className="rounded-full bg-[var(--mv-accent)] px-2.5 py-1 text-xs font-bold text-white">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <p className={`mt-1 text-sm ${p.highlight ? "text-white/65" : ""}`}>{p.tagline}</p>
                      <p
                        className={`mt-6 text-3xl font-extrabold text-white`}
                      >
                        Sob consulta
                      </p>
                      <ul className="mt-6 flex-1 space-y-3">
                        {p.items.map((it) => (
                          <li key={it} className="flex gap-2.5 text-sm">
                            <Check
                              className={`mt-0.5 h-4 w-4 flex-shrink-0 ${p.highlight ? "text-[var(--mv-accent)]" : "text-[var(--mv-brand)]"}`}
                            />
                            <span className={p.highlight ? "text-white/85" : ""}>{it}</span>
                          </li>
                        ))}
                      </ul>
                      <a
                        href={waText(`Olá! Quero saber mais sobre o plano ${p.name} do Moven.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-8 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition-transform hover:-translate-y-0.5 ${
                          p.highlight
                            ? "bg-[var(--mv-brand)] text-white"
                            : "bg-white text-[var(--mv-ink)] ring-1 ring-slate-200"
                        }`}
                      >
                        Falar sobre o {p.name} <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* CTA final */}
          <section className="px-3 pb-16 md:px-5 md:pb-24">
            <Reveal>
              <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[var(--mv-brand)] px-6 py-16 text-center md:rounded-[48px] md:py-20">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: "radial-gradient(white 1px, transparent 1.4px)",
                    backgroundSize: "18px 18px",
                    maskImage: "radial-gradient(ellipse at center, black, transparent 75%)",
                    WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 75%)",
                  }}
                />
                <div className="relative">
                  <Palette className="mx-auto h-8 w-8 text-white/80" />
                  <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                    Bora colocar sua academia em movimento?
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                    Chama a gente no WhatsApp: mostramos o Moven funcionando com as aulas e as cores da
                    sua academia.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <a
                      href={waText("Olá! Quero ver o Moven funcionando na minha academia.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-[var(--mv-ink)] transition-transform hover:-translate-y-0.5"
                    >
                      <MessageCircle className="h-5 w-5 text-[#25d366]" />
                      Chamar no WhatsApp
                    </a>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/40 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      Já sou cliente
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>
        </div>
      </div>

      {/* Rodapé com dados da empresa (verificação Meta) — faz parte do fundo e é
          revelado quando o conteúdo termina. Conteúdo NÃO deve ser alterado. */}
      <footer className="sticky bottom-0 z-0 bg-[var(--mv-ink)] text-white/70">
        <div className="mx-auto max-w-6xl px-6 pb-10 pt-24 md:pt-28">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="text-xl font-extrabold text-white">Moven</span>
              <p className="mt-2 max-w-sm text-sm">
                Plataforma de gestão para academias e estúdios.
              </p>
              <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                <Link href="/privacidade" className="text-white underline-offset-4 hover:underline">
                  Política de Privacidade
                </Link>
                <Link href="/aluno" className="text-white/80 underline-offset-4 hover:text-white hover:underline">
                  Portal do aluno
                </Link>
                <Link href="/login" className="text-white/80 underline-offset-4 hover:text-white hover:underline">
                  Entrar
                </Link>
              </nav>
            </div>

            <div className="text-sm">
              <p className="font-bold text-white">
                RR RIBEIRO REPRESENTACOES COMERCIAIS LTDA
              </p>
              <p className="mt-1">CNPJ: 24.893.658/0001-38</p>
              <p>
                Endereço: América do Sul, nº 483, Vila Carvalho, Araçatuba/SP,
                16025-300
              </p>
              <p>Contato: rogeriorogeriosata@gmail.com · (18) 99725-4407</p>
            </div>
          </div>

          <p className="mt-10 border-t border-white/10 pt-6 text-xs">
            © {new Date().getFullYear()} RR RIBEIRO REPRESENTACOES COMERCIAIS
            LTDA. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
