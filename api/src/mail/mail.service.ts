// ===========================================
// Service Mail
// ===========================================
// Implémentation stub : aucun email n'est réellement envoyé pour l'instant.
// L'interface est celle attendue par l'intégration Brevo à venir, de sorte que
// seul l'intérieur des méthodes changera.
//
// Note CNIL (recommandation du 14/04/2026) : ces envois sont transactionnels
// et ne doivent PAS embarquer de pixel de suivi individuel. Au branchement de
// Brevo, envoyer contactPixelTrackingConsent: false sur ces appels.

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly isProduction = process.env.NODE_ENV === 'production';

  /**
   * Code de vérification à 6 chiffres du tunnel de participation (RG-06).
   */
  async sendVerificationCode(to: string, code: string, expiresAt: Date): Promise<void> {
    this.log('code de vérification', to, code, `expire le ${expiresAt.toISOString()}`);
  }

  /**
   * Relance avant expiration du code (RG-20 : J+24h, J+36h, J+47h).
   */
  async sendVerificationReminder(to: string, code: string, hoursLeft: number): Promise<void> {
    this.log('relance', to, code, `${hoursLeft} h restantes`);
  }

  /**
   * Notification de fin de session : le code a expiré, le ticket est libéré.
   */
  async sendExpirationNotice(to: string): Promise<void> {
    this.log('expiration', to, null, 'ticket libéré');
  }

  /**
   * Le code n'est journalisé qu'en dehors de la production : il permet de
   * dérouler le tunnel en local sans boîte mail, mais n'a rien à faire dans
   * les logs d'un serveur de production.
   */
  private log(kind: string, to: string, code: string | null, detail: string): void {
    const codePart = code && !this.isProduction ? ` code=${code}` : '';
    this.logger.log(`[STUB] ${kind} -> ${to}${codePart} (${detail})`);
  }
}
