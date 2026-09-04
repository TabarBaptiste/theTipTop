-- ===========================================
-- Mot de passe porte par le lead, et unicite des demandes en attente
-- ===========================================
-- Le mot de passe est desormais choisi au formulaire, avant la verification de
-- l'adresse. Il ne peut pas etre pose sur users : tant que l'adresse n'est pas
-- prouvee, aucune ligne users n'existe. Il attend donc sur le lead, deja hache,
-- et n'est transfere qu'a la confirmation du code.

ALTER TABLE "leads" ADD COLUMN "password" TEXT;

-- RG-01 : deux soumissions concurrentes sur la meme adresse creaient deux leads
-- en attente, la verification d'unicite etant purement applicative. L'index
-- ci-dessous porte la regle en base.
--
-- La clause WHERE est volontairement restreinte au seul statut EN_ATTENTE :
--   - un lead VERIFIE n'a plus de code a consommer, et l'unicite du compte est
--     deja garantie par la contrainte UNIQUE sur users.email ;
--   - un lead EXPIRE doit au contraire laisser repasser une nouvelle tentative.
-- Une condition portant sur codeExpiresAt serait impossible : PostgreSQL exige
-- un predicat immutable, ce que now() n'est pas.

-- Les doublons deja presents empecheraient la creation de l'index. On ne
-- supprime rien : le plus recent reste en attente, les autres passent EXPIRE,
-- exactement ce qu'en aurait fait le job d'expiration.
UPDATE "leads" SET "status" = 'EXPIRE', "verificationCode" = NULL, "codeExpiresAt" = NULL
WHERE "status" = 'EN_ATTENTE_VERIFICATION'
  AND "id" NOT IN (
    SELECT DISTINCT ON ("email") "id"
    FROM "leads"
    WHERE "status" = 'EN_ATTENTE_VERIFICATION'
    ORDER BY "email", "createdAt" DESC
  );

CREATE UNIQUE INDEX "leads_email_pending_key"
  ON "leads" ("email")
  WHERE "status" = 'EN_ATTENTE_VERIFICATION';
