// ===========================================
// Identité de l'éditeur, pour les moteurs
// ===========================================
// Les valeurs reprennent celles des mentions légales, seule source faisant foi.
// Toute divergence entre les deux se retournerait contre le référencement :
// Google recoupe ces informations avec les autres traces de l'entreprise.

import { SOCIAL_URLS } from './social-links';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://thetiptop.dsp5-archi-o24a-4-5-g1.fr';

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Thé Tip Top',
  url: BASE_URL,
  logo: `${BASE_URL}/img/logo-artisan-mediterraneen-horizontal.svg`,
  email: 'contact@thetiptop.fr',
  telephone: '+33123748596',
  vatID: 'FR01123456789',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '18 rue Léon Frot',
    postalCode: '75011',
    addressLocality: 'Paris',
    addressCountry: 'FR',
  },
  description:
    'Thé Tip Top, vente de thés biologiques et faits main depuis 10 ans, à Nice et Paris.',
  // Rattache les comptes sociaux officiels à l'entreprise. C'est ce qui permet
  // aux moteurs de traiter le site et ces comptes comme une même entité plutôt
  // que comme des présences sans lien, et de les faire apparaître ensemble.
  sameAs: SOCIAL_URLS,
};

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Thé Tip Top',
  url: BASE_URL,
  inLanguage: 'fr-FR',
};
