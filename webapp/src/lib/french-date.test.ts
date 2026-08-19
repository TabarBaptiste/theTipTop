import { formatFrenchDate, formatFrenchDateTime, formatFrenchDateRange } from './french-date';

describe('formatage des dates en français', () => {
  // Les instants sont donnés en UTC et tombent volontairement de part et
  // d'autre de minuit : c'est ce décalage qui avait fait afficher une date
  // fausse dans un email d'expiration.
  it('affiche le 1er septembre malgré un instant UTC au 31 août', () => {
    expect(formatFrenchDate(new Date('2026-08-31T22:00:00.000Z'))).toBe('1er septembre 2026');
  });

  it('affiche la clôture au 30 septembre, pas au 1er octobre', () => {
    expect(formatFrenchDate(new Date('2026-09-30T21:59:59.999Z'))).toBe('30 septembre 2026');
  });

  // L'heure d'été prend fin le 25 octobre : cette borne-là est en +01:00 quand
  // les précédentes sont en +02:00.
  it('tient compte de la fin de l’heure d’été', () => {
    expect(formatFrenchDate(new Date('2026-10-30T22:59:59.999Z'))).toBe('30 octobre 2026');
  });

  it('écrit « 1er » et non « 1 »', () => {
    expect(formatFrenchDate(new Date('2026-06-01T10:00:00.000Z'))).toBe('1er juin 2026');
  });

  it('affiche l’heure en heure française', () => {
    expect(formatFrenchDateTime(new Date('2026-09-30T21:59:59.999Z'))).toBe(
      '30 septembre 2026 à 23h59',
    );
  });

  describe('périodes', () => {
    it('ne répète pas le mois quand les deux bornes le partagent', () => {
      expect(
        formatFrenchDateRange(
          new Date('2026-08-31T22:00:00.000Z'),
          new Date('2026-09-30T21:59:59.999Z'),
        ),
      ).toBe('Du 1er au 30 septembre 2026');
    });

    it('donne les deux dates entières quand la période change de mois', () => {
      expect(
        formatFrenchDateRange(
          new Date('2026-08-31T22:00:00.000Z'),
          new Date('2026-10-30T22:59:59.999Z'),
        ),
      ).toBe('Du 1er septembre 2026 au 30 octobre 2026');
    });
  });
});
