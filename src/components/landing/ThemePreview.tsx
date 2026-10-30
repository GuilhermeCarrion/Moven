"use client";

import {
  ArrowRight,
  BellRing,
  ChartColumn,
  MessageCircle,
  Palette,
  Plug,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { AgendaPanelMock, PortalPhone } from "./mocks";
import { Reveal } from "./Reveal";

/**
 * Seção Personalizado: o visual (a cor da academia, trocada ao vivo nas telas reais, que só
 * redefinem --mv-brand) e o funcional (ajuste sob medida). O card funcional veste a mesma cor.
 */

const palettes = [
  { name: "Moven", color: "#1463ff" },
  { name: "Verde", color: "#14a44d" },
  { name: "Rosa", color: "#e0287a" },
  { name: "Roxo", color: "#7c3aed" },
  { name: "Laranja", color: "#f06418" },
];

const asks = [
  {
    icon: SlidersHorizontal,
    title: "Regras do seu jeito",
    desc: "Cancelamento, reposição e validade como a sua academia já trabalha.",
  },
  {
    icon: ChartColumn,
    title: "Relatórios sob medida",
    desc: "O número que você acompanha, sem precisar de planilha.",
  },
  {
    icon: BellRing,
    title: "Novos avisos no WhatsApp",
    desc: "Aniversário, aula extra ou aquele aluno que sumiu.",
  },
  {
    icon: Plug,
    title: "Integração",
    desc: "O Moven conversando com outro sistema que você já usa.",
  },
];

export function ThemePreview({ contactHref }: { contactHref: string }) {
  const [active, setActive] = useState(palettes[0]);
  // inline no próprio .mv-app: a classe dele define --mv-brand e venceria a herança
  const brand = { "--mv-brand": active.color } as React.CSSProperties;

  return (
    <>
      {/* Visual: faixa de vidro fosco de ponta a ponta (como a do WhatsApp), o texto lê melhor sobre as nuvens */}
      <div className="mt-14 border-y border-white/10 bg-white/[0.035] backdrop-blur-2xl">
        <Reveal>
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div>
              <p className="mv-mono flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--mv-brand-light)]">
                <Palette className="h-4 w-4" /> Visual
              </p>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                Depois do login, o Moven veste a camisa da sua academia.
              </h3>
              <p className="mt-4 max-w-lg text-lg leading-relaxed">
                Uma academia verde e branca usa o sistema verde e branco — a equipe no painel e o
                aluno no portal. Você escolhe a cor; o Moven cuida dos tons.
              </p>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {palettes.map((p) => {
                  const on = p.name === active.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setActive(p)}
                      aria-pressed={on}
                      className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all ${
                        on
                          ? "border-transparent bg-white text-[var(--mv-ink)] shadow-lg"
                          : "mv-glass text-white hover:-translate-y-0.5"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full ring-2 ring-white" style={{ background: p.color }} />
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Painel com o celular do aluno por cima, à direita (no celular também, em miniatura); somem num degradê */}
            <div className="relative pb-10 pr-8 [mask-image:linear-gradient(to_bottom,black_75%,transparent)] sm:pr-14">
              <AgendaPanelMock style={brand} />
              <div className="absolute bottom-0 right-0 [zoom:0.65] sm:[zoom:1]">
                <PortalPhone style={brand} />
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Funcional: bloco sólido na cor escolhida. Celular: texto, exemplos e o botão no fim */}
      <Reveal className="mx-auto mt-16 max-w-6xl px-5">
        <div
          style={brand}
          className="relative overflow-hidden rounded-[28px] bg-[var(--mv-brand)] text-white shadow-[0_40px_80px_-30px_var(--mv-brand)] transition-colors duration-500"
        >
          <span aria-hidden className="absolute inset-0 bg-[linear-gradient(135deg,transparent_30%,rgb(0_0_0/0.4))]" />
          <span aria-hidden className="absolute -left-24 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-12 lg:p-10">
            <div className="lg:col-start-1 lg:row-start-1">
              <p className="mv-mono flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/75">
                <Wrench className="h-4 w-4" /> Funcional
              </p>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight md:text-4xl">
                Falta algo para a sua academia? A gente ajusta.
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-white/80">
                Se o seu jeito de trabalhar pede uma regra, uma tela ou um aviso diferente, a gente
                adapta o Moven para a sua necessidade.
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              {asks.map((a) => (
                // celular: ícone ao lado do texto (mais baixo); a partir do sm, ícone em cima
                <li key={a.title} className="flex gap-3.5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 sm:block sm:p-5">
                  <span
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white transition-colors duration-500"
                    style={{ color: active.color }}
                  >
                    <a.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold sm:mt-3">{a.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/75">{a.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 sm:px-5 font-semibold text-[var(--mv-ink)] transition-transform hover:-translate-y-0.5 sm:justify-self-start lg:col-start-1 lg:row-start-2 lg:self-end"
            >
              <MessageCircle className="h-5 w-5 transition-colors duration-500" style={{ color: active.color }} />
              Conversar sobre o meu caso
              {/* sem a seta no celular o texto cabe numa linha */}
              <ArrowRight className="hidden h-4 w-4 sm:block" />
            </a>
          </div>
        </div>
      </Reveal>
    </>
  );
}
