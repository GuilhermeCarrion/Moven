import Link from "next/link";
import { ArrowLeft, ArrowRight, Briefcase } from "lucide-react";
import { StudentLoginForm } from "@/components/student/StudentLoginForm";
import { CloudField } from "@/components/landing/CloudField";
import { MovenLogo } from "@/components/layout/MovenLogo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata = {
  title: "Portal do aluno — Moven",
};

// Mesmo desenho do login do painel (src/app/login), com o texto do aluno.
// No celular o painel de marca é mais baixo: o botão "Entrar" aparece sem rolar.
export default function StudentLoginPage() {
  return (
    <div className="mv-app min-h-svh lg:grid lg:grid-cols-2">
      <aside className="relative m-2 flex h-[40svh] min-h-[290px] flex-col [@media(max-height:700px)]:min-h-[250px] overflow-hidden rounded-[24px] border border-[var(--mv-line)] bg-[var(--mv-panel)] sm:m-3 lg:sticky lg:top-3 lg:h-[calc(100svh-24px)] lg:rounded-[32px]">
        <div className="absolute inset-0">
          <CloudField />
        </div>

        <div className="relative flex items-center justify-between p-4 sm:p-6 lg:p-8">
          <Link href="/" aria-label="Moven — voltar ao site">
            <MovenLogo />
          </Link>
          <ThemeToggle />
        </div>

        <div className="relative mt-[1svh] px-6 text-center lg:mt-[12svh]">
          <span className="mv-mono inline-flex items-center gap-2 rounded-full border border-[var(--mv-line)] bg-[var(--mv-bg)]/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--mv-brand)]" />
            Portal do aluno
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-[0.95] tracking-[-0.04em] text-[var(--mv-text)] sm:text-5xl lg:text-6xl">
            Sua próxima aula
            <span className="mv-serif block font-normal italic tracking-[-0.02em]">
              começa aqui.
            </span>
          </h1>
          <p className="mx-auto mt-4 hidden max-w-sm text-[var(--mv-text-soft)] lg:block">
            Agende suas aulas, confirme presença e acompanhe seus créditos.
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-5 pb-12 pt-6 sm:px-8 lg:py-12">
        <div className="w-full max-w-[400px]">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--mv-text)]">Entrar</h2>
          <p className="mt-2 text-[var(--mv-text-soft)]">
            Use seu CPF e sua data de nascimento, os mesmos do cadastro na academia.
          </p>

          <div className="mt-6 lg:mt-8">
            <StudentLoginForm />
          </div>

          <p className="mt-5 text-sm text-[var(--mv-text-soft)]">
            Não consegue entrar? Fale com a recepção da sua academia.
          </p>

          <div className="my-8 h-px bg-[var(--mv-line)]" />

          <Link
            href="/login"
            className="mv-glass group flex items-center gap-4 rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--mv-brand-100)] text-[var(--mv-brand-700)] dark:bg-[var(--mv-brand)]/15 dark:text-[var(--mv-brand-light)]">
              <Briefcase className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-[var(--mv-text)]">Trabalha na academia?</span>
              <span className="block text-sm text-[var(--mv-text-soft)]">
                Entre no painel com seu e-mail e senha.
              </span>
            </span>
            <ArrowRight className="h-5 w-5 text-[var(--mv-text-soft)] transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--mv-text-soft)] transition-colors hover:text-[var(--mv-text)]"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
        </div>
      </main>
    </div>
  );
}
