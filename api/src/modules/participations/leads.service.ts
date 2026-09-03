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
import { randomInt, randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { Prisma, LeadStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { MailService } from '../../mail/mail.service';
import { TicketsService } from '../tickets/tickets.service';
import { AuthService } from '../auth/auth.service';
import { RegisterDto } from '../auth/dto/register.dto';
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
// Un code a six chiffres represente un million de combinaisons, et il vit 48 h.
// Le throttler global laisse passer une centaine de requetes par minute : sans
// plafond ici, un quart de l'espace serait parcouru avant l'echeance. Au-dela
// de cinq essais le code est detruit, mais le lead survit : la personne qui
// s'est simplement trompee demande un nouvel envoi sans ressaisir son
// formulaire, quand l'attaquant, lui, repart de zero toutes les 60 s.
const MAX_VERIFY_ATTEMPTS = 5;
// Meme cout que l'inscription classique (auth.service).
const BCRYPT_ROUNDS = 12;

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

    // Le ticket n'est pas réservé : il reste soumettable tant que personne n'a
    // confirmé son email. On mémorise seulement quel code ce lead vise, pour
    // pouvoir le consommer à la vérification.
    return this.openPendingLead(dto, normalizedEmail, verification.ticket.id);
  }

  // ===========================================
  // Inscription classique (POST /auth/register)
  // ===========================================
  /**
   * Même tunnel, sans ticket. L'inscription ne crée plus de compte ni de
   * session : elle ouvre un lead et envoie le code, exactement comme une
   * participation. Le compte naît à la confirmation, dans verify().
   *
   * Cette symétrie n'est pas cosmétique. Tant que l'inscription créait un
   * compte sans preuve de possession de l'adresse, un tiers pouvait occuper
   * celle d'autrui ; la victime participant ensuite par le tunnel se voyait
   * ouvrir une session sur ce compte étranger, dont l'occupant connaissait le
   * mot de passe.
   */
  async initiateRegistration(dto: RegisterDto, ip: string) {
    await this.checkInitiateRateLimit(ip);

    const normalizedEmail = dto.email.toLowerCase().trim();

    // Un 409 « cet email existe déjà » répondrait à n'importe qui la question
    // qu'une énumération d'adresses cherche à poser. La réponse est donc celle
    // du parcours nominal, et l'information part par email : son seul
    // destinataire légitime est celui qui relève la boîte.
    const existingUser = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      await this.mail.sendAccountAlreadyExists(normalizedEmail);
      return {
        // Aucun lead n'est créé : l'identifiant est un leurre. Il mène à un
        // écran de saisie de code qui n'aboutira pas, ce qui est précisément
        // le comportement attendu de qui ne relève pas cette boîte.
        leadId: randomUUID(),
        maskedEmail: this.maskEmail(normalizedEmail),
        expiresAt: this.hoursFromNow(CODE_TTL_HOURS),
      };
    }

    return this.openPendingLead(dto, normalizedEmail, null);
  }

  /**
   * Tronc commun des deux points d'entrée : contrôle du doublon, création du
   * lead et envoi du code. Seule la présence d'un ticket les distingue.
   */
  private async openPendingLead(
    dto: InitiateParticipationDto | RegisterDto,
    email: string,
    ticketId: string | null,
  ) {
    // RG-01 : mode silencieux. Si un lead actif porte déjà cette adresse, la
    // réponse est strictement identique au parcours nominal. Rien ne doit
    // permettre de déduire qu'une adresse est déjà connue.
    const existingLead = await this.findActiveLeadByEmail(email);
    if (existingLead) {
      return this.silentModeResponse(existingLead, email);
    }

    // Un lead périmé n'est plus actif au sens de RG-01, mais il occupe encore
    // l'index unique partiel tant que le job d'expiration n'est pas passé.
    // Celui-ci ne tourne que toutes les dix minutes : on ne fait pas patienter
    // le visiteur jusque-là.
    await this.expireStalePendingLead(email);

    const code = this.generateVerificationCode();
    const expiresAt = this.hoursFromNow(CODE_TTL_HOURS);

    let lead: { id: string };
    try {
      lead = await this.prisma.lead.create({
        data: {
          email,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone: dto.phone ?? null,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          gender: dto.gender ?? null,
          status: LeadStatus.EN_ATTENTE_VERIFICATION,
          ticketId,
          // Le mot de passe attend ici, déjà haché, le temps que l'adresse soit
          // prouvée. Le stocker en clair, même quelques minutes, reviendrait à
          // conserver en base un secret que son propriétaire réutilise ailleurs.
          password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
          verificationCode: code,
          codeExpiresAt: expiresAt,
          lastCodeSentAt: new Date(),
          rgpdConsentAt: new Date(),
          consentEmail: dto.consentEmail ?? false,
        },
        select: { id: true },
      });
    } catch (error) {
      // Deux soumissions simultanées sur la même adresse : l'index unique
      // partiel a tranché, et celle qui perd se comporte comme le doublon
      // qu'elle est devenue. Sans ce rattrapage, la course produirait une 500
      // là où RG-01 exige une réponse de parcours nominal.
      const winner =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
          ? await this.findActiveLeadByEmail(email)
          : null;
      if (winner) {
        return this.silentModeResponse(winner, email);
      }
      throw error;
    }

    await this.mail.sendVerificationCode(email, code, expiresAt);

    return {
      leadId: lead.id,
      maskedEmail: this.maskEmail(email),
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
      (lead.codeExpiresAt?.getTime() ?? 0) < Date.now()
    ) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    // Le code faux est traité à part, et seulement ici : c'est le seul cas où
    // l'appelant a désigné un lead réel, donc le seul qui mérite d'être compté.
    // Un lead inconnu ne doit alimenter aucun compteur, sans quoi il suffirait
    // d'identifiants au hasard pour saturer la mémoire.
    if (lead.verificationCode === null || lead.verificationCode !== dto.code) {
      const attempts = await this.countFailedVerifyAttempt(lead.id);
      if (attempts >= MAX_VERIFY_ATTEMPTS) {
        // Le code est détruit, le lead non : un renvoi suffit à repartir,
        // sans ressaisir le formulaire. Cf. MAX_VERIFY_ATTEMPTS.
        await this.prisma.lead.updateMany({
          where: { id: lead.id, status: LeadStatus.EN_ATTENTE_VERIFICATION },
          data: { verificationCode: null },
        });
      }
      throw new BadRequestException('Code invalide ou expiré');
    }

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Un lead né de l'inscription classique ne vise aucun ticket : il crée le
      // compte, et rien d'autre. La participation reste le cas nominal, pas le
      // seul.
      const ticket = lead.ticketId
        ? await tx.ticket.findUnique({ where: { id: lead.ticketId } })
        : null;

      if (lead.ticketId && !ticket) {
        throw new ConflictException('Le code associé à cette demande est introuvable.');
      }

      // Le compte peut déjà exister si la personne s'est inscrite par ailleurs
      // (OAuth, inscription classique) : on rattache plutôt que de dupliquer.
      let user = await tx.user.findUnique({ where: { email: lead.email } });
      user ??= await tx.user.create({
        data: {
          email: lead.email,
          // Choisi au formulaire et haché depuis. Il reste nul pour les leads
          // ouverts avant que le formulaire ne le demande, et pour le chemin
          // Social Login : passwordRequired le signale alors au front.
          password: lead.password,
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
      // Le compte préexistant garde son mot de passe. Celui du lead est
      // abandonné : prouver la possession d'une adresse autorise à ouvrir une
      // session, jamais à remplacer le secret d'un compte déjà constitué.

      let participation: { id: string; createdAt: Date } | null = null;

      if (ticket) {
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

        participation = await tx.participation.create({
          data: { userId: user.id, ticketId: ticket.id },
        });
      }

      await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: LeadStatus.VERIFIE,
          verifiedAt: new Date(),
          userId: user.id,
          // Ni le code ni le mot de passe en attente ne doivent survivre à leur
          // usage : l'un est consommé, l'autre a rejoint le compte.
          verificationCode: null,
          codeExpiresAt: null,
          password: null,
        },
      });

      return { user, ticket, participation };
    });

    await this.redis.del(this.verifyAttemptsKey(lead.id));

    const tokens = await this.authService.login(result.user);

    // Inscription sans ticket : le compte est ouvert, il n'y a ni lot à
    // annoncer ni participation à renvoyer.
    if (!result.ticket || !result.participation) {
      return {
        ...tokens,
        passwordRequired: result.user.password === null,
        participation: null,
      };
    }

    const prizesMap = await this.ticketsService.getPrizesMap();
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

    // Le nouveau code repart d'un compteur d'essais vierge : sinon une saisie
    // malheureuse condamnerait d'avance le code suivant.
    await this.redis.del(this.verifyAttemptsKey(lead.id));

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
   * Passe à EXPIRE les demandes en attente dont l'échéance est dépassée, pour
   * cette adresse seulement. Le job d'expiration fait la même chose à l'échelle
   * de la base ; ici il s'agit de ne pas faire attendre son prochain passage.
   */
  private async expireStalePendingLead(email: string): Promise<void> {
    await this.prisma.lead.updateMany({
      where: {
        email,
        status: LeadStatus.EN_ATTENTE_VERIFICATION,
        codeExpiresAt: { lte: new Date() },
      },
      data: {
        status: LeadStatus.EXPIRE,
        verificationCode: null,
        password: null,
      },
    });
  }

  private verifyAttemptsKey(leadId: string): string {
    return `participation-verify-attempts:${leadId}`;
  }

  /**
   * Compte un essai manqué. La clé vit le temps du code : elle disparaît avec
   * lui, sans laisser de compteur résiduel derrière une demande abandonnée.
   */
  private async countFailedVerifyAttempt(leadId: string): Promise<number> {
    const key = this.verifyAttemptsKey(leadId);
    const attempts = await this.redis.incr(key);
    if (attempts === 1) {
      await this.redis.expire(key, CODE_TTL_HOURS * 3600);
    }
    return attempts;
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
