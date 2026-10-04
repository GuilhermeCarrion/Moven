/*
  Warnings:

  - You are about to drop the column `creditsRefunded` on the `AppointmentEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AppointmentEvent" DROP COLUMN "creditsRefunded",
ADD COLUMN     "creditRefunded" BOOLEAN;
