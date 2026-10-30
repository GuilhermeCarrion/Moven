/** Carteirinha do aluno: o pacote como cartão (bloco sólido da marca). Perfil do portal e prévia da landing. */
export function PackageCard({
  name,
  pkg,
}: {
  name: string;
  pkg: {
    planName: string;
    creditsRemaining: number;
    creditsTotal: number;
    expiresAt: string | null;
  } | null;
}) {
  return (
    <section
      aria-label="Meu pacote"
      className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,var(--mv-brand),color-mix(in_oklch,var(--mv-brand)_62%,black))] p-5 text-white shadow-[0_24px_48px_-24px_var(--mv-brand)]"
    >
      {/* brilho diagonal sutil, como plástico de cartão */}
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <p className="mv-mono text-[10px] uppercase tracking-[0.2em] text-white/70">Carteirinha · aluno</p>
        <p className="mt-2 truncate text-2xl font-bold tracking-tight">{name}</p>

        {pkg ? (
          <>
            <div className="mt-5 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-white/70">Plano</p>
                <p className="truncate font-semibold">{pkg.planName}</p>
              </div>
              <p className="flex-shrink-0 text-right leading-none">
                <span className="text-3xl font-bold tabular-nums">{pkg.creditsRemaining}</span>
                <span className="text-white/70"> / {pkg.creditsTotal}</span>
                <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-white/70">
                  créditos
                </span>
              </p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${Math.min(1, pkg.creditsRemaining / Math.max(1, pkg.creditsTotal)) * 100}%` }}
              />
            </div>
            <p className="mt-3 border-t border-dashed border-white/30 pt-3 text-sm text-white/80">
              Válido até{" "}
              <b className="text-white">
                {pkg.expiresAt ? new Date(pkg.expiresAt).toLocaleDateString("pt-BR") : "—"}
              </b>
            </p>
          </>
        ) : (
          <p className="mt-5 rounded-xl bg-white/15 px-3.5 py-3 text-sm">
            Nenhum pacote ativo. Fale com a recepção para renovar.
          </p>
        )}
      </div>
    </section>
  );
}
