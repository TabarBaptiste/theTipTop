import type { MetadataRoute } from 'next';

import { GAME_END_DATE } from '@/lib/game-dates';
import { LEGAL_UPDATED_AT } from '@/lib/legal-dates';

/**
 * Plan du site, servi sur /sitemap.xml.
 *
 * Il existait déjà une référence à ce fichier dans public/robots.txt, mais pas
 * le fichier lui-même : les robots récoltaient un 404 à chaque passage.
 *
 * Seules les pages publiques y figurent. L'espace personnel, les back-offices
 * et le tunnel d'authentification en sont exclus - ils sont déjà interdits au
 * crawl par robots.txt, et les référencer ici serait contradictoire.
 */
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://thetiptop.dsp5-archi-o24a-4-5-g1.fr';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      // La page d'accueil porte le décompte : elle change tous les jours tant
      // que le jeu tourne.
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      // Page de conversion du jeu-concours : la plus importante après l'accueil.
      url: `${BASE_URL}/participate`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/reglement`,
      // Le règlement est figé par son dépôt chez le commissaire de justice ;
      // sa dernière évolution est celle des dates officielles du jeu.
      lastModified: GAME_END_DATE,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/cgu`,
      lastModified: LEGAL_UPDATED_AT.cgu,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/mentions-legales`,
      lastModified: LEGAL_UPDATED_AT.mentionsLegales,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/politique-confidentialite`,
      lastModified: LEGAL_UPDATED_AT.politiqueConfidentialite,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/gestion-cookies`,
      lastModified: LEGAL_UPDATED_AT.gestionCookies,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
