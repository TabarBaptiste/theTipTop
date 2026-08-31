// ===========================================
// Comptes officiels de la marque
// ===========================================
// Source unique : les adresses reproduites ici sont celles déclarées comme
// « lien officiel » dans le cahier des charges. Le pied de page portait
// jusqu'ici six adresses inventées, toutes bâties sur le motif
// « /thetiptop » - aucune ne correspondait à un compte existant.
//
// Ces liens ne relèvent pas seulement de la navigation : ils alimentent la
// propriété `sameAs` des données structurées, par laquelle les moteurs
// rattachent le site et les comptes sociaux à une même entité. Des adresses
// fantaisistes y sont pires qu'aucune adresse, un lien mort affaiblissant la
// confiance accordée à l'ensemble de la déclaration.

export interface SocialLink {
  /** Sert d'étiquette accessible sur le lien. */
  nom: string;
  url: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { nom: 'Instagram', url: 'https://www.instagram.com/thetiptop.artisanat/' },
  { nom: 'TikTok', url: 'https://www.tiktok.com/@thetiptop.artisanat' },
  { nom: 'Pinterest', url: 'https://fr.pinterest.com/thetiptopartisanat' },
  { nom: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61559328735388' },
  { nom: 'LinkedIn', url: 'https://www.linkedin.com/company/the-tiptop-artisanat' },
  { nom: 'YouTube', url: 'https://www.youtube.com/@thetiptop.artisanat' },
];

/** Adresses seules, dans la forme attendue par schema.org. */
export const SOCIAL_URLS = SOCIAL_LINKS.map((r) => r.url);
