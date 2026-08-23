import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class SubscribeNewsletterDto {
  @ApiProperty({
    example: 'jean.dupont@email.fr',
    description: 'Adresse à inscrire à la newsletter. Normalisée en minuscules avant stockage.',
  })
  @IsEmail({}, { message: 'Adresse e-mail invalide' })
  // Borne haute defensive : la contrainte d'unicite porte sur une colonne
  // texte, rien n'empecherait sinon d'y pousser une chaine demesuree.
  @MaxLength(254, { message: 'Adresse e-mail trop longue' })
  email: string;
}
