import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class ChangePasswordDto {
  @ApiPropertyOptional({
    example: 'MotDePasseActuel123!',
    description:
      'Mot de passe actuel, exigé pour prouver que la session appartient bien au titulaire. ' +
      "Omis lorsque le compte n'en a pas encore : créé par Google ou Facebook, il en définit " +
      'un pour la première fois.',
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({
    example: 'NouveauMotDePasse123!',
    description: 'Nouveau mot de passe',
  })
  @IsString()
  // Mêmes règles qu'à l'inscription : un mot de passe changé ne doit pas
  // pouvoir être plus faible que celui choisi au départ.
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
  })
  newPassword: string;
}
