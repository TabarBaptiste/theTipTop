// ===========================================
// DTO - Rattachement d'une adresse reelle a un compte
// ===========================================

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class RequestEmailChangeDto {
  @ApiProperty({
    example: 'jean.dupont@email.fr',
    description: 'Adresse a rattacher au compte. Un code de confirmation y est envoye.',
  })
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;
}

export class ConfirmEmailChangeDto {
  @ApiProperty({
    example: '482913',
    description: 'Code a six chiffres recu a la nouvelle adresse',
  })
  @IsString()
  // Le format est verifie ici plutot que dans le service : une saisie a cinq
  // chiffres n'a pas a consommer une des tentatives comptees a la confirmation.
  @Matches(/^\d{6}$/, { message: 'Le code doit comporter six chiffres' })
  code: string;
}
