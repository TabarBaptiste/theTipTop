// ===========================================
// Tests unitaires - lib/utils
// ===========================================

import { cn, formatDate, formatDateTime, getPrizeName, toDateInputValue } from './utils';

describe('toDateInputValue', () => {
  it('rend la date locale au format AAAA-MM-JJ', () => {
    expect(toDateInputValue(new Date(2008, 7, 17))).toBe('2008-08-17');
  });

  // La borne de majorite passait par toISOString(), qui convertit en UTC :
  // minuit heure de Paris y devient la veille. La personne ayant 18 ans le jour
  // meme ne pouvait alors pas saisir sa date de naissance, le calendrier
  // s arretant un jour trop tot.
  it('ne recule pas d un jour sur un fuseau en avance sur UTC', () => {
    expect(toDateInputValue(new Date(2008, 7, 17))).not.toBe('2008-08-16');
  });

  it('complete les mois et jours a deux chiffres', () => {
    expect(toDateInputValue(new Date(2008, 0, 5))).toBe('2008-01-05');
  });

  it('donne bien la borne des 18 ans a partir d aujourd hui', () => {
    const aujourdhui = new Date();
    const borne = new Date(
      aujourdhui.getFullYear() - 18,
      aujourdhui.getMonth(),
      aujourdhui.getDate(),
    );

    const attendu = [
      aujourdhui.getFullYear() - 18,
      String(aujourdhui.getMonth() + 1).padStart(2, '0'),
      String(aujourdhui.getDate()).padStart(2, '0'),
    ].join('-');

    expect(toDateInputValue(borne)).toBe(attendu);
  });
});

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('keeps custom font-size tokens separate from text colors', () => {
    // text-ui est une taille (DESIGN.md), text-white une couleur : pas de conflit
    expect(cn('text-ui', 'text-white')).toBe('text-ui text-white');
  });

  it('ignores falsy values', () => {
    expect(cn('a', false && 'b', undefined, null)).toBe('a');
  });
});

describe('formatDate', () => {
  it('formats a date in French', () => {
    expect(formatDate('2026-09-15T10:00:00.000Z')).toBe('15 septembre 2026');
  });

  it('accepts Date objects', () => {
    expect(formatDate(new Date(2026, 0, 1))).toBe('1 janvier 2026');
  });
});

describe('formatDateTime', () => {
  it('includes hours and minutes', () => {
    const result = formatDateTime(new Date(2026, 8, 15, 14, 30));
    expect(result).toContain('15 septembre 2026');
    expect(result).toMatch(/14[:h]30/);
  });
});

describe('getPrizeName', () => {
  it('returns the French label for a known prize type', () => {
    expect(getPrizeName('INFUSER')).toBe('Infuseur à thé');
    expect(getPrizeName('GIFT_BOX_69')).toBe('Coffret Découverte Premium');
  });

  it('falls back to the raw type for unknown prizes', () => {
    expect(getPrizeName('UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE');
  });
});
