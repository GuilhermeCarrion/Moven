import {
  Calendar,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronLeft,
  ClipboardList,
  EllipsisVertical,
  GraduationCap,
  House,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Phone,
  Settings,
  ShieldCheck,
  Smile,
  User,
  Users,
  Video,
} from "lucide-react";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { CloudField } from "@/components/landing/CloudField";
import { dashboardData } from "@/components/landing/dashboardData";

/**
 * Telas fictícias do sistema para a landing. Dados inventados, mas seguindo
 * as regras reais (créditos, lotação, janela de presença, confirmação 12h antes).
 */

const avatarColors = ["#f97316", "#8b5cf6", "#10b981", "#ec4899", "#0ea5e9"];

export function Avatar({ name, i = 0, size = 28 }: { name: string; i?: number; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span
      className="inline-flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white ring-2 ring-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: avatarColors[i % avatarColors.length],
      }}
    >
      {initials}
    </span>
  );
}

function Occupancy({ booked, capacity }: { booked: number; capacity: number }) {
  const full = booked >= capacity;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className="h-full rounded-full"
          style={{
            width: `${(booked / capacity) * 100}%`,
            background: full ? "var(--mv-accent)" : "var(--mv-brand)",
          }}
        />
      </div>
      <span
        className={`text-[10px] font-semibold tabular-nums ${full ? "text-[var(--mv-accent)]" : "text-slate-500"}`}
      >
        {full ? "Lotada" : `${booked}/${capacity}`}
      </span>
    </div>
  );
}

/* ───────────── Dashboard ───────────── */

const sideItems = [
  { icon: LayoutDashboard, label: "Início" },
  { icon: Users, label: "Alunos" },
  { icon: GraduationCap, label: "Professores" },
  { icon: ClipboardList, label: "Planos" },
  { icon: Calendar, label: "Agendamentos" },
  { icon: MessageSquare, label: "Mensagens" },
  { icon: ShieldCheck, label: "Usuários" },
  { icon: Settings, label: "Configurações" },
];

/**
 * A tela de início do painel (o mesmo componente da /dashboard) com dados fictícios.
 * `inert`: é vitrine, nada clica nem recebe foco. O zoom encaixa a tela real: largura de celular no
 * celular (0.85) e o painel em tela cheia no desktop (0.8).
 */
