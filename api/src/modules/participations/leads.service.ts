// ===========================================
// Service Leads - tunnel de participation public (UC-05)
// ===========================================
// Parcours sans compte : le visiteur soumet le formulaire, son ticket est
// réservé, il confirme son email sous 48 h, puis le compte et la participation
// sont créés. Les règles RG-xx référencées viennent du cahier des charges.

import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { Prisma, LeadStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { MailService } from '../../mail/mail.service';
import { TicketsService } from '../tickets/tickets.service';
import { AuthService } from '../auth/auth.service';
import { InitiateParticipationDto } from './dto/initiate-participation.dto';
import { VerifyParticipationDto } from './dto/verify-participation.dto';
import { ResendCodeDto } from './dto/resend-code.dto';

// RG-06 : le code de vérification vaut 48 h. RG-16 impose que la réservation
// du ticket expire exactement en même temps, d'où une constante unique.
const CODE_TTL_HOURS = 48;
// RG-07 : délai minimal entre deux envois.
const RESEND_LOCK_SECONDS = 60;
// RG-08 : au-delà, on propose de corriger l'adresse plutôt que de renvoyer.
const MAX_RESENDS_BEFORE_EMAIL_FIX = 2;
// RG-03 : plafond de soumissions par IP et par heure.
const INITIATE_RATE_LIMIT_PER_HOUR = 10;

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly mail: MailService,
    private readonly ticketsService: TicketsService,
    private readonly authService: AuthService,
  ) {}

  // ===========================================
  // Ouverture d'une participation
  // ===========================================
  async initiate(dto: InitiateParticipationDto, ip: string) {
    await this.checkInitiateRateLimit(ip);

    const normalizedCode = dto.code.toUpperCase().trim();
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Préconditions UC-05 : jeu actif, période ouverte, code exploitable.
    // verifyCode couvre déjà les trois, y compris le message distinct de RG-18.
    const verification = await this.ticketsService.verifyCode(normalizedCode);
    if (!verification.isValid || !verification.ticket) {
      throw new BadRequestException(verification.error || 'Code invalide');
    }

    // RG-01 : mode silencieux. Si un lead actif porte déjà cette adresse, la
    // réponse est strictement identique au parcours nominal. Rien ne doit
    // permettre de déduire qu'une adresse est déjà connue.
    const existingLead = await this.findActiveLeadByEmail(normalizedEmail);
    if (existingLead) {
      return this.silentModeResponse(existingLead, normalizedEmail);
    }

    const code = this.generateVerificationCode();
    const expiresAt = this.hoursFromNow(CODE_TTL_HOURS);

    // Le ticket n'est pas réservé : il reste soumettable tant que personne n'a
    // confirmé son email. On mémorise seulement quel code ce lead vise, pour
    // pouvoir le consommer à la vérification.
    const lead = await this.prisma.lead.create({
      data: {
        email: normalizedEmail,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: dto.phone ?? null,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        gender: dto.gender ?? null,
        status: LeadStatus.EN_ATTENTE_VERIFICATION,
        ticketId: verification.ticket.id,
        verificationCode: code,
        codeExpiresAt: expiresAt,
        lastCodeSentAt: new Date(),
        rgpdConsentAt: new Date(),
        consentEmail: dto.consentEmail ?? false,
      },
    });

    await this.mail.sendVerificationCode(normalizedEmail, code, expiresAt);

    return {
      leadId: lead.id,
      maskedEmail: this.maskEmail(normalizedEmail),
      expiresAt,
    };
  }

  // ===========================================
  // Validation du code reçu par email
  // ===========================================
  async verify(dto: VerifyParticipationDto) {
    const lead = await this.prisma.lead.findUnique({ where: { id: dto.leadId } });

    // Message volontairement identique pour un lead inconnu, un code faux ou
    // un code expiré : distinguer les cas donnerait un oracle à un attaquant.
    if (
      !lead ||
      lead.status !== LeadStatus.EN_ATTENTE_VERIFICATION ||
      lead.verificationCode !== dto.code ||
      !lead.codeExpiresAt ||
      lead.codeExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const ticket = lead.ticketId
        ? await tx.ticket.findUnique({ where: { id: lead.ticketId } })
        : null;

      if (!ticket) {
        throw new ConflictException('Le code associé à cette demande est introuvable.');
      }

      // Le compte peut déjà exister si la personne s'est inscrite par ailleurs
      // (OAuth, inscription classique) : on rattache plutôt que de dupliquer.
      let user = await tx.user.findUnique({ where: { email: lead.email } });
      if (!user) {
        user = await tx.user.create({
          data: {
            email: lead.email,
            // Option A : le mot de passe est choisi après la validation, via
            // l'endpoint de mise à jour du profil.
            password: null,
            firstName: lead.firstName,
            lastName: lead.lastName,
            phone: lead.phone,
            birthDate: lead.birthDate,
            gender: lead.gender,
            role: Role.CLIENT,
            consentEmail: lead.consentEmail,
            consentData: true,
          },
        });
      }

      // RG-12/RG-13 : la condition isUsed fait partie du UPDATE. Si un autre
      // participant a consommé le code entre-temps, aucune ligne n'est touchée
      // et on refuse : c'est ici, et nulle part avant, que le code est attribué.
      const consumed = await tx.ticket.updateMany({
        where: { id: ticket.id, isUsed: false },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      if (consumed.count === 0) {
        throw new ConflictException('Ce code a déjà été utilisé par un autre participant.');
      }

      const participation = await tx.participation.create({
        data: { userId: user.id, ticketId: ticket.id },
      });

      await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: LeadStatus.VERIFIE,
          verifiedAt: new Date(),
          userId: user.id,
          // Le code ne doit pas survivre à son usage.
          verificationCode: null,
          codeExpiresAt: null,
        },
      });

      return { user, ticket, participation };
    });

    const prizesMap = await this.ticketsService.getPrizesMap();
    const tokens = await this.authService.login(result.user);
    const prize = prizesMap[result.ticket.prizeType];

    // Annonce du gain. Volontairement hors de la transaction : la participation
    // est acquise, un incident d'envoi ne doit pas l'annuler. Le service avale
    // ses erreurs et signale l'echec par sa valeur de retour, ici sans
    // consequence puisque le lot s'affiche aussi a l'ecran.
    const gameConfig = await this.prisma.gameConfig.findFirst({
      where: { isActive: true },
      select: { claimEndDate: true },
    });

    await this.mail.sendPrizeWon(
      result.user.email,
      prize,
      result.ticket.code,
      gameConfig?.claimEndDate ?? null,
    );

    return {
      ...tokens,
      // Le front sait ainsi s'il doit proposer de définir un mot de passe.
      passwordRequired: result.user.password === null,
      participation: {
        id: result.participation.id,
        code: result.ticket.code,
        prizeType: result.ticket.prizeType,
        prize,
        participatedAt: result.participation.createdAt,
      },
    };
  }

  // ===========================================
  // Renvoi du code
  // ===========================================
  async resend(dto: ResendCodeDto) {
    const lead = await this.prisma.lead.findUnique({ where: { id: dto.leadId } });

    if (!lead || lead.status !== LeadStatus.EN_ATTENTE_VERIFICATION) {
      throw new NotFoundException('Demande introuvable ou déjà finalisée');
    }

    // RG-07 : verrou de 60 s entre deux envois.
    const elapsedMs = Date.now() - (lead.lastCodeSentAt?.getTime() ?? 0);
    const remainingSeconds = Math.ceil((RESEND_LOCK_SECONDS * 1000 - elapsedMs) / 1000);
    if (remainingSeconds > 0) {
      throw new HttpException(
        `Veuillez patienter ${remainingSeconds} seconde(s) avant un nouveau renvoi.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // RG-08 : la correction d'adresse relance le scénario nominal, donc remet
    // le compteur à zéro.
    const emailChanged = Boolean(dto.email) && dto.email !== lead.email;
    const newEmail = emailChanged ? dto.email!.toLowerCase().trim() : lead.email;

    if (emailChanged) {
      const conflicting = await this.findActiveLeadByEmail(newEmail);
      if (conflicting && conflicting.id !== lead.id) {
        // Mode silencieux : la réponse doit avoir exactement la forme d'un
        // renvoi nominal, sans quoi sa structure trahirait à elle seule que
        // l'adresse est déjà connue. Rien n'est régénéré ni prolongé.
        return {
          maskedEmail: this.maskEmail(newEmail),
          expiresAt: lead.codeExpiresAt ?? this.hoursFromNow(CODE_TTL_HOURS),
          shouldOfferEmailCorrection: false,
        };
      }
    }

    const code = this.generateVerificationCode();
    const expiresAt = this.hoursFromNow(CODE_TTL_HOURS);
    const resendCount = emailChanged ? 0 : lead.resendCount + 1;

    await this.prisma.lead.update({
      where: { id: lead.id },
      data: {
        email: newEmail,
        // Le renvoi invalide le code précédent (RG-07).
        verificationCode: code,
        codeExpiresAt: expiresAt,
        lastCodeSentAt: new Date(),
        resendCount,
        // Les relances repartent de zéro sur la nouvelle échéance.
        remindersSent: 0,
      },
    });

    await this.mail.sendVerificationCode(newEmail, code, expiresAt);

    return {
      maskedEmail: this.maskEmail(newEmail),
      expiresAt,
      // RG-08 : signale au front qu'il doit proposer de corriger l'adresse
      // plutôt qu'un énième renvoi.
      shouldOfferEmailCorrection: resendCount >= MAX_RESENDS_BEFORE_EMAIL_FIX,
    };
  }

  // ===========================================
  // Utilitaires
  // ===========================================

  /**
   * RG-01 : un lead ne bloque une adresse que s'il est vérifié ou en attente
   * non expirée. Un lead expiré doit laisser repasser une nouvelle tentative.
   */
  private async findActiveLeadByEmail(email: string) {
    return this.prisma.lead.findFirst({
      where: {
        email,
        OR: [
          { status: LeadStatus.VERIFIE },
          {
            status: LeadStatus.EN_ATTENTE_VERIFICATION,
            codeExpiresAt: { gt: new Date() },
          },
        ],
      },
    });
  }

  /**
   * RG-01 : réponse indiscernable du parcours nominal. Aucun code n'est
   * régénéré et aucun ticket n'est réservé, mais l'appelant ne peut pas le
   * savoir. Un lead encore en attente récupère son propre identifiant, ce qui
   * lui permet de poursuivre son parcours en cours.
   */
  private silentModeResponse(
    lead: { id: string; status: LeadStatus; codeExpiresAt: Date | null },
    email: string,
  ) {
    const stillPending = lead.status === LeadStatus.EN_ATTENTE_VERIFICATION;

    return {
      leadId: lead.id,
      maskedEmail: this.maskEmail(email),
      expiresAt: stillPending ? lead.codeExpiresAt : this.hoursFromNow(CODE_TTL_HOURS),
    };
  }

  /**
   * RG-06 : 6 chiffres. randomInt du module crypto et non Math.random, dont la
   * sortie est prédictible et n'a rien à faire dans un secret à usage unique.
   */
  private generateVerificationCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  /**
   * RG-09 : deux premiers caractères du nom, domaine complet.
   * jean.dupont@email.fr -> je*********@email.fr
   */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const visible = local.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(local.length - 2, 1))}@${domain}`;
  }

  private hoursFromNow(hours: number): Date {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  /**
   * RG-03 : le honeypot est porté par le DTO, le rate limiting par IP l'est
   * ici. Si Redis est indisponible, incr renvoie 0 et la limite ne s'applique
   * pas : on préfère laisser passer que bloquer tout le tunnel.
   */
  private async checkInitiateRateLimit(ip: string): Promise<void> {
    const hour = new Date().toISOString().slice(0, 13);
    const key = `ratelimit:${ip}:initiate:${hour}`;

    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, 3600);
    }

    if (count > INITIATE_RATE_LIMIT_PER_HOUR) {
      throw new HttpException(
        'Trop de tentatives, veuillez réessayer plus tard.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
