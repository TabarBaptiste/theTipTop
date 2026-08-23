// ===========================================
// Inscription à la newsletter
// ===========================================

import { randomBytes } from 'crypto';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../prisma/prisma.service';

const BREVO_CONTACTS_ENDPOINT = 'https://api.brevo.com/v3/contacts';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);
  private readonly apiKey?: string;
  private readonly listId?: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.apiKey = config.get<string>('BREVO_API_KEY');

    const listId = config.get<string>('BREVO_NEWSLETTER_LIST_ID');
    this.listId = listId ? Number(listId) : undefined;

    if (!this.apiKey || !this.listId) {
      this.logger.warn(
        'Newsletter : BREVO_API_KEY ou BREVO_NEWSLETTER_LIST_ID absente. ' +
          'Les inscriptions sont enregistrées en base sans être poussées vers Brevo.',
      );
    }
  }

  /**
   * Inscrit une adresse, puis la pousse vers la liste Brevo.
   *
   * L'ordre n'est pas indifférent. Enregistrer d'abord garantit qu'une panne de
   * Brevo, une clé absente ou un identifiant de liste erroné ne fasse pas
   * perdre l'inscription : elle reste en base, `brevoSyncedAt` à null, et peut
   * être rejouée. L'inverse - pousser puis enregistrer - perdrait l'adresse à
   * la première indisponibilité.
   *
   * L'appelant reçoit toujours un succès dès lors que l'enregistrement a
   * abouti. Du point de vue du visiteur, il est bien inscrit ; que la
   * synchronisation soit différée ne le concerne pas.
   */
  async subscribe(email: string): Promise<{ dejaInscrit: boolean }> {
    const normalise = email.trim().toLowerCase();

    const existant = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: normalise },
      select: { id: true, brevoSyncedAt: true, unsubscribedAt: true },
    });

    // Un upsert plutôt qu'une branche create/update : deux requêtes simultanées
    // sur la même adresse liraient toutes deux un `existant` nul, et la seconde
    // violerait la contrainte d'unicité. L'endpoint étant public, le cas se
    // produira.
    //
    // La date de consentement d'origine n'est pas réécrite - c'est elle qui
    // fonde la conservation. Une désinscription antérieure est en revanche
    // levée : réinscrire est bien une nouvelle demande.
    const abonne = await this.prisma.newsletterSubscriber.upsert({
      where: { email: normalise },
      update: { unsubscribedAt: null },
      create: { email: normalise, unsubscribeToken: randomBytes(32).toString('hex') },
      select: { id: true },
    });

    const dejaInscrit = existant !== null && existant.unsubscribedAt === null;

    // Inutile de repousser un contact déjà synchronisé et toujours abonné.
    if (!existant?.brevoSyncedAt || existant.unsubscribedAt) {
      await this.pousserVersBrevo(abonne.id, normalise);
    }

    return { dejaInscrit };
  }

  /**
   * Désinscrit le porteur d'un jeton, puis le retire de la liste Brevo.
   *
   * Le jeton fait foi : un abonné n'a pas de compte, et accepter une simple
   * adresse laisserait n'importe qui désabonner n'importe qui.
   *
   * L'opération est idempotente. Un lien de désinscription vit dans une boîte
   * mail et sera cliqué deux fois ; la seconde ne doit pas afficher d'erreur.
   */
  async unsubscribe(token: string): Promise<{ email: string }> {
    const abonne = await this.prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
      select: { id: true, email: true, unsubscribedAt: true },
    });

    if (!abonne) {
      throw new NotFoundException('Ce lien de désinscription n’est plus valide.');
    }

    if (abonne.unsubscribedAt) {
      return { email: abonne.email };
    }

    await this.prisma.newsletterSubscriber.update({
      where: { id: abonne.id },
      data: { unsubscribedAt: new Date() },
    });

    await this.retirerDeBrevo(abonne.email);

    return { email: abonne.email };
  }

  /**
   * Retire le contact de la liste Brevo.
   *
   * Un échec ici ne remonte pas : la désinscription est déjà enregistrée de
   * notre côté, et c'est elle qui fait foi. Refuser la demande parce que Brevo
   * est indisponible reviendrait à retenir quelqu'un qui a demandé à partir.
   */
  private async retirerDeBrevo(email: string): Promise<void> {
    if (!this.apiKey || !this.listId) return;

    try {
      const response = await fetch(
        `${BREVO_CONTACTS_ENDPOINT}/lists/${this.listId}/contacts/remove`,
        {
          method: 'POST',
          headers: {
            'api-key': this.apiKey,
            'content-type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({ emails: [email] }),
        },
      );

      if (!response.ok) {
        this.logger.error(`Retrait Brevo refusé (${response.status}) : ${await response.text()}`);
      }
    } catch (error) {
      this.logger.error(`Retrait Brevo impossible : ${(error as Error).message}`);
    }
  }

  /**
   * Ajoute le contact à la liste Brevo et consigne l'issue.
   *
   * `updateEnabled` évite un 400 sur un contact que Brevo connaît déjà : il est
   * alors simplement rattaché à la liste.
   */
  private async pousserVersBrevo(id: string, email: string): Promise<void> {
    if (!this.apiKey || !this.listId) {
      await this.consigner(id, 'Configuration Brevo absente');
      return;
    }

    try {
      const response = await fetch(BREVO_CONTACTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          listIds: [this.listId],
          updateEnabled: true,
        }),
      });

      if (!response.ok) {
        const corps = await response.text();
        this.logger.error(`Contact Brevo refusé (${response.status}) : ${corps}`);
        await this.consigner(id, `${response.status} ${corps}`.slice(0, 500));
        return;
      }

      await this.prisma.newsletterSubscriber.update({
        where: { id },
        data: { brevoSyncedAt: new Date(), brevoError: null },
      });
      this.logger.log(`Contact ajouté à la liste ${this.listId}`);
    } catch (error) {
      const message = (error as Error).message;
      this.logger.error(`Contact Brevo impossible : ${message}`);
      await this.consigner(id, message.slice(0, 500));
    }
  }

  /** Garde la trace du dernier échec, sans jamais faire échouer l'inscription. */
  private async consigner(id: string, motif: string): Promise<void> {
    await this.prisma.newsletterSubscriber.update({
      where: { id },
      data: { brevoError: motif },
    });
  }
}
