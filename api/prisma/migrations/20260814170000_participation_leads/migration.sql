-- ===========================================
-- Tunnel de participation (UC-05)
-- ===========================================
-- Introduit la table leads. La table tickets n'est pas modifiee : le code n'est
-- consomme qu'a la confirmation de l'email, via isUsed (RG-12).

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
    "ticketId" TEXT,
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
CREATE INDEX "leads_ticketId_idx" ON "leads"("ticketId");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Pas de contrainte d'unicite sur ticketId : plusieurs leads peuvent viser le
-- meme code tant qu'aucun n'a confirme. Le premier a confirmer emporte le
-- ticket, les suivants sont rejetes a ce moment-la.
ALTER TABLE "leads" ADD CONSTRAINT "leads_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RG-01 : l'email est unique parmi les leads ACTIFS uniquement (en attente de
-- verification ou verifies). Un lead expire ne doit pas bloquer une nouvelle
-- tentative avec la meme adresse.
-- Index partiel non exprimable dans le schema Prisma : il ne sera pas regenere
-- automatiquement. A reporter manuellement si la migration est un jour rejouee.
CREATE UNIQUE INDEX "leads_email_actif_unique" ON "leads"("email")
  WHERE "status" IN ('EN_ATTENTE_VERIFICATION', 'VERIFIE');
