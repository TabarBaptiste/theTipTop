// ===========================================
// Images distribuées par Cloudinary
// ===========================================
// Ce module ne parle pas au réseau : il ne fait que décider des identifiants et
// de la forme des URL. L'envoi des fichiers vit dans scripts/upload-images.ts,
// et la lecture dans la seed, qui renseigne Prize.imageUrl.
//
// Aucune dépendance au SDK Cloudinary : une URL de livraison se construit, elle
// ne se demande pas. Le projet appelle déjà Brevo en REST direct pour la même
// raison - une dépendance de moins à suivre.

/**
 * Identifiant Cloudinary de chaque visuel de lot, par code de lot.
 *
 * Ces identifiants sont stables et repris tels quels à chaque envoi : réenvoyer
 * une image écrase la précédente au lieu d'en créer une copie. Ils reprennent
 * le nom des fichiers de webapp/src/img, qui restent le repli hors ligne.
 *
 * Les images livrées sont détourées, fond transparent. Les photos d'origine
 * sont archivées sous les mêmes identifiants préfixés de `sources/` - par
 * exemple `thetiptop/lots/sources/infuseur_premium`. Ne pas les supprimer :
 * c'est d'elles que repart un détourage, et elles ne sont pas dans le dépôt.
 */
export const PRIZE_IMAGE_PUBLIC_IDS: Record<string, string> = {
  INFUSER: 'thetiptop/lots/infuseur_premium',
  TEA_DETOX: 'thetiptop/lots/boite_100g_detox',
  TEA_SIGNATURE: 'thetiptop/lots/boite_100g_signature',
  GIFT_BOX_39: 'thetiptop/lots/coffret_decouverte_39',
  GIFT_BOX_69: 'thetiptop/lots/coffret_decouverte_69',
};

/**
 * URL de livraison d'une image.
 *
 * `f_auto` laisse Cloudinary servir l'AVIF ou le WebP selon ce que le
 * navigateur accepte, `q_auto` ajuste la compression au contenu. Ces deux
 * réglages remplacent l'optimiseur d'images de Next sur ces visuels.
 *
 * Volontairement sans numéro de version : l'URL reste la même d'un envoi à
 * l'autre, ce qui permet de remplacer un visuel sans toucher à la base. En
 * contrepartie, un remplacement met un moment à se propager dans les caches.
 */
export function buildImageUrl(cloudName: string, publicId: string): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`;
}

/**
 * URL du visuel d'un lot, ou `null` si Cloudinary n'est pas configuré ou si le
 * lot n'a pas de visuel connu.
 *
 * Renvoyer `null` plutôt que d'échouer est délibéré : la seed doit rester
 * exécutable sans compte Cloudinary - en local comme en intégration continue -
 * et l'interface retombe alors sur ses images empaquetées.
 */
export function buildPrizeImageUrl(code: string, cloudName: string | undefined): string | null {
  const publicId = PRIZE_IMAGE_PUBLIC_IDS[code];
  if (!cloudName || !publicId) {
    return null;
  }
  return buildImageUrl(cloudName, publicId);
}
