import { SOCIAL_LINKS, SOCIAL_URLS } from './social-links';

describe('comptes officiels', () => {
  it('couvre les six réseaux du cahier des charges', () => {
    expect(SOCIAL_LINKS.map((r) => r.nom).sort()).toEqual([
      'Facebook',
      'Instagram',
      'LinkedIn',
      'Pinterest',
      'TikTok',
      'YouTube',
    ]);
  });

  // Le pied de page portait six adresses inventées, toutes bâties sur ce
  // motif. Ce test les empêche de revenir : un compte réel porte un identifiant
  // plus précis que le seul nom de la marque.
  it('ne contient plus les adresses de remplissage', () => {
    for (const url of SOCIAL_URLS) {
      expect(url).not.toMatch(/[/@]thetiptop\/?$/);
    }
  });

  it('déclare des adresses absolues et chiffrées', () => {
    for (const url of SOCIAL_URLS) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  // sameAs, dans les donnees structurees, attend exactement ces adresses :
  // une divergence entre les deux listes ferait declarer aux moteurs des
  // comptes absents du site, ou l'inverse.
  it('expose les mêmes adresses que la liste complète', () => {
    expect(SOCIAL_URLS).toEqual(SOCIAL_LINKS.map((r) => r.url));
  });
});
