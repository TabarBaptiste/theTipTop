// ===========================================
// Livraison des photographies par Cloudinary
// ===========================================
// Pendant de api/src/common/cloudinary.ts, pour les visuels que le front
// reference directement. Les visuels de lots, eux, arrivent par l'API : leur
// URL est enregistree en base et le composant la lit dans Prize.imageUrl.

/**
 * Compte Cloudinary servant les visuels. Ce n'est pas un secret : il figure
 * dans chaque URL de livraison, et seules les cles d'API - absentes d'ici -
 * permettent d'y envoyer quoi que ce soit.
 *
 * Ecrit en dur plutot que lu dans NEXT_PUBLIC_* : Next fige ces variables dans
 * le bundle a la construction, si bien qu'une valeur absente au build
 * produirait des URL invalides sans que rien ne le signale. La valeur doit
 * rester alignee sur CLOUDINARY_CLOUD_NAME du Jenkinsfile et sur les URL
 * posees par la migration prize_image_urls.
 */
const CLOUD_NAME = 'wummkrkc';

/**
 * Photographies de l'accueil, par role.
 *
 * Miroir de SITE_IMAGE_PUBLIC_IDS cote API, qui pilote l'envoi des fichiers.
 * Les decors vectoriels du bandeau n'y figurent pas : ils restent empaquetes,
 * un SVG ne tirant aucun benefice de la negociation de format.
 */
export const PHOTOS_ACCUEIL = {
  hero: 'thetiptop/accueil/tasses_hero_panier',
  aPropos: 'thetiptop/accueil/mains_bol_infusion',
  grandPrix: 'thetiptop/accueil/coffret_boites_lavande',
} as const;

/**
 * Loader `next/image` adosse a Cloudinary.
 *
 * Le passer en prop plutot que de configurer `images.loaderFile` limite la
 * bascule aux trois photographies concernees : tout le reste continue de
 * passer par l'optimiseur de Next.
 *
 * Next appelle ce loader une fois par largeur de son srcset, d'ou `w_` : la
 * livraison reste responsive, ce qu'une URL unique aurait fait perdre.
 * `c_limit` interdit d'agrandir au-dela de la source, `f_auto` sert l'AVIF ou
 * le WebP selon le navigateur, `q_auto` ajuste la compression au contenu.
 *
 * Aucun numero de version dans l'URL : reenvoyer un visuel sous le meme
 * identifiant le remplace sans toucher au code.
 */
export function loaderCloudinary({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const transformations = ['f_auto', `q_${quality ?? 'auto'}`, `w_${width}`, 'c_limit'];
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations.join(',')}/${src}`;
}
