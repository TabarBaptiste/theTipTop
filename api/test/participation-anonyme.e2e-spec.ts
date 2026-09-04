// ===========================================
// UC-05 - Participer au jeu-concours sans compte
// ===========================================
// Le parcours est verifie de bout en bout a travers la couche HTTP reelle :
// meme validation, memes gardes, meme base. Les tests unitaires existants
// couvrent chaque service isolement ; ce qu'ils ne peuvent pas montrer, c'est
// que l'enchainement tient - qu'un code saisi sur le site finit reellement en
// participation, et qu'un ticket ne peut pas etre joue deux fois.

import request from 'supertest';
import { LeadStatus, PrizeType } from '@prisma/client';

import {
  Contexte,
  adresse,
  creerTicket,
  demarrer,
  nettoyer,
  ouvrirLeJeu,
  reinitialiserQuota,
} from './utils';

describe('UC-05 - Participation sans compte', () => {
  let ctx: Contexte;
  let refermerLeJeu: () => Promise<void>;
  let http: () => request.Agent;

  beforeAll(async () => {
    ctx = await demarrer();
    refermerLeJeu = await ouvrirLeJeu(ctx);
    http = () => request(ctx.app.getHttpServer());
  });

  afterAll(async () => {
    // L'ordre compte : la configuration du jeu est restauree meme si un test a
    // echoue, sinon l'environnement de developpement resterait ouvert a tort.
    if (refermerLeJeu) await refermerLeJeu();
    if (ctx) {
      await nettoyer(ctx);
      await ctx.app.close();
    }
  });

  beforeEach(async () => {
    await reinitialiserQuota(ctx);
    ctx.envois.length = 0;
  });

  const MOT_DE_PASSE = 'Motdepasse1!';

  /** Corps d'ouverture valide, majeur, consentant, pour le code donne. */
  const ouverture = (code: string, email: string) => ({
    code,
    email,
    password: MOT_DE_PASSE,
    firstName: 'Camille',
    lastName: 'Martin',
    birthDate: '1990-05-15',
    consentData: true,
  });

  // ===========================================
  // Le chemin nominal, en entier
  // ===========================================
  describe('Parcours nominal', () => {
    it('mene du code de ticket a une participation enregistree', async () => {
      const ticket = await creerTicket(ctx, 1, PrizeType.TEA_DETOX);
      const email = adresse('nominal');

      // --- Etape 1 : ouverture ---
      const initiation = await http()
        .post('/api/v1/participations/initiate')
        .send(ouverture(ticket.code, email))
        .expect(201);

      expect(initiation.body.leadId).toEqual(expect.any(String));
      expect(initiation.body.expiresAt).toEqual(expect.any(String));
      // RG-09 : l'adresse revient masquee, jamais en clair.
      expect(initiation.body.maskedEmail).not.toBe(email);
      expect(initiation.body.maskedEmail).toContain('*');

      // --- Etape 2 : le code de verification part bien par email ---
      const envoi = ctx.envois.find((e) => e.methode === 'sendVerificationCode');
      expect(envoi).toBeDefined();
      expect(envoi!.destinataire).toBe(email);

      // RG-06 : six chiffres. On prend le code depuis l'email et non depuis la
      // base : c'est celui que la personne recevrait reellement.
      const codeRecu = envoi!.arguments[0] as string;
      expect(codeRecu).toMatch(/^\d{6}$/);

      // --- Etape 3 : validation du code ---
      const validation = await http()
        .post('/api/v1/participations/verify')
        .send({ leadId: initiation.body.leadId, code: codeRecu })
        .expect(201);

      // Le lot annonce est bien celui du ticket, pas un tirage refait.
      expect(validation.body.participation.prizeType).toBe(PrizeType.TEA_DETOX);
      expect(validation.body.participation.code).toBe(ticket.code);
      expect(validation.body.participation.prize).toEqual(
        expect.objectContaining({ name: expect.any(String) }),
      );

      // La personne repart connectee, sans avoir a se reconnecter avec le mot
      // de passe qu'elle vient de choisir. Celui-ci ayant ete saisi des
      // l'ouverture, il ne reste rien a definir.
      expect(validation.body.accessToken).toEqual(expect.any(String));
      expect(validation.body.refreshToken).toEqual(expect.any(String));
      expect(validation.body.passwordRequired).toBe(false);

      // --- Etape 4 : l'etat en base correspond a ce qui a ete annonce ---
      const enBase = await ctx.prisma.ticket.findUnique({
        where: { id: ticket.id },
        include: { participation: { include: { user: true } } },
      });

      expect(enBase!.isUsed).toBe(true);
      expect(enBase!.usedAt).not.toBeNull();
      expect(enBase!.participation).not.toBeNull();
      expect(enBase!.participation!.user.email).toBe(email);
      // Le mot de passe saisi a l'ouverture a ete transfere sur le compte, et
      // n'a jamais transite en clair : seul son hache bcrypt est en base.
      expect(enBase!.participation!.user.password).not.toBe(MOT_DE_PASSE);
      expect(enBase!.participation!.user.password).toMatch(/^\$2[aby]\$/);

      const lead = await ctx.prisma.lead.findUnique({
        where: { id: initiation.body.leadId },
      });
      expect(lead!.status).toBe(LeadStatus.VERIFIE);
      // Le code ne doit pas survivre a son usage.
      expect(lead!.verificationCode).toBeNull();

      // --- Etape 5 : l'annonce du gain part ---
      const annonce = ctx.envois.find((e) => e.methode === 'sendPrizeWon');
      expect(annonce).toBeDefined();
      expect(annonce!.destinataire).toBe(email);
    });

    it('rend le compte utilisable immediatement apres la participation', async () => {
      const ticket = await creerTicket(ctx, 2);
      const email = adresse('session');

      const initiation = await http()
        .post('/api/v1/participations/initiate')
        .send(ouverture(ticket.code, email))
        .expect(201);

      const code = ctx.envois.find((e) => e.methode === 'sendVerificationCode')!
        .arguments[0] as string;

      const validation = await http()
        .post('/api/v1/participations/verify')
        .send({ leadId: initiation.body.leadId, code })
        .expect(201);

      // Le jeton retourne ouvre vraiment l'espace personnel, et la
      // participation qui vient d'etre creee s'y trouve.
      const mesParticipations = await http()
        .get('/api/v1/participations/me')
        .set('Authorization', `Bearer ${validation.body.accessToken}`)
        .expect(200);

      const codes = mesParticipations.body.map((p: { code: string }) => p.code);
      expect(codes).toContain(ticket.code);
    });
  });

  // ===========================================
  // Les refus : c'est la que se joue l'integrite du jeu
  // ===========================================
  describe('Codes refuses', () => {
    it('refuse un code qui n existe pas', async () => {
      await http()
        .post('/api/v1/participations/initiate')
        .send(ouverture('ZZZZ999999', adresse('inconnu')))
        .expect(400);
    });

    it('refuse un code deja consomme', async () => {
      const ticket = await creerTicket(ctx, 3);
      await ctx.prisma.ticket.update({
        where: { id: ticket.id },
        data: { isUsed: true, usedAt: new Date() },
      });

      await http()
        .post('/api/v1/participations/initiate')
        .send(ouverture(ticket.code, adresse('deja-joue')))
        .expect(400);
    });

    it('refuse un code au mauvais format sans consulter la base', async () => {
      await http()
        .post('/api/v1/participations/initiate')
        .send(ouverture('TROP-COURT', adresse('format')))
        .expect(400);
    });
  });

  describe('Conditions de participation', () => {
    it('refuse une personne mineure', async () => {
      const ticket = await creerTicket(ctx, 5);
      const dixAns = new Date();
      dixAns.setFullYear(dixAns.getFullYear() - 10);

      const reponse = await http()
        .post('/api/v1/participations/initiate')
        .send({
          ...ouverture(ticket.code, adresse('mineur')),
          birthDate: dixAns.toISOString().slice(0, 10),
        })
        .expect(400);

      // Le refus doit porter sur l'age, pas sur le format de la date.
      expect(JSON.stringify(reponse.body.message)).toMatch(/18|majeur|âge|age/i);

      // Et surtout : le ticket reste jouable.
      const intact = await ctx.prisma.ticket.findUnique({ where: { id: ticket.id } });
      expect(intact!.isUsed).toBe(false);
    });

    it('refuse une participation sans consentement RGPD', async () => {
      const ticket = await creerTicket(ctx, 15);
      const { consentData: _ignore, ...sansConsentement } = ouverture(
        ticket.code,
        adresse('sans-consentement'),
      );

      const reponse = await http()
        .post('/api/v1/participations/initiate')
        .send(sansConsentement)
        .expect(400);

      expect(JSON.stringify(reponse.body.message)).toMatch(/consentement/i);

      // Aucune donnee personnelle ne doit avoir ete enregistree.
      const trace = await ctx.prisma.lead.count({
        where: { email: adresse('sans-consentement') },
      });
      expect(trace).toBe(0);
    });

    it('refuse une participation dont le consentement RGPD est refuse', async () => {
      const ticket = await creerTicket(ctx, 16);

      await http()
        .post('/api/v1/participations/initiate')
        .send({ ...ouverture(ticket.code, adresse('consentement-refuse')), consentData: false })
        .expect(400);
    });

    it('refuse une adresse email malformee', async () => {
      const ticket = await creerTicket(ctx, 6);

      await http()
        .post('/api/v1/participations/initiate')
        .send({ ...ouverture(ticket.code, 'pas-une-adresse'), email: 'pas-une-adresse' })
        .expect(400);
    });

    it('refuse un champ non prevu par le contrat', async () => {
      const ticket = await creerTicket(ctx, 7);

      // forbidNonWhitelisted : un client qui inventerait un champ - role,
      // prizeType - doit etre repousse, pas ignore silencieusement.
      await http()
        .post('/api/v1/participations/initiate')
        .send({ ...ouverture(ticket.code, adresse('injection')), role: 'ADMIN' })
        .expect(400);
    });
  });

  // ===========================================
  // Validation du code recu
  // ===========================================
  describe('Validation du code', () => {
    it('refuse un code de verification errone sans consommer le ticket', async () => {
      const ticket = await creerTicket(ctx, 8);

      const initiation = await http()
        .post('/api/v1/participations/initiate')
        .send(ouverture(ticket.code, adresse('faux-code')))
        .expect(201);

      const vrai = ctx.envois.find((e) => e.methode === 'sendVerificationCode')!
        .arguments[0] as string;
      const faux = vrai === '000000' ? '111111' : '000000';

      await http()
        .post('/api/v1/participations/verify')
        .send({ leadId: initiation.body.leadId, code: faux })
        .expect(400);

      const intact = await ctx.prisma.ticket.findUnique({ where: { id: ticket.id } });
      expect(intact!.isUsed).toBe(false);
    });

    it('refuse un identifiant de demande inconnu', async () => {
      await http()
        .post('/api/v1/participations/verify')
        .send({ leadId: '00000000-0000-4000-8000-000000000000', code: '123456' })
        .expect(400);
    });

    it('donne le meme message pour un code faux et une demande inconnue', async () => {
      const ticket = await creerTicket(ctx, 9);

      const initiation = await http()
        .post('/api/v1/participations/initiate')
        .send(ouverture(ticket.code, adresse('oracle')))
        .expect(201);

      const codeFaux = await http()
        .post('/api/v1/participations/verify')
        .send({ leadId: initiation.body.leadId, code: '000000' })
        .expect(400);

      const demandeInconnue = await http()
        .post('/api/v1/participations/verify')
        .send({ leadId: '00000000-0000-4000-8000-000000000000', code: '000000' })
        .expect(400);

      // Deux messages differents diraient a un attaquant lequel des deux
      // elements il a devine juste.
      expect(codeFaux.body.message).toBe(demandeInconnue.body.message);
    });

    it('empeche de rejouer une validation deja effectuee', async () => {
      const ticket = await creerTicket(ctx, 10);

      const initiation = await http()
        .post('/api/v1/participations/initiate')
        .send(ouverture(ticket.code, adresse('rejeu')))
        .expect(201);

      const code = ctx.envois.find((e) => e.methode === 'sendVerificationCode')!
        .arguments[0] as string;

      await http()
        .post('/api/v1/participations/verify')
        .send({ leadId: initiation.body.leadId, code })
        .expect(201);

      // Le meme couple, rejoue : refuse. Sans quoi une seule validation
      // pourrait produire plusieurs participations.
      await http()
        .post('/api/v1/participations/verify')
        .send({ leadId: initiation.body.leadId, code })
        .expect(400);

      const participations = await ctx.prisma.participation.count({
        where: { ticketId: ticket.id },
      });
      expect(participations).toBe(1);
    });
  });

  // ===========================================
  // RG-01 - Mode silencieux
  // ===========================================
  describe('Adresse deja engagee (RG-01)', () => {
    it('repond comme au premier passage, sans creer de seconde demande', async () => {
      const premier = await creerTicket(ctx, 11);
      const second = await creerTicket(ctx, 12);
      const email = adresse('silencieux');

      const initiale = await http()
        .post('/api/v1/participations/initiate')
        .send(ouverture(premier.code, email))
        .expect(201);

      ctx.envois.length = 0;

      const repetee = await http()
        .post('/api/v1/participations/initiate')
        .send(ouverture(second.code, email))
        .expect(201);

      // La reponse doit avoir exactement la meme forme : rien ne doit
      // permettre de deduire que l'adresse est deja connue.
      expect(Object.keys(repetee.body).sort()).toEqual(Object.keys(initiale.body).sort());
      expect(repetee.body.maskedEmail).toBe(initiale.body.maskedEmail);

      // Mais en coulisses, aucune demande supplementaire n'existe.
      const demandes = await ctx.prisma.lead.count({ where: { email } });
      expect(demandes).toBe(1);

      // Et le second ticket n'a pas ete engage.
      const secondIntact = await ctx.prisma.ticket.findUnique({ where: { id: second.id } });
      expect(secondIntact!.isUsed).toBe(false);
    });
  });

  // ===========================================
  // RG-03 - Plafond horaire par adresse IP
  // ===========================================
  describe('Plafond de tentatives (RG-03)', () => {
    it('refuse la onzieme ouverture de la meme heure', async () => {
      // Les dix premieres franchissent le quota, quel que soit leur sort
      // metier : le compteur s'incremente avant toute verification de code.
      // On l'affirme explicitement, sans quoi le test passerait aussi si le
      // plafond se declenchait des la premiere - pour la mauvaise raison.
      const statuts: number[] = [];
      for (let i = 0; i < 10; i++) {
        const r = await http()
          .post('/api/v1/participations/initiate')
          .send(ouverture('ZZZZ999999', adresse(`quota-${i}`)));
        statuts.push(r.status);
      }
      expect(statuts).not.toContain(429);

      await http()
        .post('/api/v1/participations/initiate')
        .send(ouverture('ZZZZ999999', adresse('quota-11')))
        .expect(429);
    });
  });

  // ===========================================
  // RG-07 - Verrou entre deux renvois
  // ===========================================
  describe('Renvoi du code (RG-07)', () => {
    it('refuse un renvoi immediat', async () => {
      const ticket = await creerTicket(ctx, 13);

      const initiation = await http()
        .post('/api/v1/participations/initiate')
        .send(ouverture(ticket.code, adresse('renvoi')))
        .expect(201);

      await http()
        .post('/api/v1/participations/resend')
        .send({ leadId: initiation.body.leadId })
        .expect(429);
    });

    it('renvoie un nouveau code une fois le verrou echu, et invalide l ancien', async () => {
      const ticket = await creerTicket(ctx, 14);

      const initiation = await http()
        .post('/api/v1/participations/initiate')
        .send(ouverture(ticket.code, adresse('renvoi-ok')))
        .expect(201);

      const ancien = ctx.envois.find((e) => e.methode === 'sendVerificationCode')!
        .arguments[0] as string;

      // Plutot que d'attendre soixante secondes, on vieillit le dernier envoi.
      await ctx.prisma.lead.update({
        where: { id: initiation.body.leadId },
        data: { lastCodeSentAt: new Date(Date.now() - 120_000) },
      });

      ctx.envois.length = 0;

      await http()
        .post('/api/v1/participations/resend')
        .send({ leadId: initiation.body.leadId })
        .expect(201);

      const nouveau = ctx.envois.find((e) => e.methode === 'sendVerificationCode')!
        .arguments[0] as string;
      expect(nouveau).toMatch(/^\d{6}$/);

      // L'ancien code ne doit plus rien ouvrir.
      await http()
        .post('/api/v1/participations/verify')
        .send({ leadId: initiation.body.leadId, code: ancien })
        .expect(400);

      await http()
        .post('/api/v1/participations/verify')
        .send({ leadId: initiation.body.leadId, code: nouveau })
        .expect(201);
    });
  });
});
