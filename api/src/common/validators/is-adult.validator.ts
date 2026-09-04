// ===========================================
// Validateur - Majorité (date de naissance)
// ===========================================

import { registerDecorator, ValidationOptions } from 'class-validator';

const MIN_AGE = 18;
const MAX_AGE = 120;

function getAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthdayThisYear =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  if (beforeBirthdayThisYear) age--;
  return age;
}

/**
 * Vérifie que la date de naissance correspond à une personne majeure (>= 18 ans)
 * et exclut les dates non plausibles (> 120 ans).
 */
export function IsAdult(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAdult',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          if (!value) return true;
          const birthDate = new Date(value);
          if (Number.isNaN(birthDate.getTime())) return false;
          const age = getAge(birthDate);
          return age >= MIN_AGE && age <= MAX_AGE;
        },
        defaultMessage() {
          return `Vous devez être majeur (${MIN_AGE} ans minimum) pour vous inscrire`;
        },
      },
    });
  };
}
