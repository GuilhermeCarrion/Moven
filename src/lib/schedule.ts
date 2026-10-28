// ponytail fuso fixo -03:00
// vira campo no academy se um dia atender outro fuso
const OFFSET = "-03:00";
const OFFSET_MS = 3 * 3_600_000;
export const HORIZON_DAYS = 30;

// Ocorrencias futuras d cada horário da grade, de hoje até "days" dias à frente
export function upcomingOccurrences<
  S extends { weekday: number; time: string },
>(slots: S[], now = new Date(), days = HORIZON_DAYS) {
  const today = new Date(now.getTime() - OFFSET_MS).toISOString().slice(0, 10); // data de hoje no fuso da academia
  const out: { slot: S; startAt: Date }[] = [];

  for (let i = 0; i <= days; i++) {
    const day = new Date(`${today}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() + i);
    const ymd = day.toISOString().slice(0, 10);

    for (const slot of slots) {
      if (slot.weekday !== day.getUTCDay()) continue;
      const startAt = new Date(`${ymd}T${slot.time}:00${OFFSET}`);
      if (startAt > now) out.push({ slot, startAt });
    }
  }
  return out;
}
