import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// On enregistre les tokens de taille de police personnalises (DESIGN.md) aupres
// de tailwind-merge afin qu'ils soient classes comme "font-size" et n'entrent pas
// en conflit avec les classes de couleur de texte (ex: text-white vs text-ui).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['h1', 'h2', 'h3', 'body', 'ui', 'caption'] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate une date au format attendu par un <input type="date"> (AAAA-MM-JJ).
 *
 * Les composants sont lus en heure locale, sans passer par toISOString() :
 * celle-ci convertit en UTC, et minuit heure de Paris y devient la veille. Le
 * decalage se voyait sur la borne de majorite, ou la personne ayant 18 ans le
 * jour meme ne pouvait pas saisir sa date de naissance.
 */
export function toDateInputValue(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * Formate une date en français
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Formate une date avec l'heure
 */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Retourne le nom du lot en français (fallback statique – préférer l'API /tickets/prizes)
 */
export function getPrizeName(prizeType: string): string {
  const prizes: Record<string, string> = {
    INFUSER:       'Infuseur à thé',
    TEA_DETOX:     'Thé Détox / Infusion',
    TEA_SIGNATURE: 'Thé Signature',
    GIFT_BOX_39:   'Coffret Découverte',
    GIFT_BOX_69:   'Coffret Découverte Premium',
  };
  return prizes[prizeType] || prizeType;
}

/**
 * Retourne la valeur du lot (fallback statique – préférer l'API /tickets/prizes)
 */
// export function getPrizeValue(prizeType: string): string {
//   const values: Record<string, string> = {
//     INFUSER:       '12€',
//     TEA_DETOX:     '15€',
//     TEA_SIGNATURE: '20€',
//     GIFT_BOX_39:   '39€',
//     GIFT_BOX_69:   '69€',
//   };
//   return values[prizeType] || '-';
// }
