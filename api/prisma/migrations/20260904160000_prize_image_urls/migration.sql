-- Visuels des lots : bascule sur Cloudinary
--
-- Prize.imageUrl est renseigne par prisma/seed.ts, que la chaine de
-- deploiement n'execute pas : elle ne joue que les migrations. Les bases
-- deployees portaient donc imageUrl = NULL sur les cinq lots, et l'interface
-- retombait en permanence sur les images empaquetees dans le bundle Next -
-- le repli, pris pour le regime nominal.
--
-- Les URL sont ecrites en dur, comme la copie des lots l'a ete par la
-- migration prize_copy_refresh, et pour la meme raison : une migration ne lit
-- pas l'environnement. Elles doivent rester le reflet exact de
-- PRIZE_IMAGE_PUBLIC_IDS (api/src/common/cloudinary.ts) et du compte
-- CLOUDINARY_CLOUD_NAME declare dans le Jenkinsfile. Changer l'un sans l'autre
-- les ferait diverger, la seed reprenant la main en local et cette migration
-- sur les environnements deployes.
--
-- f_auto laisse Cloudinary servir l'AVIF ou le WebP selon le navigateur,
-- q_auto ajuste la compression. Aucun numero de version dans l'URL : reenvoyer
-- un visuel sous le meme identifiant le remplace sans toucher a la base.
--
-- Les images empaquetees restent en place : l'interface y retombe si une URL
-- est absente, et rien ne casse si Cloudinary devient injoignable.
--
-- Idempotente par nature : des valeurs fixes sur cinq lignes identifiees par
-- leur code, et le registre des migrations empeche de la rejouer.

UPDATE "prizes"
   SET "imageUrl" = 'https://res.cloudinary.com/wummkrkc/image/upload/f_auto,q_auto/thetiptop/lots/infuseur_premium'
 WHERE "code" = 'INFUSER';

UPDATE "prizes"
   SET "imageUrl" = 'https://res.cloudinary.com/wummkrkc/image/upload/f_auto,q_auto/thetiptop/lots/boite_100g_detox'
 WHERE "code" = 'TEA_DETOX';

UPDATE "prizes"
   SET "imageUrl" = 'https://res.cloudinary.com/wummkrkc/image/upload/f_auto,q_auto/thetiptop/lots/boite_100g_signature'
 WHERE "code" = 'TEA_SIGNATURE';

UPDATE "prizes"
   SET "imageUrl" = 'https://res.cloudinary.com/wummkrkc/image/upload/f_auto,q_auto/thetiptop/lots/coffret_decouverte_39'
 WHERE "code" = 'GIFT_BOX_39';

UPDATE "prizes"
   SET "imageUrl" = 'https://res.cloudinary.com/wummkrkc/image/upload/f_auto,q_auto/thetiptop/lots/coffret_decouverte_69'
 WHERE "code" = 'GIFT_BOX_69';
