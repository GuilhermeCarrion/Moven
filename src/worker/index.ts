import "dotenv/config";
import cron from "node-cron";
import { processDueJobs } from "./processor";
import { CreditSweepService } from "@/server/services/CreditSweepService";

console.log("[worker] iniciado.");
const creditSweep = new CreditSweepService();

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
