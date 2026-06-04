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
 * Retourne le nom du lot en français
 */
export function getPrizeName(prizeType: string): string {
  const prizes: Record<string, string> = {
    INFUSER: 'Infuseur à thé',
    TEA_DETOX: 'Thé détox ou infusion 100g',
    TEA_SIGNATURE: 'Thé signature 100g',
    GIFT_BOX_39: 'Coffret découverte 39€',
    GIFT_BOX_69: 'Coffret découverte 69€',
    GRAND_PRIZE: '1 an de thé d\'une valeur de 360€',
  };
  return prizes[prizeType] || prizeType;
}

/**
 * Retourne la valeur du lot
 */
export function getPrizeValue(prizeType: string): string {
  const values: Record<string, string> = {
    INFUSER: '15€',
    TEA_DETOX: '20€',
    TEA_SIGNATURE: '25€',
    GIFT_BOX_39: '39€',
    GIFT_BOX_69: '69€',
    GRAND_PRIZE: '360€',
  };
  return values[prizeType] || '0€';
}