export function DashboardMock() {
  return (
    <div
      inert
      className="mv-app mv-canvas flex max-h-[620px] overflow-hidden rounded-[22px] text-left [mask-image:linear-gradient(to_bottom,black_88%,transparent)] [zoom:0.85] lg:max-h-[600px] lg:[zoom:0.8]"
    >
      {/* Sidebar do painel, sem o rodapé do usuário (fica na parte cortada).
          Sem backdrop-filter: no Chrome ele escapa da máscara do pai e a sidebar não some no degradê */}
      <aside className="mv-glass m-3 mr-0 hidden w-64 flex-shrink-0 flex-col overflow-hidden rounded-[24px] [backdrop-filter:none] lg:flex">
        <div className="flex h-[72px] items-center gap-3 px-4">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--mv-brand)] text-xs font-extrabold text-white shadow-[0_8px_18px_-8px_var(--mv-brand)]">
            SR
          </span>
          <div>
            <p className="text-[15px] font-bold">Studio Ritmo</p>
            <p className="mv-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mv-text-soft)]">
              Painel
            </p>
          </div>
        </div>
        <div className="relative flex-1">
          <div
            aria-hidden
            className="absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent)]"
            style={{ "--mv-ambient-alpha": 0.55 } as React.CSSProperties}
          >
            <CloudField ambient spotlight={false} />
          </div>
          <nav className="relative space-y-1 px-3 py-2">
            <p className="mv-mono pb-1 pl-3 text-[10px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)]">
              Menu
            </p>
            {sideItems.map((it, i) => (
              <div
                key={it.label}
                className={`relative flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] ${
                  i === 0
                    ? "bg-[var(--mv-brand-100)] font-semibold text-[var(--mv-brand-700)]"
                    : "text-[var(--mv-text-soft)]"
                }`}
              >
                {i === 0 && (
                  <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[var(--mv-brand)]" />
                )}
                <it.icon className="h-5 w-5" />
                {it.label}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1 p-3 sm:p-5">
        <DashboardOverview
          data={dashboardData}
          nowMin={12 * 60 + 20}
          greeting="Boa tarde,"
          name="Renata"
          dateLabel="quinta-feira, 22 de outubro"
        />
      </div>
    </div>
  );
}

const today = [
  { h: "07:00", name: "Funcional", prof: "Rafa", b: 12, c: 12 },
  { h: "09:30", name: "Pilates", prof: "Marina", b: 7, c: 10 },
  { h: "18:00", name: "Muay Thai", prof: "Diego", b: 15, c: 16 },
  { h: "19:00", name: "Dança", prof: "Júlia", b: 20, c: 20 },
];

/* ───────────── Celular + WhatsApp ───────────── */

export function PhoneFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-[44px] border border-white/70 bg-white/40 p-2.5 shadow-[0_40px_80px_-30px_rgba(11,21,48,0.55)] backdrop-blur-xl ${className}`}
    >
      <div className="relative overflow-hidden rounded-[36px] bg-white">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
        {children}
      </div>
    </div>
  );
}

function Bubble({
  side,
  time,
  children,
}: {
  side: "in" | "out";
  time: string;
  children: React.ReactNode;
}) {
  const out = side === "out";
  return (
    <div className={`flex ${out ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-xl px-2.5 py-1.5 text-[12px] leading-snug text-[#111b21] shadow-sm ${
          out ? "rounded-tr-sm bg-[#d9fdd3]" : "rounded-tl-sm bg-white"
        }`}
      >
        {children}
        <span className="float-right ml-2 mt-1 flex items-center gap-0.5 text-[9px] text-slate-400">
          {time}
          {out && <CheckCheck className="h-3 w-3 text-sky-500" />}
        </span>
      </div>
    </div>
  );
}

export function WhatsAppChat() {
  return (
    <div className="flex h-[560px] flex-col text-left">
      <div className="flex items-center gap-2 bg-[#f0f2f5] px-3 pb-2.5 pt-10">
        <ChevronLeft className="h-5 w-5 text-[#54656f]" />
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--mv-brand)] text-[10px] font-extrabold text-white">
          SR
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#111b21]">Studio Ritmo</p>
          <p className="text-[10px] text-[#667781]">Conta comercial</p>
        </div>
        <Video className="h-4 w-4 text-[#54656f]" />
        <Phone className="ml-2 h-4 w-4 text-[#54656f]" />
        <EllipsisVertical className="ml-1 h-4 w-4 text-[#54656f]" />
      </div>

      <div
        className="flex flex-1 flex-col gap-2 overflow-hidden px-3 py-3"
        style={{
          background: "#efeae2",
          backgroundImage: "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1.2px)",
          backgroundSize: "14px 14px",
        }}
      >
        <span className="mx-auto rounded-md bg-white/90 px-2 py-0.5 text-[10px] text-[#54656f] shadow-sm">
          HOJE
        </span>

        <div className="flex justify-start">
          <div className="max-w-[86%] overflow-hidden rounded-xl rounded-tl-sm bg-white text-[12px] leading-snug text-[#111b21] shadow-sm">
            <p className="px-2.5 pt-2">
              Olá, Ana! 👋 Lembrete da sua aula de <b>Dança</b> amanhã, <b>19h</b>, com a prof.
              Júlia.
              <br />
              Você confirma presença?
            </p>
            <p className="px-2.5 pb-1.5 text-right text-[9px] text-slate-400">07:00</p>
            <div className="grid grid-cols-2 border-t border-slate-100 text-center text-[12px] font-medium text-[#027eb5]">
              <span className="border-r border-slate-100 py-2">Confirmar</span>
              <span className="py-2">Cancelar</span>
            </div>
          </div>
        </div>

        <Bubble side="out" time="07:12">
          Confirmar
        </Bubble>

        <Bubble side="in" time="07:12">
          Presença confirmada ✅ Até amanhã, Ana!
        </Bubble>

        <span className="mx-auto mt-1 rounded-md bg-[#fff3c4] px-2 py-1 text-[10px] text-[#54656f] shadow-sm">
          Agenda atualizada automaticamente
        </span>

        <div className="mt-auto flex justify-start">
          <div className="rounded-xl rounded-tl-sm bg-white px-2.5 py-1.5 text-[12px] leading-snug text-[#111b21] shadow-sm">
            Seu plano <b>8 aulas</b> vence em 3 dias. Quer renovar? 🙂
            <span className="float-right ml-2 mt-1 text-[9px] text-slate-400">09:30</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-[#f0f2f5] px-2.5 py-2">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] text-slate-400">
          <Smile className="h-4 w-4" /> Mensagem
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00a884] text-white">
          <Mic className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

/* ───────────── Cards do bento ───────────── */

const days = [
  { d: "Seg", n: 20 },
  { d: "Ter", n: 21 },
  { d: "Qua", n: 22 },
  { d: "Qui", n: 23, active: true },
  { d: "Sex", n: 24 },
  { d: "Sáb", n: 25 },
];

export function AgendaMock() {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-3.5">
      <div className="flex gap-1.5">
        {days.map((d) => (
          <div
            key={d.n}
            className={`flex flex-1 flex-col items-center rounded-xl py-1.5 ${
              d.active ? "bg-[var(--mv-brand)] text-white" : "text-slate-500"
            }`}
          >
            <span className="text-[9px] uppercase">{d.d}</span>
            <span className="text-sm font-bold tabular-nums">{d.n}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {today.map((c, i) => (
          <div key={c.h} className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tabular-nums text-slate-400">{c.h}</span>
              <div className="flex -space-x-1.5">
                {[0, 1, 2].map((a) => (
                  <Avatar key={a} name={["Ana S", "Leo M", "Iris P"][a]} i={i + a} size={18} />
                ))}
              </div>
            </div>
            <p className="mt-1 text-xs font-semibold text-[var(--mv-ink)]">{c.name}</p>
            <div className="mt-1.5">
              <Occupancy booked={c.b} capacity={c.c} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PackageMock() {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
      <div className="flex items-center gap-2.5">
        <Avatar name="Ana Souza" i={0} size={32} />
        <div>
          <p className="text-xs font-bold text-[var(--mv-ink)]">Ana Souza</p>
          <p className="text-[10px] text-slate-400">Pacote 8 aulas</p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-700">
          Ativo
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-3xl font-extrabold tabular-nums text-[var(--mv-ink)]">
          6<span className="text-base font-bold text-slate-300">/8</span>
        </p>
        <p className="text-[10px] text-slate-400">vence em 18 dias</p>
      </div>
      <div className="mt-2 grid grid-cols-8 gap-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="h-2 rounded-full"
            style={{ background: i < 6 ? "var(--mv-brand)" : "var(--mv-brand-100)" }}
          />
        ))}
      </div>
    </div>
  );
}

const presence = [
  { n: "Ana Souza", ok: true },
  { n: "Leo Martins", ok: true },
  { n: "Iris Prado", ok: false },
];

export function PresenceMock() {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-3.5">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        Janela de presença aberta · 18:30–19:30
      </p>
      {presence.map((p, i) => (
        <div key={p.n} className="flex items-center gap-2 py-1.5">
          <Avatar name={p.n} i={i} size={22} />
          <span className="flex-1 text-[11px] font-medium text-[var(--mv-ink)]">{p.n}</span>
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-md ${
              p.ok ? "bg-[var(--mv-brand)] text-white" : "border border-slate-300"
            }`}
          >
            {p.ok && <Check className="h-3 w-3" />}
          </span>
        </div>
      ))}
    </div>
  );
}

