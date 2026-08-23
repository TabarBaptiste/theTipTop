import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class UnsubscribeNewsletterDto {
  @ApiProperty({
    example: 'a3f1…',
    description:
      "Jeton opaque figurant dans le lien de désinscription. Il fait foi : un abonné n'a pas " +
      'de compte, et accepter une simple adresse laisserait désabonner celle d’autrui.',
  })
  @IsString()
  // 32 octets rendus en hexadecimal. Le format est verifie ici pour ecarter
  // les valeurs manifestement invalides avant d'interroger la base.
  @Matches(/^[a-f0-9]{64}$/, { message: 'Jeton de désinscription invalide' })
  token: string;
}
