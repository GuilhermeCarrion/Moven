import "dotenv/config";
import cron from "node-cron";
import { processDueJobs } from "./processor";
import { CreditSweepService } from "@/server/services/CreditSweepService";
import { RecurrenceService } from "@/server/services/RecurrenceService";

console.log("[worker] iniciado.");
const creditSweep = new CreditSweepService();
const recurrence = new RecurrenceService();

// Grade + recorrências: idempotente, então rodar de hora em hora só repõe o que faltar
const generate = () =>
  recurrence
    .generateAll()
    .catch((e) => console.error("[worker] erro no gerador: ", e));

generate(); // ao subir: um deploy novo já preenche na hora
cron.schedule("0 * * * *", generate);

// A cada minuto
cron.schedule("* * * * *", async () => {
  try {
    await processDueJobs();
  } catch (err) {
    console.error("[worker] erro na varredura: ", err);
  }

  try {
    await creditSweep.run();
  } catch (e) {
    console.error("[worker] erro na varredura de crédito: ", e);
  }
});
