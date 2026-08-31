// ===========================================
// DTO - Ouverture d'une participation (UC-05, parcours classique)
// ===========================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
  Equals,
} from 'class-validator';
import { Gender } from '@prisma/client';
import { IsAdult } from '../../../common/validators/is-adult.validator';

export class InitiateParticipationDto {
  @ApiProperty({
    example: 'ABCDEFGH23',
    description: 'Code du ticket de caisse (10 caractères)',
  })
  @IsString()
  @Matches(/^[A-Za-z0-9]{10}$/, {
    message: 'Le code doit contenir exactement 10 caractères alphanumériques',
  })
  code: string;

  @ApiProperty({
    example: 'jean.dupont@email.fr',
    description: 'Adresse email, destinataire du code de vérification',
  })
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @ApiProperty({ example: 'Jean', description: 'Prénom' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Dupont', description: 'Nom de famille' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiPropertyOptional({
    example: '1990-05-15',
    description: 'Date de naissance (format AAAA-MM-JJ, majorité requise)',
  })
  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La date de naissance doit être au format AAAA-MM-JJ (année sur 4 chiffres)',
  })
  @IsAdult()
  birthDate?: string;

  @ApiPropertyOptional({ enum: Gender, example: 'MALE', description: 'Genre' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: '0612345678', description: 'Numéro de téléphone' })
  @IsOptional()
  @IsString()
  @Matches(/^(\+33|0)[1-9](\d{2}){4}$/, {
    message: 'Numéro de téléphone invalide',
  })
  phone?: string;

  // RG-02 : le consentement est obligatoire et doit être explicite. @IsBoolean
  // seul accepterait `false`, ce qui laisserait passer une participation sans
  // consentement : on exige donc la valeur `true`.
  @ApiProperty({
    example: true,
    description: 'Consentement au traitement des données (obligatoire)',
  })
  @IsBoolean()
  @Equals(true, { message: 'Le consentement au traitement des données est obligatoire' })
  consentData: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Consentement pour recevoir des emails marketing',
  })
  @IsOptional()
  @IsBoolean()
  consentEmail?: boolean;

  // Recommandation CNIL du 14/04/2026 : distinct de consentEmail. Absent =
  // inconnu, on ne suppose jamais l'accord.
  @ApiPropertyOptional({
    deprecated: true,
    example: false,
    description:
      "Obsolete : la valeur est acceptee mais ignoree. Le pixel de suivi est desactive pour tous les envois, conformement a la recommandation CNIL du 14/04/2026 - ce consentement n'est donc plus demande ni enregistre. Le champ subsiste le temps que les clients en cache cessent de l'envoyer : la validation refusant les proprietes inconnues, le retirer maintenant repondrait 400 a une participation en cours.",
  })
  @IsOptional()
  @IsBoolean()
  pixelTrackingConsent?: boolean;

  // RG-03 : piège à robots. Champ masqué en CSS côté formulaire, donc toujours
  // vide pour un humain. Un CAPTCHA dégraderait l'expérience pour tout le monde.
  @ApiPropertyOptional({
    description: 'Champ anti-robot : doit rester vide',
  })
  @IsOptional()
  @IsString()
  @MaxLength(0, { message: 'Requête rejetée' })
  website?: string;
}
