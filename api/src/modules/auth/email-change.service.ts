// ===========================================
// Rattachement d'une adresse reelle a un compte
// ===========================================

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { randomInt } from 'node:crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { MailService } from '../../mail/mail.service';
import { isPlaceholderEmail } from './placeholder-email';

/**
 * Duree de vie du code. Quinze minutes plutot que les 48 h du tunnel de
 * participation : ici l'utilisateur est deja connecte et attend devant son
 * ecran, il n'y a pas de raison de laisser une demande ouverte une nuit.
 */
const CODE_TTL_SECONDS = 15 * 60;

/**
 * Un code a six chiffres represente un million de combinaisons. Sans plafond,
 * les quinze minutes de validite suffiraient a les parcourir automatiquement,
 * et n'importe qui pourrait ainsi rattacher a son compte une adresse dont il
 * n'a pas le controle. Cinq essais, puis la demande est detruite.
 */
const MAX_ATTEMPTS = 5;

/** Plafond de demandes par heure, pour ne pas servir de relais d'envoi. */
const REQUESTS_PER_HOUR = 5;

interface PendingChange {
  email: string;
  code: string;
}

@Injectable()
export class EmailChangeService {
  private readonly logger = new Logger(EmailChangeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly mail: MailService,
  ) {}

  /**
   * Envoie un code a l'adresse proposee. Rien n'est modifie a ce stade : le
   * compte ne change d'adresse qu'a la confirmation.
   */
  async request(user: User, rawEmail: string): Promise<{ email: string; expiresAt: Date }> {
    this.assertPlaceholderAccount(user);

    const email = rawEmail.trim().toLowerCase();

    // Une adresse de substitution est injoignable par construction : l'accepter
    // ici reviendrait a valider un compte qui ne recevra jamais rien.
    if (isPlaceholderEmail(email)) {
      throw new BadRequestException('Cette adresse ne peut pas recevoir de courrier.');
    }

    await this.assertEmailAvailable(email);
    await this.checkRequestRateLimit(user.id);

    const code = this.generateCode();
    const pending: PendingChange = { email, code };
    await this.redis.set(this.pendingKey(user.id), JSON.stringify(pending), CODE_TTL_SECONDS);
    // Une nouvelle demande repart d'un compteur d'essais vierge, sans quoi une
    // demande precedente abandonnee condamnerait celle-ci d'avance.
    await this.redis.del(this.attemptsKey(user.id));

    const expiresAt = new Date(Date.now() + CODE_TTL_SECONDS * 1000);
    const delivered = await this.mail.sendEmailConfirmation(email, code, expiresAt);

    // L'echec d'envoi n'est pas silencieux : sans le code, l'utilisateur
    // attendrait devant un formulaire qu'il ne pourra jamais remplir.
    if (!delivered) {
      await this.redis.del(this.pendingKey(user.id));
      throw new BadRequestException(
        "L'envoi du code a échoué. Vérifiez l'adresse saisie, puis réessayez.",
      );
    }

    return { email, expiresAt };
  }

  /**
   * Verifie le code et rattache l'adresse au compte.
   */
  async confirm(user: User, code: string): Promise<User> {
    this.assertPlaceholderAccount(user);

    const key = this.pendingKey(user.id);
    const stored = await this.redis.get(key);
    if (!stored) {
      throw new BadRequestException('Aucune demande en cours, ou le délai est dépassé.');
    }

    const pending = JSON.parse(stored) as PendingChange;

    if (pending.code !== code) {
      const attempts = await this.countFailedAttempt(user.id);

      if (attempts >= MAX_ATTEMPTS) {
        await this.redis.del(key, this.attemptsKey(user.id));
        this.logger.warn(`Demande de changement d'adresse abandonnée après ${attempts} essais`);
        throw new ForbiddenException('Trop d’essais. Recommencez la demande.');
      }

      throw new ForbiddenException('Code incorrect.');
    }

    // Nouvelle verification d'unicite : l'adresse etait libre a la demande, elle
    // a pu etre prise entre-temps par une inscription classique.
    await this.assertEmailAvailable(pending.email);

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { email: pending.email },
    });

    await this.redis.del(key, this.attemptsKey(user.id));
    return updated;
  }

  /**
   * Le formulaire n'est ouvert qu'aux comptes sous adresse de substitution.
   * Changer l'adresse d'un compte joignable est un autre sujet : il faudrait y
   * confirmer aussi l'ancienne adresse, sans quoi une session ouverte suffirait
   * a deposseder son titulaire.
   */
  private assertPlaceholderAccount(user: User): void {
    if (!isPlaceholderEmail(user.email)) {
      throw new ForbiddenException('Votre compte dispose déjà d’une adresse valide.');
    }
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Cette adresse est déjà associée à un compte.');
    }
  }

  /** Meme generateur que le tunnel : crypto plutot que Math.random. */
  private generateCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  private pendingKey(userId: string): string {
    return `email-change:${userId}`;
  }

  private attemptsKey(userId: string): string {
    return `email-change-attempts:${userId}`;
  }

  /**
   * Compte un essai manque. La cle porte le meme TTL que la demande : elle
   * disparait avec elle, sans laisser de compteur residuel.
   */
  private async countFailedAttempt(userId: string): Promise<number> {
    const key = this.attemptsKey(userId);
    const attempts = await this.redis.incr(key);
    if (attempts === 1) {
      await this.redis.expire(key, CODE_TTL_SECONDS);
    }
    return attempts;
  }

  /**
   * Calque sur le tunnel : si Redis est indisponible, incr renvoie 0 et la
   * limite ne s'applique pas. On prefere laisser passer plutot que bloquer.
   */
  private async checkRequestRateLimit(userId: string): Promise<void> {
    const hour = new Date().toISOString().slice(0, 13);
    const key = `ratelimit:${userId}:email-change:${hour}`;

    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, 3600);
    }

    if (count > REQUESTS_PER_HOUR) {
      throw new ForbiddenException('Trop de demandes. Réessayez dans une heure.');
    }
  }
}
