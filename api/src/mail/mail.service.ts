// ===========================================
// Service Mail - Brevo (API transactionnelle v3)
// ===========================================
// Appel direct à l'API REST plutôt qu'au SDK : trois emails à envoyer, un
// seul endpoint, une dépendance de moins à suivre et un corps de requête
// lisible en revue. fetch est natif depuis Node 18.
//
// Sans BREVO_API_KEY, le service retombe sur le mode journalisé. C'est ce qui
// permet de dérouler le tunnel en local et en intégration continue sans compte
// Brevo, et sans piéger un développeur qui n'aurait pas la clé.

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

interface MailPayload {
  to: string;
  subject: string;
  html: string;
  /** Journalisé hors production pour dérouler le parcours sans boîte mail. */
  debugCode?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly isProduction: boolean;
  private readonly apiKey?: string;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(private readonly config: ConfigService) {
    this.isProduction = this.config.get<string>('NODE_ENV') === 'production';
    this.apiKey = this.config.get<string>('BREVO_API_KEY');
    this.senderEmail = this.config.get<string>('BREVO_SENDER_EMAIL', 'noreply@thetiptop.fr');
    this.senderName = this.config.get<string>('BREVO_SENDER_NAME', 'Thé Tip Top');

    if (!this.apiKey) {
      this.logger.warn(
        'BREVO_API_KEY absente : les emails sont journalisés au lieu d’être envoyés.',
      );
    }
  }

  /**
   * Code de vérification à 6 chiffres du tunnel de participation (RG-06).
   */
  async sendVerificationCode(to: string, code: string, expiresAt: Date): Promise<void> {
    await this.send({
      to,
      subject: `${code} — votre code de participation Thé Tip Top`,
      debugCode: code,
      html: this.layout(
        'Confirmez votre participation',
        `<p>Saisissez ce code sur le site pour valider votre participation et découvrir votre lot.</p>
         ${this.codeBlock(code)}
         <p>Ce code est valable jusqu'au <strong>${this.formatDate(expiresAt)}</strong>.
         Passé ce délai, votre code de ticket redeviendra disponible.</p>`,
      ),
    });
  }

  /**
   * Relance avant expiration du code (RG-20 : J+24h, J+36h, J+47h).
   */
  async sendVerificationReminder(to: string, code: string, hoursLeft: number): Promise<void> {
    const delay = hoursLeft === 1 ? 'une heure' : `${hoursLeft} heures`;

    await this.send({
      to,
      subject: `Il vous reste ${delay} pour valider votre participation`,
      debugCode: code,
      html: this.layout(
        'Votre participation attend une confirmation',
        `<p>Votre code de participation expire dans <strong>${delay}</strong>.
         Sans confirmation, votre ticket sera libéré et vous devrez recommencer.</p>
         ${this.codeBlock(code)}`,
      ),
    });
  }

  /**
   * Le délai est écoulé : le ticket a été libéré, la session est close.
   */
  async sendExpirationNotice(to: string): Promise<void> {
    await this.send({
      to,
      subject: 'Votre participation Thé Tip Top a expiré',
      html: this.layout(
        'Délai dépassé',
        `<p>Faute de confirmation dans les 48 heures, votre participation n'a pas pu être
         enregistrée et votre code de ticket a été libéré.</p>
         <p>Il reste utilisable : vous pouvez recommencer quand vous le souhaitez.</p>`,
      ),
    });
  }

  // ===========================================
  // Envoi
  // ===========================================

  /**
   * Un échec d'envoi ne remonte jamais en exception.
   *
   * À ce stade le lead est créé et le ticket réservé : faire échouer la requête
   * HTTP afficherait une erreur à l'utilisateur alors que sa participation est
   * bien enregistrée, et l'inciterait à recommencer sur un ticket désormais
   * bloqué. On journalise en erreur — le monitoring le voit — et l'utilisateur
   * dispose du bouton de renvoi.
   */
  private async send(payload: MailPayload): Promise<void> {
    if (!this.apiKey) {
      this.logStub(payload);
      return;
    }

    try {
      const response = await fetch(BREVO_ENDPOINT, {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { email: this.senderEmail, name: this.senderName },
          // contactPixelTrackingConsent à false : recommandation CNIL du
          // 14/04/2026. Ces emails sont transactionnels et n'ont aucun besoin
          // d'un suivi d'ouverture individuel, qui exigerait un consentement
          // explicite et distinct.
          to: [{ email: payload.to, contactPixelTrackingConsent: false }],
          subject: payload.subject,
          htmlContent: payload.html,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(
          `Envoi Brevo refusé (${response.status}) vers ${this.maskEmail(payload.to)} : ${body}`,
        );
        return;
      }

      this.logger.log(`Email envoyé à ${this.maskEmail(payload.to)} — ${payload.subject}`);
    } catch (error) {
      this.logger.error(
        `Envoi Brevo impossible vers ${this.maskEmail(payload.to)} : ${(error as Error).message}`,
      );
    }
  }

  private logStub(payload: MailPayload): void {
    // Le code n'est journalisé qu'en dehors de la production.
    const codePart = payload.debugCode && !this.isProduction ? ` code=${payload.debugCode}` : '';
    this.logger.log(`[STUB] ${payload.subject} -> ${this.maskEmail(payload.to)}${codePart}`);
  }

  // ===========================================
  // Gabarit
  // ===========================================

  private layout(title: string, body: string): string {
    return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#FAF6EF;font-family:Helvetica,Arial,sans-serif;color:#1A1A1A;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #E8D5B0;border-radius:8px;padding:32px;">
      <p style="margin:0 0 24px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#BA6905;">Thé Tip Top</p>
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;">${title}</h1>
      <div style="font-size:14px;line-height:1.7;color:#4A4A4A;">${body}</div>
      <p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #E8D5B0;font-size:11px;color:#8A8378;">
        Cet email vous est adressé dans le cadre du jeu-concours Thé Tip Top.
        Si vous n'êtes pas à l'origine de cette demande, ignorez-le simplement.
      </p>
    </div>
  </body>
</html>`;
  }

  private codeBlock(code: string): string {
    return `<p style="margin:24px 0;text-align:center;font-size:32px;letter-spacing:8px;font-weight:700;color:#BA6905;">${code}</p>`;
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Europe/Paris',
    });
  }

  /** Une adresse complète n'a rien à faire dans les journaux du serveur. */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    return `${local.slice(0, 2)}${'*'.repeat(Math.max(local.length - 2, 1))}@${domain}`;
  }
}
