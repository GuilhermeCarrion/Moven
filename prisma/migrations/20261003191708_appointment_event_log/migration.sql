-- CreateEnum
CREATE TYPE "AppointmentEventType" AS ENUM ('BOOKED', 'CONFIRMED', 'CANCELLED', 'RESCHEDULED', 'PRESENT', 'ABSENT', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('STUDENT', 'STAFF', 'SYSTEM');

-- CreateTable
CREATE TABLE "AppointmentEvent" (
    "id" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "classSessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" "AppointmentEventType" NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "actorId" TEXT,
    "creditsRefunded" BOOLEAN,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppointmentEvent_academyId_studentId_createdAt_idx" ON "AppointmentEvent"("academyId", "studentId", "createdAt");

-- CreateIndex
CREATE INDEX "AppointmentEvent_classSessionId_idx" ON "AppointmentEvent"("classSessionId");

-- CreateIndex
CREATE INDEX "AppointmentEvent_appointmentId_idx" ON "AppointmentEvent"("appointmentId");
