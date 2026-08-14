-- ===========================================
-- Tunnel de participation (UC-05)
-- ===========================================
-- Introduit le statut tri-etat du ticket et la table leads.
-- La colonne booleenne isUsed est reprise dans le nouveau statut AVANT
-- d'etre supprimee : aucune donnee n'est perdue.

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('DISPONIBLE', 'EN_ATTENTE', 'UTILISE');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('EN_ATTENTE_VERIFICATION', 'VERIFIE', 'EXPIRE');

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "birthDate" TIMESTAMP(3),
    "gender" "Gender",
    "status" "LeadStatus" NOT NULL DEFAULT 'EN_ATTENTE_VERIFICATION',
    "verificationCode" VARCHAR(6),
    "codeExpiresAt" TIMESTAMP(3),
    "lastCodeSentAt" TIMESTAMP(3),
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "remindersSent" INTEGER NOT NULL DEFAULT 0,
    "rgpdConsentAt" TIMESTAMP(3) NOT NULL,
    "consentEmail" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "purgeAfter" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");
CREATE INDEX "leads_status_idx" ON "leads"("status");
CREATE INDEX "leads_codeExpiresAt_idx" ON "leads"("codeExpiresAt");
CREATE INDEX "leads_purgeAfter_idx" ON "leads"("purgeAfter");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RG-01 : l'email est unique parmi les leads ACTIFS uniquement (en attente de
-- verification ou verifies). Un lead expire ne doit pas bloquer une nouvelle
-- tentative avec la meme adresse.
-- Index partiel non exprimable dans le schema Prisma : il ne sera pas regenere
-- automatiquement. A reporter manuellement si la migration est un jour rejouee.
CREATE UNIQUE INDEX "leads_email_actif_unique" ON "leads"("email")
  WHERE "status" IN ('EN_ATTENTE_VERIFICATION', 'VERIFIE');

-- AlterTable : nouveau statut, valeur par defaut DISPONIBLE
ALTER TABLE "tickets" ADD COLUMN "status" "TicketStatus" NOT NULL DEFAULT 'DISPONIBLE';
ALTER TABLE "tickets" ADD COLUMN "pendingLeadId" TEXT;
ALTER TABLE "tickets" ADD COLUMN "pendingExpiresAt" TIMESTAMP(3);

-- Reprise des donnees : tout ticket deja consomme passe a UTILISE.
-- Les autres conservent la valeur par defaut DISPONIBLE.
UPDATE "tickets" SET "status" = 'UTILISE' WHERE "isUsed" = true;

-- La colonne booleenne n'est supprimee qu'une fois la reprise effectuee.
DROP INDEX "tickets_isUsed_idx";
ALTER TABLE "tickets" DROP COLUMN "isUsed";

-- CreateIndex
CREATE UNIQUE INDEX "tickets_pendingLeadId_key" ON "tickets"("pendingLeadId");
CREATE INDEX "tickets_status_idx" ON "tickets"("status");
CREATE INDEX "tickets_pendingExpiresAt_idx" ON "tickets"("pendingExpiresAt");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_pendingLeadId_fkey"
  FOREIGN KEY ("pendingLeadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