const convs = [
  { n: "Ana Souza", m: "Confirmar", t: "07:12", u: 0 },
  { n: "Pedro Alves", m: "Tem aula de luta sábado?", t: "08:40", u: 2 },
  { n: "Bia Costa", m: "Quero renovar o plano!", t: "09:31", u: 1 },
];

export function InboxMock() {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-2">
      {convs.map((c, i) => (
        <div key={c.n} className={`flex items-center gap-2.5 rounded-xl p-2 ${i === 1 ? "bg-[var(--mv-brand-50)]" : ""}`}>
          <Avatar name={c.n} i={i + 1} size={28} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-[var(--mv-ink)]">{c.n}</p>
            <p className="truncate text-[10px] text-slate-400">{c.m}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] text-slate-400">{c.t}</span>
            {c.u > 0 && (
              <span className="rounded-full bg-[#25d366] px-1.5 text-[9px] font-bold text-white">{c.u}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StudentPortalMock() {
  return (
    <div className="flex h-[300px] flex-col bg-slate-50 pt-9 text-left">
      <div className="px-3">
        <p className="text-[10px] text-slate-400">Olá, Ana</p>
        <div className="mt-1 flex items-center justify-between rounded-xl bg-[var(--mv-brand)] px-3 py-2 text-white">
          <span className="text-[10px] font-medium text-white/85">Seus créditos</span>
          <span className="text-sm font-extrabold">6</span>
        </div>
      </div>
      <div className="mt-2 flex-1 space-y-1.5 px-3">
        {[
          { h: "18:00", n: "Muay Thai", a: "Agendar" },
          { h: "19:00", n: "Dança", a: "Confirmada" },
        ].map((c) => (
          <div key={c.h} className="flex items-center justify-between rounded-xl bg-white p-2 shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-[var(--mv-ink)]">{c.n}</p>
              <p className="text-[9px] text-slate-400">{c.h}</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                c.a === "Agendar"
                  ? "bg-[var(--mv-brand)] text-white"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {c.a}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 border-t border-slate-200 bg-white py-2 text-center text-[9px] text-slate-400">
        <span className="flex flex-col items-center gap-0.5 font-semibold text-[var(--mv-brand)]">
          <House className="h-3.5 w-3.5" /> Aulas
        </span>
        <span className="flex flex-col items-center gap-0.5">
          <CalendarDays className="h-3.5 w-3.5" /> Minhas aulas
        </span>
        <span className="flex flex-col items-center gap-0.5">
          <User className="h-3.5 w-3.5" /> Perfil
        </span>
      </div>
    </div>
  );
}
