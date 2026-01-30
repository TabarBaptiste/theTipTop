// ===========================================
// DTO - Connexion
// ===========================================

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'jean.dupont@email.fr',
    description: 'Adresse email',
  })
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @ApiProperty({
    example: 'MonMotDePasse123!',
    description: 'Mot de passe',
  })
  @IsString()
  @MinLength(1, { message: 'Le mot de passe est requis' })
  password: string;
}
