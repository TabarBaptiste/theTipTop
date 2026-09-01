// ===========================================
// Tests unitaires - URL des images Cloudinary
// ===========================================

import { PRIZE_IMAGE_PUBLIC_IDS, buildImageUrl, buildPrizeImageUrl } from '@/common/cloudinary';

describe('cloudinary', () => {
  describe('buildImageUrl', () => {
    // f_auto et q_auto sont ce qui remplace l'optimiseur de Next sur ces
    // visuels : les perdre ferait servir le fichier d'origine a tout le monde.
    it('should ask for automatic format and quality', () => {
      expect(buildImageUrl('mon-compte', 'thetiptop/lots/infuseur_premium')).toBe(
        'https://res.cloudinary.com/mon-compte/image/upload/f_auto,q_auto/thetiptop/lots/infuseur_premium',
      );
    });

    // Sans numero de version, remplacer un visuel ne demande aucune ecriture en
    // base : l'URL enregistree reste valable.
    it('should not pin a version', () => {
      expect(buildImageUrl('mon-compte', 'un/identifiant')).not.toMatch(/\/v\d+\//);
    });
  });

  describe('buildPrizeImageUrl', () => {
    it('should build the URL of every prize', () => {
      for (const [code, publicId] of Object.entries(PRIZE_IMAGE_PUBLIC_IDS)) {
        expect(buildPrizeImageUrl(code, 'mon-compte')).toBe(buildImageUrl('mon-compte', publicId));
      }
    });

    // La seed doit rester executable sans compte Cloudinary, en local comme en
    // integration continue : elle enregistre alors null, et l'interface retombe
    // sur ses images empaquetees.
    it.each([undefined, ''])(
      'should return null when the account is not configured (%p)',
      (cloudName) => {
        expect(buildPrizeImageUrl('INFUSER', cloudName)).toBeNull();
      },
    );

    it('should return null for a prize with no known visual', () => {
      expect(buildPrizeImageUrl('LOT_INCONNU', 'mon-compte')).toBeNull();
    });

    // Le catalogue doit couvrir les cinq lots du reglement : un code oublie
    // afficherait un lot sans visuel.
    it('should cover the five prizes', () => {
      expect(Object.keys(PRIZE_IMAGE_PUBLIC_IDS).sort()).toEqual([
        'GIFT_BOX_39',
        'GIFT_BOX_69',
        'INFUSER',
        'TEA_DETOX',
        'TEA_SIGNATURE',
      ]);
    });
  });
});
