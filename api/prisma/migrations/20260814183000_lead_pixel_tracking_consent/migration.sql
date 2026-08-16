-- ===========================================
-- Consentement au pixel de tracking (CNIL 14/04/2026)
-- ===========================================
-- Le consentement au suivi d'ouverture est distinct du consentement a
-- recevoir des emails : accepter la newsletter ne vaut pas acceptation du
-- tracking. Colonne nullable volontairement : NULL = inconnu, jamais demande,
-- ce qui correspond au statut « unknown » de Brevo.

ALTER TABLE "leads" ADD COLUMN "pixelTrackingConsent" BOOLEAN;
ALTER TABLE "leads" ADD COLUMN "pixelTrackingConsentAt" TIMESTAMP(3);
