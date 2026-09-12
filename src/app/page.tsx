import Link from "next/link";

export const metadata = {
  title: "Moven — Gestão para estúdios de Bungee Fitness",
  description:
    "Plataforma de gestão para estúdios de Bungee Fitness: alunos, agenda, planos e comunicação automática por WhatsApp.",
};

const features = [
  {
    icon: "🧑‍🤝‍🧑",
    title: "Alunos & Pacotes",
    desc: "Cadastro completo, pacotes de crédito e histórico num só lugar.",
  },
  {
    icon: "📅",
    title: "Agenda & Presença",
    desc: "Agenda do dia, controle de vagas e presença em segundos.",
  },
  {
    icon: "🎟️",
    title: "Planos & Créditos",
    desc: "Venda de planos, débito automático de créditos e validade controlada.",
  },
  {
    icon: "💬",
    title: "WhatsApp automático",
    desc: "Confirmação de presença e avisos enviados sozinhos, na hora certa.",
  },
];

export default function LandingPage() {
  return (
    <div className="clay-scope min-h-screen bg-[var(--clay-bg)] text-[var(--clay-ink-soft)]">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="font-display text-2xl font-extrabold text-[var(--clay-ink)]">
          Moven
        </span>
        <Link
          href="/login"
          className="clay-pill bg-[var(--clay-cyan)] px-6 py-2.5 font-semibold text-[var(--clay-ink)] transition-transform hover:-translate-y-0.5"
        >
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 text-center">
        <span className="clay-pill inline-block bg-[var(--clay-yellow)] px-4 py-1.5 text-sm font-bold text-[var(--clay-ink)]">
          Feito para estúdios de Bungee Fitness
        </span>
        <h1 className="font-display mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-[var(--clay-ink)] md:text-6xl">
          A gestão do seu estúdio, leve como um voo
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg md:text-xl">
          Alunos, agenda, planos e comunicação por WhatsApp — tudo num só lugar,
          simples e organizado.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/login"
            className="clay-pill bg-[var(--clay-cyan)] px-8 py-3.5 font-bold text-[var(--clay-ink)] transition-transform hover:-translate-y-0.5"
          >
            Acessar o sistema
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="clay-raised p-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--clay-surface)] text-2xl">
                {f.icon}
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--clay-ink)]">
                {f.title}
              </h3>
              <p className="mt-2 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rodapé com dados da empresa (verificação Meta) */}
      <footer className="border-t border-[var(--clay-cyan)] bg-[var(--clay-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="font-display text-xl font-extrabold text-[var(--clay-ink)]">
                Moven
              </span>
              <p className="mt-2 max-w-sm text-sm">
                Plataforma de gestão para estúdios de Bungee Fitness.
              </p>
            </div>

            <div className="text-sm">
              <p className="font-bold text-[var(--clay-ink)]">
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

          <p className="mt-8 text-xs">
            © {new Date().getFullYear()} RR RIBEIRO REPRESENTACOES COMERCIAIS
            LTDA. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
