import assert from "node:assert/strict";
import { upcomingOccurrences } from "./schedule";

const now = new Date("2026-10-19T15:00:00Z"); // segunda 19/10, 12:00 em SP
const terca7 = { weekday: 2, time: "07:00" };

const occ = upcomingOccurrences([terca7], now);
assert.equal(occ[0].startAt.toISOString(), "2026-10-20T10:00:00.000Z"); // ter 07:00 SP = 10:00 UTC
assert.equal(occ.length, 5); // 20/10, 27/10, 03/11, 10/11, 17/11

// aula de hoje que já passou não entra (seg 07:00 com "agora" = seg 12:00)
assert.equal(
  upcomingOccurrences([{ weekday: 1, time: "07:00" }], now, 0).length,
  0,
);

console.log("schedule: ok");
