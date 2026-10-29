/**
 * Abertura das telas do painel: onde a pessoa está e, quando precisa, para que a tela serve.
 */
export function PageHeader({
  eyebrow,
  title,
  highlight,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  highlight?: string; // trecho destacado na cor da marca (uma palavra/nome)
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 px-1 pb-1 pt-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="mv-mono text-[11px] uppercase tracking-[0.18em] text-[var(--mv-text-soft)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--mv-text)] sm:text-[2.75rem] sm:leading-tight">
          {title}
          {highlight && (
            <span className="text-[var(--mv-brand)] dark:text-[var(--mv-brand-light)]"> {highlight}</span>
          )}
        </h1>
        {description && <p className="mt-1.5 max-w-2xl text-[var(--mv-text-soft)]">{description}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
