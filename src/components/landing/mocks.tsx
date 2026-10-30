"use client";

import {
  BadgeCheck,
  BatteryFull,
  Calendar,
  CalendarClock,
  Camera,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Phone,
  Plus,
  Reply,
  Settings,
  ShieldCheck,
  Signal,
  Sticker,
  Ticket,
  Users,
  Video,
  Wifi,
  X,
} from "lucide-react";
import Image from "next/image";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { inboxPanel } from "@/components/inbox/ConversationList";
import { CloudField } from "@/components/landing/CloudField";
import { dashboardData } from "@/components/landing/dashboardData";
import { primary } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { initials } from "@/components/layout/Sidebar";
import { DayAgenda } from "@/components/schedule/DayAgenda";
import { MonthCalendar } from "@/components/schedule/MonthCalendar";
import { apptStatus, pill, pillOff } from "@/components/schedule/SessionDetail";
import { PackageCard } from "@/components/student/PackageCard";
import { CreditsRing } from "@/components/student/StudentHeader";
import type { ClassSession } from "@/types/models";

/**
 * Telas do sistema para a landing, no design real (componentes do painel/portal quando eles só
 * recebem props; réplica com as mesmas classes quando dependem de login e API). Dados fictícios.
 * Tudo `inert`: é vitrine, nada clica nem recebe foco.
 */

// Datas montadas no fuso local de quem renderiza: servidor e navegador mostram o mesmo horário.
// O dia é o mesmo da prévia da dashboard (quinta, 22/10, 12:20).
const DAY = new Date(2026, 9, 22);
const NOW = new Date(2026, 9, 22, 12, 20);
const noop = () => {};

/* ───────────── Sidebar do painel ───────────── */

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

