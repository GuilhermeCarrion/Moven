import "dotenv/config";
import cron from "node-cron";
import { processDueJobs } from "./processor";

console.log("[worker] iniciado.");

// A cada minuto
cron.schedule("* * * * *", async () => {
  try {
    await processDueJobs();
  } catch (err) {
    console.error("[worker] erro na varredura: ", err);
  }
});
