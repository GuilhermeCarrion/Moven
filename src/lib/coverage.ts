export type CoveragePackage = { creditsRemaining: number; expiresAt: Date };
export type CoverageReservation = { id: string; startAt: Date };

// Ditribui os creidtos pelas reservas em ordem de data. Cada reserva usa o pacote válido
// NA DATA dela que vence primeiro - assim nenhum crédito vence sem uso
export function coveredIds(
  packages: CoveragePackage[],
  reservations: CoverageReservation[],
) {
  const pool = packages
    .map((p) => ({ left: p.creditsRemaining, expiresAt: p.expiresAt }))
    .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());

  const covered = new Set<string>();
  const byDate = [...reservations].sort(
    (a, b) => a.startAt.getTime() - b.startAt.getTime(),
  );

  for (const r of byDate) {
    const pkg = pool.find((p) => p.left > 0 && p.expiresAt >= r.startAt);
    if (pkg) {
      pkg.left--;
      covered.add(r.id);
    }
  }
  return covered;
}
