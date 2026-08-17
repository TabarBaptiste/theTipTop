// ===========================================
// DTO - Mise à jour utilisateur
// ===========================================

import { ApiPropertyOptional } from '@nestjs/swagger';
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
import { IsAdult } from '../../../common/validators/is-adult.validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'jean.dupont@email.fr',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'NouveauMotDePasse123!',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  password?: string;

  @ApiPropertyOptional({ example: 'Jean' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Dupont' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ example: '1990-05-15' })
  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La date de naissance doit être au format AAAA-MM-JJ (année sur 4 chiffres)',
  })
  @IsAdult()
  birthDate?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: '0612345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  consentEmail?: boolean;
}
