// ===========================================
// Outillage commun des tests fonctionnels
// ===========================================
// Ces tests traversent la pile reelle : HTTP, validation, services, base. Ils
// ecrivent donc de vraies lignes. Deux precautions en decoulent et sont
// centralisees ici.
//
// 1. Toute donnee creee porte un marqueur unique a l'execution, et n'est
//    supprimee que par ce marqueur. Aucun nettoyage global : une suite qui
//    viderait une table effacerait les donnees de developpement au passage.
//
// 2. La configuration du jeu est sauvegardee puis restauree. Plusieurs regles
//    metier dependent des dates d'ouverture et de cloture ; les eprouver oblige
//    a les deplacer le temps de la suite.

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import { PrizeType } from '@prisma/client';

import { AppModule } from '../src/app.module';
import { MailService } from '../src/mail/mail.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';

/** Distingue les donnees de cette execution de toutes les autres. */
export const MARQUEUR = `e2e-${Date.now()}`;

/** Un envoi que le service de mail aurait effectue. */
export interface Envoi {
  methode: string;
  destinataire: string;
  arguments: unknown[];
}

export interface Contexte {
  app: INestApplication;
  prisma: PrismaService;
  redis: RedisService;
  /** Les emails que l'application a demande a envoyer, dans l'ordre. */
  envois: Envoi[];
}

/**
 * Journalise les envois au lieu de les effectuer.
 *
 * Un test fonctionnel ne doit pas appeler le prestataire d'emailing : il
 * expedierait de vrais messages a chaque execution, et dependrait d'un service
 * tiers pour passer. On garde en revanche la trace exacte des appels, ce qui
 * permet d'affirmer non seulement qu'un email part, mais avec quel contenu -
 * le code de verification lu ici est celui que le destinataire recevrait.
 */
function faireUnMailDeTest(envois: Envoi[]): Partial<MailService> {
  const enregistrer =
    (methode: string) =>
    async (destinataire: string, ...reste: unknown[]) => {
      envois.push({ methode, destinataire, arguments: reste });
      return true;
    };

  return {
    sendVerificationCode: enregistrer('sendVerificationCode'),
    sendVerificationReminder: enregistrer('sendVerificationReminder'),
    sendEmailConfirmation: enregistrer('sendEmailConfirmation'),
    sendPrizeWon: enregistrer('sendPrizeWon'),
    sendExpirationNotice: enregistrer('sendExpirationNotice'),
  } as Partial<MailService>;
}

export interface Options {
  /**
   * Conserve le ThrottlerGuard global.
   *
   * Il plafonne a trois requetes par seconde et par IP. Une suite qui enchaine
   * ses appels le declenche des le quatrieme, et tous les scenarios metier
   * echouent alors en 429 sans rien avoir prouve. Il est donc neutralise par
   * defaut, et eprouve separement par sa propre suite : c'est une protection
   * d'infrastructure, independante des regles du jeu.
   *
   * La neutralisation porte sur le compteur du throttler et non sur le guard
   * lui-meme : le guard est enregistre sous le jeton APP_GUARD, si bien que ni
   * overrideGuard(ThrottlerGuard) ni overrideProvider(APP_GUARD) ne
   * l'atteignent. Remplacer son magasin le laisse en place et le fait
   * simplement conclure, a chaque appel, que le plafond n'est pas atteint.
   */
  avecThrottling?: boolean;
}

/**
 * Demarre l'application avec la meme configuration qu'en production.
 *
 * Le ValidationPipe est repris a l'identique de main.ts : sans lui, les tests
 * valideraient des requetes que le serveur reel refuserait, et rateraient
 * precisement les regles qu'ils sont censes couvrir.
 */
export async function demarrer(options: Options = {}): Promise<Contexte> {
  const envois: Envoi[] = [];

  const constructeur = Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(MailService)
    .useValue(faireUnMailDeTest(envois));

  if (!options.avecThrottling) {
    constructeur.overrideProvider(ThrottlerStorage).useValue({
      increment: async () => ({
        totalHits: 1,
        timeToExpire: 1,
        isBlocked: false,
        timeToBlockExpire: 0,
      }),
    });
  }

  const module = await constructeur.compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.setGlobalPrefix('api/v1');
  await app.init();

  return { app, prisma: app.get(PrismaService), redis: app.get(RedisService), envois };
}

/**
 * Remet a zero le quota horaire de RG-03.
 *
 * Une suite enchaine plus de dix ouvertures depuis la meme adresse locale et
 * declencherait le plafond au milieu d'un scenario sans rapport. Seuls les
 * compteurs d'abus sont touches.
 */
export async function reinitialiserQuota({ redis }: Contexte): Promise<void> {
  await redis.delByPattern('ratelimit:*:initiate:*');
}

/** Supprime tout ce que la suite a cree, et rien d'autre. */
export async function nettoyer({ prisma }: Contexte): Promise<void> {
  await prisma.participation.deleteMany({ where: { ticket: { code: { startsWith: 'E2E' } } } });
  await prisma.lead.deleteMany({ where: { email: { contains: MARQUEUR } } });
  await prisma.ticket.deleteMany({ where: { code: { startsWith: 'E2E' } } });
  await prisma.user.deleteMany({ where: { email: { contains: MARQUEUR } } });
}

/** Adresse unique, pour ne heurter aucune contrainte d'unicite. */
export function adresse(prefixe: string): string {
  return `${prefixe}-${MARQUEUR}@simulation.invalid`;
}

/** Code de ticket a dix caracteres, format impose par le reglement. */
export function codeTicket(suffixe: number): string {
  return `E2E${String(suffixe).padStart(7, '0')}`;
}

/** Cree un ticket gagnant, distribue et non consomme. */
export async function creerTicket(
  { prisma }: Contexte,
  suffixe: number,
  prizeType: PrizeType = PrizeType.INFUSER,
) {
  return prisma.ticket.create({
    data: { code: codeTicket(suffixe), prizeType, isDistributed: true, isUsed: false },
  });
}

/**
 * Rend le jeu ouvert le temps de la suite, et restitue de quoi revenir en
 * arriere. La configuration est partagee avec l'environnement de
 * developpement : ne pas la restaurer laisserait le jeu ouvert ou ferme a tort.
 */
export async function ouvrirLeJeu({ prisma }: Contexte) {
  const config = await prisma.gameConfig.findFirst({ where: { isActive: true } });
  if (!config) throw new Error('Aucune configuration de jeu active : suite inexploitable.');

  const original = {
    startDate: config.startDate,
    endDate: config.endDate,
    claimEndDate: config.claimEndDate,
  };

  await prisma.gameConfig.update({
    where: { id: config.id },
    data: {
      startDate: new Date(Date.now() - 86_400_000),
      endDate: new Date(Date.now() + 86_400_000),
      claimEndDate: new Date(Date.now() + 30 * 86_400_000),
    },
  });

  return async () => {
    await prisma.gameConfig.update({ where: { id: config.id }, data: original });
  };
}
