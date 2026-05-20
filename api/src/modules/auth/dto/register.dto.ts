// ===========================================
// DTO - Inscription
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
} from 'class-validator';
import { Gender } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    example: 'jean.dupont@email.fr',
    description: 'Adresse email',
  })
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @ApiProperty({
    example: 'MonMotDePasse123!',
    description: 'Mot de passe (min 8 caractères, 1 majuscule, 1 chiffre)',
  })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
  })
  password: string;

  @ApiProperty({
    example: 'Jean',
    description: 'Prénom',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    example: 'Dupont',
    description: 'Nom de famille',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiPropertyOptional({
    example: '1990-05-15',
    description: 'Date de naissance (format ISO)',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    enum: Gender,
    example: 'MALE',
    description: 'Genre',
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    example: '0612345678',
    description: 'Numéro de téléphone',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\+33|0)[1-9](\d{2}){4}$/, {
    message: 'Numéro de téléphone invalide',
  })
  phone?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Consentement pour recevoir des emails marketing',
  })
  @IsOptional()
  @IsBoolean()
  consentEmail?: boolean;

  @ApiProperty({
    example: true,
    description: 'Consentement pour le traitement des données (obligatoire)',
  })
  @IsBoolean()
  consentData: boolean;
}
