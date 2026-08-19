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

// Adresse de contact deja affichee cote site (page de connexion, mentions
// legales). Les emails sont envoyes depuis une boite non surveillee : sans
// alternative visible, un destinataire ayant une vraie question repondrait dans
// le vide.
const SUPPORT_EMAIL = 'contact@thetiptop.fr';

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
  async sendVerificationCode(to: string, code: string, expiresAt: Date): Promise<boolean> {
    return this.send({
      to,
      subject: `${code} — votre code de participation Thé Tip Top`,
      debugCode: code,
      html: this.layout(
        'Confirmez votre participation',
        `<p>Saisissez ce code sur le site pour valider votre participation et découvrir votre lot.</p>
         ${this.codeBlock(code)}
         <p>Ce code de confirmation est valable jusqu'au
         <strong>${this.formatDate(expiresAt)}</strong>. Passé ce délai il faudra recommencer :
         votre code de ticket, lui, n'est pas consommé et reste valable.</p>`,
      ),
    });
  }

  /**
   * Relance avant expiration du code (RG-20 : 24 h, 12 h et 1 h avant l'échéance).
   */
  async sendVerificationReminder(to: string, code: string, hoursLeft: number): Promise<boolean> {
    const delay = hoursLeft === 1 ? 'une heure' : `${hoursLeft} heures`;

    return this.send({
      to,
      subject: `Il vous reste ${delay} pour valider votre participation`,
      debugCode: code,
      html: this.layout(
        'Votre participation attend une confirmation',
        `<p>Votre code de confirmation expire dans <strong>${delay}</strong>.
         Sans confirmation, il faudra reprendre la saisie depuis le début.</p>
         ${this.codeBlock(code)}`,
      ),
    });
  }

  /**
   * Confirmation d'une adresse ajoutée à un compte existant.
   *
   * Distinct de sendVerificationCode, qui parle de participation : ici le code
   * ne valide pas un ticket mais l'adresse elle-même, sur un compte déjà créé.
   * Le cas type est un compte Facebook qui n'a jamais transmis d'adresse et
   * fonctionne sous une adresse de substitution injoignable.
   */
  async sendEmailConfirmation(to: string, code: string, expiresAt: Date): Promise<boolean> {
    return this.send({
      to,
      subject: `${code} — confirmez votre adresse Thé Tip Top`,
      debugCode: code,
      html: this.layout(
        'Confirmez votre adresse',
        `<p>Saisissez ce code sur le site pour rattacher cette adresse à votre compte.</p>
         ${this.codeBlock(code)}
         <p>Ce code est valable jusqu'au <strong>${this.formatDate(expiresAt)}</strong>.</p>
         <p>Tant que cette confirmation n'est pas faite, votre compte reste injoignable :
         nous ne pourrions vous prévenir ni d'un lot gagné, ni de son délai de retrait.</p>
         <p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message :
         sans le code ci-dessus, aucune modification n'est possible.</p>`,
      ),
    });
  }

  /**
   * Annonce du lot gagné, envoyée dès que la participation est enregistrée.
   *
   * Le code y figure volontairement : contrairement au code de confirmation à
   * six chiffres, celui du ticket est ce que le participant présentera en
   * boutique. C'est son justificatif, il doit pouvoir le retrouver dans sa
   * boîte sans se reconnecter.
   */
  async sendPrizeWon(
    to: string,
    prize: { name: string; value?: string | null },
    code: string,
    claimEndDate?: Date | null,
  ): Promise<boolean> {
    const value = prize.value ? ` — d'une valeur de ${prize.value}` : '';

    return this.send({
      to,
      subject: `Vous avez gagné : ${prize.name} !`,
      html: this.layout(
        'Félicitations, vous avez gagné',
        `<p>Votre participation est enregistrée. Vous remportez :</p>
         <p style="margin:24px 0;font-size:20px;font-weight:bold;color:#BA6905;">
           ${prize.name}${value}
         </p>
         <p>Présentez le code ci-dessous en boutique pour retirer votre lot, ou faites-le
         vous expédier depuis notre site de vente en ligne.</p>
         ${this.codeBlock(code)}
         ${this.claimWindowParagraph(claimEndDate, 'réclamer votre lot')}`,
      ),
    });
  }

  /**
   * Le délai de confirmation est écoulé.
   *
   * Le ticket n'a jamais été consommé — il ne l'est qu'à la confirmation de
   * l'email — donc rien n'est perdu. Le message indique le temps restant pour
   * recommencer, borné par la fin de la période de réclamation du jeu.
   */
  async sendExpirationNotice(to: string, claimEndDate?: Date | null): Promise<boolean> {
    return this.send({
      to,
      subject: 'Votre participation Thé Tip Top a expiré',
      html: this.layout(
        'Délai dépassé',
        `<p>Faute de confirmation dans les 48 heures, votre participation n'a pas été
         enregistrée.</p>
         <p>Votre code de ticket n'a pas été consommé : il reste utilisable, vous pouvez
         recommencer quand vous le souhaitez.</p>
         ${this.claimWindowParagraph(claimEndDate, 'saisir votre code et réclamer votre lot')}`,
      ),
    });
  }

  /**
   * Phrase indiquant le temps restant avant la fin de la periode de reclamation.
   *
   * Le CDC accorde les 30 jours du jeu plus 30 jours a compter de la cloture.
   * On affiche le nombre de jours restants a la date d'envoi plutot que la
   * duree totale : c'est la seule information exploitable par le destinataire.
   *
   * L'action est passee en parametre car elle differe selon le message : apres
   * une expiration il reste un code a saisir, apres un gain il ne reste qu'a
   * retirer le lot.
   */
  private claimWindowParagraph(claimEndDate: Date | null | undefined, action: string): string {
    if (!claimEndDate) {
      return '';
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    const daysLeft = Math.ceil((claimEndDate.getTime() - Date.now()) / msPerDay);

    if (daysLeft <= 0) {
      return `<p>Le délai de réclamation des lots est désormais écoulé.</p>`;
    }

    const plural = daysLeft > 1 ? 's' : '';
    return `<p>Il vous reste <strong>${daysLeft} jour${plural}</strong> pour ${action}, soit
      jusqu'au <strong>${this.formatDate(claimEndDate)}</strong>.</p>`;
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
  private async send(payload: MailPayload): Promise<boolean> {
    if (!this.apiKey) {
      this.logStub(payload);
      // Le mode journalise est un succes fonctionnel : en local, il permet aux
      // appelants de progresser comme si l'email etait parti.
      return true;
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
        return false;
      }

      this.logger.log(`Email envoyé à ${this.maskEmail(payload.to)} — ${payload.subject}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Envoi Brevo impossible vers ${this.maskEmail(payload.to)} : ${(error as Error).message}`,
      );
      return false;
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
      <p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #E8D5B0;font-size:11px;color:#4A463E;">
        Cet email vous est adressé dans le cadre du jeu-concours Thé Tip Top.
        Si vous n'êtes pas à l'origine de cette demande, ignorez-le simplement.
      </p>
      <p style="margin:12px 0 0;font-size:11px;color:#4A463E;">
        <strong>Message automatique, merci de ne pas y répondre.</strong>
        Pour toute question, écrivez-nous à
        <a href="mailto:${SUPPORT_EMAIL}" style="color:#A85D04;">${SUPPORT_EMAIL}</a>.
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