/** Sidebar do painel, sem o rodapé do usuário (fica na parte cortada das prévias). */
function PanelSidebar({ active, className = "hidden lg:flex" }: { active: string; className?: string }) {
  return (
    // Sem backdrop-filter: no Chrome ele escapa da máscara do pai e a sidebar não some no degradê
    <aside
      className={`mv-glass m-3 mr-0 w-64 flex-shrink-0 flex-col overflow-hidden rounded-[24px] [backdrop-filter:none] ${className}`}
    >
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
          {sideItems.map((it) => {
            const on = it.label === active;
            return (
              <div
                key={it.label}
                className={`relative flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] ${
                  on
                    ? "bg-[var(--mv-brand-100)] font-semibold text-[var(--mv-brand-700)]"
                    : "text-[var(--mv-text-soft)]"
                }`}
              >
                {on && (
                  <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[var(--mv-brand)]" />
                )}
                <it.icon className="h-5 w-5" />
                {it.label}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

/* ───────────── Dashboard ───────────── */

const dashboardProps = {
  data: dashboardData,
  nowMin: 12 * 60 + 20,
  greeting: "Boa tarde,",
  name: "Renata",
  dateLabel: "quinta-feira, 22 de outubro",
};

/**
 * A tela de início do painel (o mesmo componente da /dashboard). Desktop: o painel cortado,
 * com zoom 0.8 para parecer a tela cheia. Celular/tablet: um iPhone inteiro com a versão mobile.
 */
export function DashboardMock() {
  return (
    <>
      <div className="mv-glass-strong hidden rounded-[30px] p-2.5 lg:block">
        <div
          inert
          className="mv-app mv-canvas flex max-h-[600px] overflow-hidden rounded-[22px] text-left [mask-image:linear-gradient(to_bottom,black_88%,transparent)] [zoom:0.8]"
        >
          <PanelSidebar active="Início" />
          <div className="min-w-0 flex-1 p-5">
            <DashboardOverview {...dashboardProps} compact />
          </div>
        </div>
      </div>

      <PhoneFrame className="mx-auto w-full max-w-[340px] lg:hidden">
        {/* 812px = altura de um iPhone; o zoom põe a tela em largura de celular (~375px) */}
        <div inert className="mv-app mv-canvas relative h-[812px] overflow-hidden text-left [zoom:0.85]">
          <StatusBar className="h-[42px]" />
          <div className="p-3">
            <DashboardOverview {...dashboardProps} />
          </div>
          {/* barra de baixo do painel no celular (mesmas abas e classes do BottomNav) */}
          <nav className="mv-glass absolute inset-x-2 bottom-6 flex rounded-[22px]">
            {[...primary, { label: "Mais", icon: MoreHorizontal }].map((p, i) => (
              <span
                key={p.label}
                className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] ${
                  i === 0 ? "font-semibold text-[var(--mv-brand-700)]" : "text-[var(--mv-text-soft)]"
                }`}
              >
                {i === 0 && <span className="absolute top-0 h-1 w-8 rounded-b-full bg-[var(--mv-brand)]" />}
                <p.icon className="h-5 w-5" />
                {p.label}
              </span>
            ))}
          </nav>
          <span className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-black" />
        </div>
      </PhoneFrame>
    </>
  );
}

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
        <span className="float-right ml-2 mt-1.5 flex items-center gap-0.5 text-[9.5px] text-[#667781]">
          {time}
          {out && <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />}
        </span>
      </div>
    </div>
  );
}

/** Barra de status do iPhone; a altura alinha a hora e os ícones com a ilha do PhoneFrame. */
function StatusBar({ className }: { className: string }) {
  return (
    <div className={`flex items-center justify-between px-7 text-[12.5px] font-semibold ${className}`}>
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <Signal className="h-3.5 w-3.5" strokeWidth={2.5} />
        <Wifi className="h-3.5 w-3.5" strokeWidth={2.5} />
        <BatteryFull className="h-4 w-4" />
      </span>
    </div>
  );
}

function DayPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-auto rounded-lg bg-white/95 px-2.5 py-1 text-[10.5px] font-medium text-[#54656f] shadow-sm">
      {children}
    </span>
  );
}

/** Conversa no WhatsApp do iPhone (combina com a ilha do PhoneFrame): status, cabeçalho, chat e teclado. */
export function WhatsAppChat() {
  return (
    <div className="flex h-[640px] flex-col bg-[#f6f6f6] text-left text-[#111b21]">
      <StatusBar className="h-9" />

      <div className="flex items-center gap-2 border-b border-black/[0.06] px-2 pb-2 pt-1">
        <span className="flex items-center text-[13px] font-medium">
          <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
          12
        </span>
        <span className="ml-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--mv-brand)] text-[11px] font-extrabold text-white">
          SR
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="flex items-center gap-1 text-[14px] font-semibold">
            <span className="truncate">Studio Ritmo</span>
            <BadgeCheck className="h-4 w-4 flex-shrink-0 fill-[#1d9bf0] text-white" />
          </p>
          <p className="truncate text-[11px] text-[#667781]">Conta comercial</p>
        </div>
        <Video className="h-[22px] w-[22px]" strokeWidth={1.75} />
        <Phone className="ml-3 mr-1 h-5 w-5" strokeWidth={1.75} />
      </div>

      {/* Chat ancorado embaixo, como uma conversa rolada até o fim */}
      <div
        className="flex flex-1 flex-col justify-end gap-1.5 overflow-hidden px-3 py-3"
        style={{
          background: "#efeae2",
          backgroundImage: "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1.2px)",
          backgroundSize: "14px 14px",
        }}
      >
        <p className="mx-auto max-w-[90%] rounded-lg bg-[#ffeecd] px-3 py-1.5 text-center text-[10.5px] leading-snug text-[#54656f]">
          <Lock className="mr-1 inline h-3 w-3 align-[-1px]" />
          As mensagens e as ligações são protegidas com a criptografia de ponta a ponta.
        </p>

        <DayPill>Ontem</DayPill>
        <Bubble side="in" time="18:42">
          Oi, Ana! Que bom ter você no <b>Studio Ritmo</b> 💙 Seu pacote de 8 aulas já está ativo.
        </Bubble>

        <DayPill>Hoje</DayPill>
        {/* Template com respostas rápidas: os botões ficam no mesmo balão, separados por linhas */}
        <div className="max-w-[86%] overflow-hidden rounded-xl rounded-tl-none bg-white text-[12px] leading-snug shadow-sm">
          <p className="px-2.5 pb-1.5 pt-2">
            Olá, Ana! 👋 Lembrete da sua aula de <b>Dança</b> amanhã, <b>19h</b>, com a prof. Júlia.
            <br />
            Você confirma presença?
            <span className="float-right ml-2 mt-1.5 text-[9.5px] text-[#667781]">07:00</span>
          </p>
          {["Confirmar", "Cancelar"].map((b) => (
            <span
              key={b}
              className="flex items-center justify-center gap-1.5 border-t border-black/[0.08] py-2 text-[12.5px] font-medium text-[#027eb5]"
            >
              <Reply className="h-3.5 w-3.5" /> {b}
            </span>
          ))}
        </div>

        <Bubble side="out" time="07:12">
          {/* resposta rápida cita a mensagem original */}
          <span className="mb-1 block rounded-md border-l-4 border-[#06cf9c] bg-[#cfe9c7] px-2 py-1 text-[10.5px] leading-snug">
            <b className="block text-[#06a77d]">Studio Ritmo</b>
            <span className="line-clamp-1 text-[#54656f]">Olá, Ana! 👋 Lembrete da sua aula de Dança…</span>
          </span>
          Confirmar
        </Bubble>

        <Bubble side="in" time="07:12">
          Presença confirmada ✅ Até amanhã às 19h, Ana!
        </Bubble>
      </div>

      {/* Teclado fechado: +, campo com figurinha, câmera e microfone; indicador de início do iPhone */}
      <div className="flex items-center gap-3 px-3 pt-2">
        <Plus className="h-6 w-6" strokeWidth={1.75} />
        <span className="flex flex-1 items-center justify-end rounded-full border border-black/10 bg-white px-2.5 py-1.5">
          <Sticker className="h-4 w-4 text-[#54656f]" />
        </span>
        <Camera className="h-[22px] w-[22px]" strokeWidth={1.75} />
        <Mic className="h-[22px] w-[22px]" strokeWidth={1.75} />
      </div>
      <span className="mx-auto mb-2 mt-4 h-1 w-28 rounded-full bg-black" />
    </div>
  );
}

/* ───────────── Cards de Recursos ───────────── */

/** Moldura das telas do sistema dentro dos cards: tema claro do app, sem clique. */
function Screen({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div inert className={`mv-app mv-canvas overflow-hidden rounded-2xl text-left ${className}`}>
      {children}
    </div>
  );
}

const ses = (
  id: string,
  name: string,
  h: number,
  professor: string,
  booked: number,
  capacity: number,
  minCapacity = 4,
): ClassSession => ({
  id,
  academyId: "",
  professorId: "",
  name,
  startAt: new Date(2026, 9, 22, h).toISOString(),
  durationMin: 60,
  capacity,
  minCapacity,
  status: "OPEN",
  professor: { name: professor },
  _count: { appointments: booked },
});

// Quinta 22/10: encerrada, acontecendo agora, quase cheia, lotada e abaixo do mínimo
const daySessions = [
  ses("a1", "Funcional", 7, "Rafa Lima", 12, 12),
  ses("a2", "Funcional", 12, "Rafa Lima", 9, 12),
  ses("a3", "Muay Thai", 18, "Diego Reis", 15, 16),
  ses("a4", "Dança", 19, "Júlia Prado", 20, 20),
  ses("a5", "Jiu-jitsu", 20, "Diego Reis", 3, 16, 6),
];

// Outubro com aulas de segunda a sábado (o calendário só usa id e nome; chave = ano-mês-dia)
const monthSessions = new Map(
  Array.from({ length: 31 }, (_, i) => new Date(2026, 9, i + 1))
    .filter((d) => d.getDay() !== 0)
    .map((d): [string, { id: string; name: string }[]] => [
      `2026-9-${d.getDate()}`,
      d.getDate() === 22
        ? daySessions
        : (d.getDay() % 2 ? ["Funcional", "Muay Thai", "Dança"] : ["Pilates", "Jiu-jitsu"]).map((name) => ({
            id: name,
            name,
          })),
    ]),
);

/** Agenda do painel: o calendário e a linha do tempo do dia são os componentes reais. */
export function AgendaMock() {
  return (
    <Screen className="max-h-[560px] p-3 [mask-image:linear-gradient(to_bottom,black_85%,transparent)] [zoom:0.8] lg:max-h-[640px] lg:[zoom:0.62]">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="hidden lg:block">
          <MonthCalendar
            cursor={DAY}
            selected={DAY}
            today={DAY}
            sessionsByDay={monthSessions}
            onSelect={noop}
            onPrev={noop}
            onNext={noop}
            onToday={noop}
          />
        </div>
        <DayAgenda date={DAY} sessions={daySessions} isLoading={false} now={NOW} />
      </div>
    </Screen>
  );
}

/** O plano como "ticket" (tela de Planos) e o pacote do aluno como carteirinha (portal, componente real). */
export function PackageMock() {
  return (
    <Screen className="space-y-3 p-3 [zoom:0.85]">
      {/* o ticket fica sobre a superfície branca, como no card de Planos: os recortes usam essa cor */}
      <div className="rounded-[18px] bg-[var(--mv-surface)] p-3">
        <div className="relative flex flex-col overflow-hidden rounded-[18px] bg-[var(--mv-brand-50)]">
          <div className="p-4">
            <p className="pt-1 text-base font-bold text-[var(--mv-text)]">Mensal 8 aulas</p>
            <p className="mt-3 text-3xl font-bold leading-none tracking-tight tabular-nums text-[var(--mv-text)]">
              R$ 240
            </p>
            <p className="mt-1.5 text-sm tabular-nums text-[var(--mv-text-soft)]">R$ 30 por aula</p>
          </div>
          <div aria-hidden className="relative z-10">
            <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-[var(--mv-surface)]" />
            <span className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-[var(--mv-surface)]" />
            <div className="mx-5 border-t-2 border-dashed border-[var(--mv-brand-200)]" />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 bg-[var(--mv-brand-100)] px-4 py-3 text-sm font-semibold text-[var(--mv-brand-700)]">
            <span className="flex items-center gap-1.5">
              <Ticket className="h-4 w-4" /> 8 aulas
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" /> 30 dias de validade
            </span>
          </div>
        </div>
      </div>
      <PackageCard
        name="Ana Souza"
        pkg={{ planName: "Mensal 8 aulas", creditsRemaining: 6, creditsTotal: 8, expiresAt: "2026-11-09T12:00:00.000Z" }}
      />
    </Screen>
  );
}

const roll = [
  { name: "Ana Souza", status: "CONFIRMED", present: true },
  { name: "Leo Martins", status: "CONFIRMED", present: true },
  { name: "Iris Prado", status: "BOOKED", present: false },
] as const;

/** A chamada da aula que está acontecendo (mesmas classes do detalhe da aula no painel). */
export function PresenceMock() {
  return (
    <Screen className="p-3 [zoom:0.85]">
      <article className="overflow-hidden rounded-2xl bg-[var(--mv-brand-50)] ring-1 ring-[var(--mv-brand)]/50">
        <div className="flex items-center gap-2 p-3.5">
          <p className="min-w-0 flex-1 truncate font-semibold text-[var(--mv-text)]">Funcional · 12:00</p>
          <span className="flex items-center gap-1 rounded-full bg-[var(--mv-brand)] px-2 py-0.5 text-[11px] font-semibold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Agora
          </span>
        </div>
        <div className="space-y-4 border-t border-[var(--mv-line)] bg-[color-mix(in_oklch,var(--mv-text)_5%,var(--mv-surface))] p-3.5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-[var(--mv-brand-100)] px-3 py-1 font-semibold tabular-nums text-[var(--mv-brand-700)]">
              9/12 agendados
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 font-semibold tabular-nums text-emerald-700">
              <CheckCheck className="h-3.5 w-3.5" /> 8 confirmados
            </span>
          </div>
          <ul className="divide-y divide-[var(--mv-line)]">
            {roll.map((r) => (
              <li key={r.name} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--mv-brand-100)] text-[11px] font-bold text-[var(--mv-brand-700)]">
                    {initials(r.name)}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-[var(--mv-text)]">{r.name}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${apptStatus[r.status].cls}`}>
                    {apptStatus[r.status].label}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-[42px]">
                  <span
                    className={`${pill} ${r.present ? "border-transparent bg-emerald-500/15 text-emerald-700" : pillOff}`}
                  >
                    <Check className="h-4 w-4" /> Presente
                  </span>
                  <span className={`${pill} ${pillOff}`}>
                    <X className="h-4 w-4" /> Faltou
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </Screen>
  );
}

// Em ordem de última mensagem, como na tela; Pedro aberto
const convs = [
  { name: "Bia Costa", text: "Quero renovar o plano!", at: "09:31", unread: 1, open: true },
  { name: "Pedro Alves", text: "Tem aula de luta sábado?", at: "08:40", unread: 2, open: true, active: true },
  { name: "Ana Souza", text: "Você: Presença confirmada ✅", at: "07:12", unread: 0, open: true },
  { name: "Lucas Prates", text: "Obrigado!", at: "21/10", unread: 0, open: false },
];

/** A lista de conversas da tela Mensagens (mesmas classes). */
export function InboxMock() {
  return (
    <Screen className="p-3 [zoom:0.85]">
      <div className={`${inboxPanel} overflow-hidden`}>
        <header className="border-b border-[var(--mv-line)] px-4 pb-3 pt-4">
          <p className="mv-mono text-[10px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)]">WhatsApp</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--mv-text)]">Mensagens</p>
          <p className="text-sm text-[var(--mv-text-soft)]">
            4 conversas <span className="font-semibold text-[var(--mv-brand-700)]"> · 2 não lidas</span>
          </p>
        </header>
        <div className="space-y-1 p-2">
          {convs.map((c) => (
            <div
              key={c.name}
              className={`relative flex items-center gap-3 rounded-2xl p-3 ${c.active ? "bg-[var(--mv-brand-100)]" : ""}`}
            >
              {c.active && <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-[var(--mv-brand)]" />}
              <span className="relative flex-shrink-0">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mv-brand)] text-xs font-bold text-white">
                  {initials(c.name)}
                </span>
                {c.open && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--mv-surface)] bg-emerald-500" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className={`truncate text-[var(--mv-text)] ${c.unread ? "font-bold" : "font-semibold"}`}>
                    {c.name}
                  </span>
                  <span
                    className={`flex-shrink-0 text-xs tabular-nums ${
                      c.unread ? "font-semibold text-[var(--mv-brand-700)]" : "text-[var(--mv-text-soft)]"
                    }`}
                  >
                    {c.at}
                  </span>
                </span>
                <span className="mt-0.5 flex items-center justify-between gap-2">
                  <span
                    className={`truncate text-sm ${c.unread ? "text-[var(--mv-text)]" : "text-[var(--mv-text-soft)]"}`}
                  >
                    {c.text}
                  </span>
                  {c.unread > 0 && (
                    <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--mv-brand)] px-1.5 text-[11px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

/* ───────────── Portal do aluno no celular ───────────── */

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const week = Array.from({ length: 7 }, (_, i) => new Date(2026, 9, 18 + i)); // dom 18 a sáb 24
const myDays = [20, 22, 24]; // aulas da Ana na semana (pontinhos)

/** Tela "Aulas" do portal em largura de celular (réplica; o anel de créditos é o real). */
function PortalScreen({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={style} className="mv-app mv-canvas px-4 pb-6 pt-5 text-left">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white shadow-sm ring-1 ring-black/5">
          <Image src="/MovenLogo.png" alt="" width={32} height={32} className="scale-[1.35]" />
        </span>
        <span className="truncate text-lg font-bold tracking-tight">Studio Ritmo</span>
      </div>

      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="mv-mono text-[11px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)]">qui, 22 de out</p>
          <p className="mt-1.5 text-[28px] font-bold leading-[1.05] tracking-[-0.03em]">
            Boa tarde,
            <span className="block text-[var(--mv-brand)]">Ana.</span>
          </p>
        </div>
        <CreditsRing free={5} reserved={1} balance={6} warn={false} />
      </div>

      <section className="rounded-[22px] border border-[var(--mv-line)] bg-[var(--mv-surface)] p-3 shadow-[0_1px_2px_rgb(11_21_48/0.04)]">
        <div className="mb-2 flex items-center gap-1 text-[var(--mv-text-soft)]">
          <ChevronLeft className="m-2.5 h-5 w-5" />
          <p className="flex-1 text-center font-bold text-[var(--mv-text)]">Outubro de 2026</p>
          <ChevronRight className="m-2.5 h-5 w-5" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {week.map((d) => {
            const active = d.getDate() === 22;
            return (
              <span
                key={d.getDate()}
                className={`flex flex-col items-center gap-1 rounded-2xl py-2.5 ${
                  active
                    ? "bg-[var(--mv-brand)] text-white shadow-[0_10px_22px_-12px_var(--mv-brand)]"
                    : "text-[var(--mv-text)]"
                }`}
              >
                <span
                  className={`mv-mono text-[10px] uppercase tracking-[0.08em] ${active ? "text-white/80" : "text-[var(--mv-text-soft)]"}`}
                >
                  {WEEKDAYS[d.getDay()]}
                </span>
                <span className="text-base font-bold tabular-nums">{d.getDate()}</span>
                <span className="flex h-1.5">
                  {myDays.includes(d.getDate()) && (
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-[var(--mv-brand)]"}`} />
                  )}
                </span>
              </span>
            );
          })}
        </div>
      </section>

      {/* Uma aula disponível na linha do tempo do dia */}
      <div className="mt-4 grid grid-cols-[48px_minmax(0,1fr)] gap-3">
        <div className="pt-4 text-right">
          <p className="text-sm font-bold tabular-nums">18:00</p>
          <p className="text-xs tabular-nums text-[var(--mv-text-soft)]">19:00</p>
        </div>
        <div className="relative pl-4">
          <span className="absolute -left-[6px] top-[20px] h-3 w-3 rounded-full border-2 border-[var(--mv-brand)] bg-[var(--mv-surface)]" />
          <article className="rounded-2xl border border-[var(--mv-line)] bg-[var(--mv-surface)] p-4 shadow-[0_1px_2px_rgb(11_21_48/0.04)]">
            <p className="text-[17px] font-bold leading-snug">Muay Thai</p>
            <p className="mt-1.5 flex items-center gap-2 text-sm text-[var(--mv-text-soft)]">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--mv-brand-100)] text-[10px] font-bold text-[var(--mv-brand-700)]">
                DR
              </span>
              Diego Reis · 60 min
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--mv-brand-100)]">
                <div className="h-full w-[94%] rounded-full bg-[var(--mv-brand)]" />
              </div>
              <span className="text-sm font-semibold tabular-nums">1 vaga</span>
            </div>
            <span className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--mv-brand)] text-[15px] font-semibold text-white shadow-[0_12px_28px_-14px_var(--mv-brand)]">
              Agendar <span className="font-normal text-white/80">· 1 crédito</span>
            </span>
          </article>
        </div>
      </div>
    </div>
  );
}

/** Celular saindo pela borda de baixo, com o portal. O zoom põe a tela em largura de celular (~370px). */
export function PortalPhone({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      inert
      className={`h-[300px] w-60 overflow-hidden rounded-t-[30px] border-x-[6px] border-t-[6px] border-white/80 shadow-xl ${className}`}
    >
      <div className="[zoom:0.62]">
        <PortalScreen style={style} />
      </div>
    </div>
  );
}

/* ───────────── Prévia de cores (seção Personalizado) ───────────── */

/**
 * Painel na tela de Agendamentos: sidebar, cabeçalho e a agenda do dia (componente real).
 * Sempre a versão desktop (com sidebar), até no celular, onde vira miniatura (zoom 0.36).
 */
export function AgendaPanelMock({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      inert
      style={style}
      className="mv-app mv-canvas flex max-h-[620px] overflow-hidden rounded-[22px] text-left [zoom:0.36] sm:[zoom:0.6]"
    >
      <PanelSidebar active="Agendamentos" className="flex" />
      <div className="min-w-0 flex-1 space-y-4 p-5">
        <PageHeader
          eyebrow="Agendamentos · quinta-feira, 22 de outubro"
          title="Agenda"
          actions={
            <span className="flex h-11 items-center gap-2 rounded-xl bg-[var(--mv-brand)] px-4 font-semibold text-white shadow-[0_12px_28px_-14px_var(--mv-brand)]">
              <Plus className="h-4 w-4" /> Nova aula
            </span>
          }
        />
        <DayAgenda date={DAY} sessions={daySessions} isLoading={false} now={NOW} />
      </div>
    </div>
  );
}
