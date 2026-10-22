import assert from "node:assert/strict";
import { coveredIds } from "./coverage";

const d = (day: number) => new Date(2026, 10, day, 7); // nov/2026, 7h
const pkg = (credits: number, expiresDay: number) => ({
  creditsRemaining: credits,
  expiresAt: d(expiresDay),
});
const res = (id: string, day: number) => ({ id, startAt: d(day) });

// 2 créditos e 3 reservas -> cobre as 2 mais próximas
assert.deepEqual(
  [
    ...coveredIds([pkg(2, 30)], [res("c", 20), res("a", 5), res("b", 10)]),
  ].sort(),
  ["a", "b"],
);

// pacote vence antes da aula -> não cobre
assert.equal(coveredIds([pkg(5, 8)], [res("a", 10)]).size, 0);

// 2 pacotes: o que vence antes é usado primeiro e o outro sobra pra aula seguinte
assert.deepEqual(
  [...coveredIds([pkg(1, 30), pkg(1, 6)], [res("a", 5), res("b", 20)])].sort(),
  ["a", "b"],
);

console.log("coverage: ok");
