// ===========================================
// DTO - Créer une participation
// ===========================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateParticipationDto {
  @ApiProperty({
    example: 'ABC123XYZ9',
    description: 'Code à 10 caractères présent sur le ticket de caisse',
  })
  @IsString()
  @Length(10, 10, { message: 'Le code doit contenir exactement 10 caractères' })
  @Matches(/^[A-Za-z0-9]{10}$/, {
    message: 'Le code doit contenir uniquement des lettres et des chiffres',
  })
  code: string;

  // Champs volontairement optionnels : l'espace personnel soumet un code seul
  // et doit continuer de fonctionner à l'identique. Ils ne sont renseignés que
  // par le chemin Social Login (UC-05, chemin A), où le participant consent au
  // moment de sa première participation. Fournis, ils déclenchent la création
  // du lead « verifie » attendu par le cahier des charges.
  @ApiPropertyOptional({
    example: true,
    description:
      'Consentement au traitement des données. Requis uniquement pour la première ' +
      'participation via Social Login, où il déclenche la création du lead.',
  })
  @IsOptional()
  @IsBoolean()
  consentData?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Consentement pour recevoir des emails marketing',
  })
  @IsOptional()
  @IsBoolean()
  consentEmail?: boolean;

  // Recommandation CNIL du 14/04/2026 : distinct de consentEmail.
  @ApiPropertyOptional({
    example: false,
    description: "Consentement au suivi d'ouverture des emails (distinct de consentEmail)",
  })
  @IsOptional()
  @IsBoolean()
  pixelTrackingConsent?: boolean;
}
