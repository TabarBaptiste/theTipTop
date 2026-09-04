// ===========================================
// UC-06 - Soumettre un code depuis son espace personnel
// ===========================================
// Couvre le second chemin de participation : celui d'un compte deja actif, qui
// poste un code sans repasser par la verification email. On y verifie aussi les
// deux garde-fous qui n'existent qu'a ce niveau - le verrou transactionnel sur
// le ticket, et le refus des comptes sans adresse joignable.

import request from 'supertest';
import { PrizeType } from '@prisma/client';

import {
  Contexte,
  MARQUEUR,
  adresse,
  creerTicket,
  demarrer,
  inscrire,
  nettoyer,
  ouvrirLeJeu,
  reinitialiserQuota,
} from './utils';

describe('UC-06 - Participation depuis l espace personnel', () => {
  let ctx: Contexte;
  let refermerLeJeu: () => Promise<void>;
  let http: () => request.Agent;

  const MOT_DE_PASSE = 'Motdepasse1!';

  beforeAll(async () => {
    ctx = await demarrer();
    refermerLeJeu = await ouvrirLeJeu(ctx);
    http = () => request(ctx.app.getHttpServer());
  });

  afterAll(async () => {
    if (refermerLeJeu) await refermerLeJeu();
    if (ctx) {
      await nettoyer(ctx);
      await ctx.app.close();
    }
  });

  // Chaque scenario ouvre au moins un compte, et l'ouverture d'inscription est
  // plafonnee a dix par heure et par IP (RG-03). Sans remise a zero, la suite
  // s'arreterait en 429 avant d'avoir couvert la moitie des cas.
  beforeEach(async () => {
    await reinitialiserQuota(ctx);
    ctx.envois.length = 0;
  });

  /** Cree un compte client actif et retourne son jeton et son adresse. */
  async function client(prefixe: string) {
    const { email, accessToken } = await inscrire(ctx, adresse(prefixe), MOT_DE_PASSE);
    return { email, jeton: accessToken };
  }

  // ===========================================
  // Chemin nominal
  // ===========================================
  describe('Soumission d un code', () => {
    it('enregistre la participation et consomme le ticket', async () => {
      const { jeton, email } = await client('uc06-nominal');
      const ticket = await creerTicket(ctx, 100, PrizeType.GIFT_BOX_39);

      const r = await http()
        .post('/api/v1/participations')
        .set('Authorization', `Bearer ${jeton}`)
        .send({ code: ticket.code })
        .expect(201);

      expect(r.body.code).toBe(ticket.code);
      expect(r.body.prizeType).toBe(PrizeType.GIFT_BOX_39);
      expect(r.body.prize).toEqual(expect.objectContaining({ name: expect.any(String) }));

      const enBase = await ctx.prisma.ticket.findUnique({
        where: { id: ticket.id },
        include: { participation: { include: { user: true } } },
      });
      expect(enBase!.isUsed).toBe(true);
      expect(enBase!.participation!.user.email).toBe(email);

      // Et la participation apparait bien dans l'espace personnel.
      const mes = await http()
        .get('/api/v1/participations/me')
        .set('Authorization', `Bearer ${jeton}`)
        .expect(200);
      expect(mes.body.map((p: { code: string }) => p.code)).toContain(ticket.code);
    });

    it('accepte un code saisi en minuscules', async () => {
      const { jeton } = await client('uc06-casse');
      const ticket = await creerTicket(ctx, 101);

      await http()
        .post('/api/v1/participations')
        .set('Authorization', `Bearer ${jeton}`)
        .send({ code: ticket.code.toLowerCase() })
        .expect(201);
    });

    it('refuse un code inconnu', async () => {
      const { jeton } = await client('uc06-inconnu');

      await http()
        .post('/api/v1/participations')
        .set('Authorization', `Bearer ${jeton}`)
        .send({ code: 'ZZZZ999999' })
        .expect(400);
    });

    it('refuse un code deja consomme par quelqu un d autre', async () => {
      const premier = await client('uc06-premier');
      const second = await client('uc06-second');
      const ticket = await creerTicket(ctx, 102);

      await http()
        .post('/api/v1/participations')
        .set('Authorization', `Bearer ${premier.jeton}`)
        .send({ code: ticket.code })
        .expect(201);

      await http()
        .post('/api/v1/participations')
        .set('Authorization', `Bearer ${second.jeton}`)
        .send({ code: ticket.code })
        .expect(400);

      const participations = await ctx.prisma.participation.count({
        where: { ticketId: ticket.id },
      });
      expect(participations).toBe(1);
    });
  });

  // ===========================================
  // Concurrence : le coeur de l'integrite du jeu
  // ===========================================
  describe('Soumissions simultanees', () => {
    it('n attribue le ticket qu une seule fois quand deux comptes le jouent ensemble', async () => {
      const a = await client('uc06-course-a');
      const b = await client('uc06-course-b');
      const ticket = await creerTicket(ctx, 103);

      // Les deux requetes partent sans s'attendre : c'est la seule facon de
      // solliciter le verrou transactionnel. Un test sequentiel passerait
      // meme si ce verrou n'existait pas.
      const [ra, rb] = await Promise.all([
        http()
          .post('/api/v1/participations')
          .set('Authorization', `Bearer ${a.jeton}`)
          .send({ code: ticket.code }),
        http()
          .post('/api/v1/participations')
          .set('Authorization', `Bearer ${b.jeton}`)
          .send({ code: ticket.code }),
      ]);

      const statuts = [ra.status, rb.status].sort();
      expect(statuts.filter((s) => s === 201)).toHaveLength(1);

      // Le perdant doit recevoir un conflit metier explicite. Un 500 signalerait
      // que la contrainte d'unicite a rattrape la course a la place du code :
      // l'integrite serait sauve, mais la personne verrait une erreur serveur.
      const perdant = [ra, rb].find((r) => r.status !== 201)!;
      expect(perdant.status).toBe(409);
      expect(perdant.body.message).toMatch(/d[ée]j[àa] [ée]t[ée] utilis[ée]/i);

      const participations = await ctx.prisma.participation.count({
        where: { ticketId: ticket.id },
      });
      expect(participations).toBe(1);
    });
  });

  // ===========================================
  // Comptes sans adresse joignable (Facebook)
  // ===========================================
  describe('Compte sous adresse de substitution', () => {
    it('refuse la participation et laisse le ticket intact', async () => {
      const { jeton } = await client('uc06-facebook');
      const ticket = await creerTicket(ctx, 104);

      // Reproduit un compte issu de Facebook sans adresse transmise. Le
      // marqueur reste dans la partie locale pour que le nettoyage le retrouve.
      const placeholder = `fb_${MARQUEUR}@facebook-noreply.invalid`;
      await ctx.prisma.user.update({
        where: { email: adresse('uc06-facebook') },
        data: { email: placeholder },
      });

      const r = await http()
        .post('/api/v1/participations')
        .set('Authorization', `Bearer ${jeton}`)
        .send({ code: ticket.code })
        .expect(403);

      expect(r.body.message).toMatch(/adresse email valide/i);

      // Le point essentiel : le ticket n'est pas brule. Sans quoi la personne
      // perdrait son lot en echange d'un message d'erreur.
      const intact = await ctx.prisma.ticket.findUnique({ where: { id: ticket.id } });
      expect(intact!.isUsed).toBe(false);
    });
  });

  // ===========================================
  // Bornes temporelles
  // ===========================================
  describe('Fenetre de jeu', () => {
    /**
     * Deplace la fenetre de jeu le temps d'une verification, puis la remet en
     * place - y compris si l'assertion echoue, la configuration etant partagee
     * avec l'environnement de developpement.
     */
    async function avecFenetre(
      debut: Date,
      fin: Date,
      verification: () => Promise<void>,
    ): Promise<void> {
      const config = await ctx.prisma.gameConfig.findFirst({ where: { isActive: true } });
      const avant = {
        startDate: config!.startDate,
        endDate: config!.endDate,
        claimEndDate: config!.claimEndDate,
      };

      await ctx.prisma.gameConfig.update({
        where: { id: config!.id },
        // Le delai de reclamation reste largement ouvert : c'est bien la
        // fenetre de jeu qui est mise a l'epreuve, et elle seule.
        data: {
          startDate: debut,
          endDate: fin,
          claimEndDate: new Date(Date.now() + 31_536_000_000),
        },
      });

      try {
        await verification();
      } finally {
        await ctx.prisma.gameConfig.update({ where: { id: config!.id }, data: avant });
      }
    }

    it('refuse un code soumis avant l ouverture du jeu', async () => {
      const { jeton } = await client('uc06-avant');
      const ticket = await creerTicket(ctx, 105);

      await avecFenetre(
        new Date(Date.now() + 86_400_000),
        new Date(Date.now() + 2 * 86_400_000),
        async () => {
          const r = await http()
            .post('/api/v1/participations')
            .set('Authorization', `Bearer ${jeton}`)
            .send({ code: ticket.code })
            .expect(400);

          expect(r.body.message).toMatch(/pas encore commenc/i);

          const intact = await ctx.prisma.ticket.findUnique({ where: { id: ticket.id } });
          expect(intact!.isUsed).toBe(false);
        },
      );
    });

    it('refuse un code soumis apres la cloture du jeu', async () => {
      const { jeton } = await client('uc06-apres');
      const ticket = await creerTicket(ctx, 106);

      await avecFenetre(
        new Date(Date.now() - 2 * 86_400_000),
        new Date(Date.now() - 86_400_000),
        async () => {
          const r = await http()
            .post('/api/v1/participations')
            .set('Authorization', `Bearer ${jeton}`)
            .send({ code: ticket.code })
            .expect(400);

          expect(r.body.message).toMatch(/termin/i);

          // Le delai de reclamation court encore : si le ticket etait accepte
          // ici, c'est que la cloture du jeu ne bornait pas la participation.
          const intact = await ctx.prisma.ticket.findUnique({ where: { id: ticket.id } });
          expect(intact!.isUsed).toBe(false);
        },
      );
    });

    it('accepte un code pendant la periode de jeu', async () => {
      const { jeton } = await client('uc06-pendant');
      const ticket = await creerTicket(ctx, 107);

      // Contrepartie indispensable des deux refus ci-dessus : sans elle, une
      // fenetre systematiquement fermee les ferait passer tous les deux.
      await avecFenetre(
        new Date(Date.now() - 86_400_000),
        new Date(Date.now() + 86_400_000),
        async () => {
          await http()
            .post('/api/v1/participations')
            .set('Authorization', `Bearer ${jeton}`)
            .send({ code: ticket.code })
            .expect(201);
        },
      );
    });
  });
});
