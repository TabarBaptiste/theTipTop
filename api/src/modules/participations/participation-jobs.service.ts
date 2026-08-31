// ===========================================
// Jobs planifiés du tunnel de participation
// ===========================================
// Trois balayages périodiques : expiration des leads non confirmés,
// relances avant expiration (RG-20) et purge RGPD (RG-21).
//
// Tous les jobs sont écrits pour être rejouables sans effet de bord : chaque
// écriture porte sa condition dans le WHERE, de sorte qu'une seconde exécution
// simultanée ne trouve plus rien à modifier. C'est ce qui remplace un verrou
// distribué si l'API tourne un jour en plusieurs instances.

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeadStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';

// RG-21 : délai de conservation après expiration, à des fins statistiques.
const PURGE_DELAY_DAYS = 30;
// Domaine réservé (RFC 2606) : garantit qu'aucun email anonymisé ne peut être
// routé par erreur vers une vraie boîte.
const ANONYMIZED_EMAIL_DOMAIN = 'anonymise.invalid';

// RG-20 : les trois relances, exprimées en heures restantes avant expiration.
// L'ordre compte : remindersSent sert à la fois de compteur et de garde.
const REMINDER_STEPS = [
  { alreadySent: 0, hoursBefore: 24 },
  { alreadySent: 1, hoursBefore: 12 },
  { alreadySent: 2, hoursBefore: 1 },
];

@Injectable()
export class ParticipationJobsService {
  private readonly logger = new Logger(ParticipationJobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /**
   * Bascule en EXPIRE les leads dont le code de vérification a dépassé les 48 h.
   *
   * Aucun ticket à libérer : le code n'est consommé qu'à la confirmation, donc
   * un lead abandonné n'a jamais immobilisé quoi que ce soit.
   *
   * Toutes les dix minutes : quelques minutes de retard sur l'échéance annoncée
   * sont sans conséquence, alors qu'un balayage à la minute interrogerait la
   * base pour rien.
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async expireStaleLeads(): Promise<void> {
    const now = new Date();

    const expiring = await this.prisma.lead.findMany({
      where: {
        status: LeadStatus.EN_ATTENTE_VERIFICATION,
        codeExpiresAt: { lt: now },
      },
      select: { id: true, email: true },
    });

    if (expiring.length > 0) {
      await this.prisma.lead.updateMany({
        where: {
          id: { in: expiring.map((lead) => lead.id) },
          status: LeadStatus.EN_ATTENTE_VERIFICATION,
        },
        data: {
          status: LeadStatus.EXPIRE,
          purgeAfter: this.daysFromNow(PURGE_DELAY_DAYS),
          // Le code ne doit pas survivre à l'expiration.
          verificationCode: null,
        },
      });

      // Lu une seule fois, et seulement s'il y a des leads a notifier : le
      // balayage tourne toutes les dix minutes, la plupart du temps a vide.
      const gameConfig = await this.prisma.gameConfig.findFirst({
        where: { isActive: true },
        select: { claimEndDate: true },
      });

      for (const lead of expiring) {
        await this.mail.sendExpirationNotice(lead.email, gameConfig?.claimEndDate ?? null);
      }
    }

    if (expiring.length > 0) {
      this.logger.log(`Leads expirés : ${expiring.length}`);
    }
  }

  /**
   * RG-20 : relances à 24 h, 12 h et 1 h avant expiration du code.
   *
   * Toutes les trente minutes, et non toutes les heures : la dernière relance
   * vise une heure avant l'échéance. Un balayage horaire pourrait la faire
   * partir au moment même de l'expiration, donc trop tard pour servir.
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async sendVerificationReminders(): Promise<void> {
    const now = new Date();
    let sent = 0;

    for (const step of REMINDER_STEPS) {
      const threshold = new Date(now.getTime() + step.hoursBefore * 60 * 60 * 1000);

      const due = await this.prisma.lead.findMany({
        where: {
          status: LeadStatus.EN_ATTENTE_VERIFICATION,
          remindersSent: step.alreadySent,
          // Échéance déjà entrée dans la fenêtre, mais pas encore dépassée :
          // un lead expiré relève du job d'expiration, pas des relances.
          codeExpiresAt: { lte: threshold, gt: now },
        },
        select: { id: true, email: true, verificationCode: true },
      });

      for (const lead of due) {
        if (!lead.verificationCode) {
          continue;
        }

        // On envoie AVANT d'incrementer, et non l'inverse.
        //
        // L'ordre precedent reservait la relance d'abord : aucun doublon
        // possible, mais un envoi echoue etait definitivement perdu puisque le
        // compteur affirmait le contraire. C'est exactement ce qui s'est
        // produit tant que le service d'envoi etait un simple stub : trois
        // relances comptees, aucun email parti.
        //
        // Le compromis est assume : si deux executions se chevauchent, les deux
        // peuvent envoyer avant que l'une n'incremente, et le destinataire
        // recoit deux fois le meme message. Un doublon se pardonne, une relance
        // silencieusement perdue non.
        const delivered = await this.mail.sendVerificationReminder(
          lead.email,
          lead.verificationCode,
          step.hoursBefore,
        );

        if (!delivered) {
          // Le compteur reste en l'etat : le prochain balayage retentera.
          continue;
        }

        // La condition sur remindersSent protege encore du double increment.
        const claimed = await this.prisma.lead.updateMany({
          where: { id: lead.id, remindersSent: step.alreadySent },
          data: { remindersSent: step.alreadySent + 1 },
        });

        if (claimed.count === 1) {
          sent += 1;
        }
      }
    }

    if (sent > 0) {
      this.logger.log(`Relances envoyées : ${sent}`);
    }
  }

  /**
   * RG-21 : passé le délai de conservation, les données personnelles des leads
   * expirés sont effacées.
   *
   * La ligne est conservée, vidée de son contenu identifiant : la règle veut
   * des « statistiques anonymisées de conversion », que la suppression pure et
   * simple rendrait impossibles à calculer. Ce qui disparaît, c'est la donnée
   * personnelle, pas le fait statistique.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeExpiredLeads(): Promise<void> {
    const now = new Date();

    const toPurge = await this.prisma.lead.findMany({
      where: {
        status: LeadStatus.EXPIRE,
        purgeAfter: { lt: now },
        // Sans ce filtre, le job rejouerait indéfiniment sur les mêmes lignes.
        email: { not: { endsWith: `@${ANONYMIZED_EMAIL_DOMAIN}` } },
      },
      select: { id: true },
    });

    for (const lead of toPurge) {
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: {
          // Dérivé de l'identifiant technique : ne porte aucune information
          // sur la personne, tout en respectant la contrainte NOT NULL.
          email: `purge-${lead.id}@${ANONYMIZED_EMAIL_DOMAIN}`,
          firstName: 'anonymise',
          lastName: 'anonymise',
          phone: null,
          birthDate: null,
          gender: null,
          verificationCode: null,
          purgeAfter: null,
        },
      });
    }

    if (toPurge.length > 0) {
      this.logger.log(`Leads anonymisés : ${toPurge.length}`);
    }
  }

  private daysFromNow(days: number): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
}
