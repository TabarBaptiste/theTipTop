// ===========================================
// UC-01 / UC-02 — Inscription, connexion, controle d'acces
// ===========================================
// Deux choses se jouent ici. D'abord le parcours de compte lui-meme. Ensuite
// une convention du projet qui n'existe qu'a l'execution : toute route
// protegee repond 403, jamais 401. Aucun test unitaire ne peut l'etablir,
// puisqu'elle depend des gardes et des filtres traverses par une vraie requete.

import request from 'supertest';
import { Role } from '@prisma/client';

import { Contexte, adresse, demarrer, nettoyer } from './utils';

describe('UC-01 / UC-02 — Comptes et controle d acces', () => {
  let ctx: Contexte;
  let http: () => request.Agent;

  const MOT_DE_PASSE = 'Motdepasse1!';

  beforeAll(async () => {
    ctx = await demarrer();
    http = () => request(ctx.app.getHttpServer());
  });

  afterAll(async () => {
    if (ctx) {
      await nettoyer(ctx);
      await ctx.app.close();
    }
  });

  const inscription = (email: string) => ({
    email,
    password: MOT_DE_PASSE,
    firstName: 'Camille',
    lastName: 'Martin',
    birthDate: '1990-05-15',
    consentData: true,
  });

  /** Cree un compte et retourne ses jetons. */
  async function compte(prefixe: string) {
    const email = adresse(prefixe);
    const r = await http().post('/api/v1/auth/register').send(inscription(email)).expect(201);
    return { email, ...r.body };
  }

  // ===========================================
  // Inscription
  // ===========================================
  describe('Inscription', () => {
    it('cree un compte client et ouvre une session', async () => {
      const email = adresse('inscription');

      const r = await http().post('/api/v1/auth/register').send(inscription(email)).expect(201);

      expect(r.body.accessToken).toEqual(expect.any(String));
      expect(r.body.refreshToken).toEqual(expect.any(String));

      // Le mot de passe ne doit ressortir sous aucune forme, meme hachee.
      expect(JSON.stringify(r.body)).not.toContain(MOT_DE_PASSE);
      expect(r.body.user?.password).toBeUndefined();

      const enBase = await ctx.prisma.user.findUnique({ where: { email } });
      expect(enBase).not.toBeNull();
      expect(enBase!.role).toBe(Role.CLIENT);
      // Stocke hache : la valeur en clair ne doit jamais atteindre la base.
      expect(enBase!.password).not.toBe(MOT_DE_PASSE);
      expect(enBase!.password).toMatch(/^\$2[aby]\$/);
    });

    it('refuse un mot de passe trop faible', async () => {
      await http()
        .post('/api/v1/auth/register')
        .send({ ...inscription(adresse('faible')), password: 'motdepasse' })
        .expect(400);
    });

    it('refuse un mot de passe sans caractere special', async () => {
      await http()
        .post('/api/v1/auth/register')
        .send({ ...inscription(adresse('sans-special')), password: 'Motdepasse1' })
        .expect(400);
    });

    it('accepte le diese comme caractere special', async () => {
      // Le diese a ete ajoute au jeu autorise apres coup : sans ce test, une
      // regression sur l'expression reguliere passerait inapercue.
      await http()
        .post('/api/v1/auth/register')
        .send({ ...inscription(adresse('diese')), password: 'Motdepasse1#' })
        .expect(201);
    });

    it('refuse une personne mineure', async () => {
      const dixAns = new Date();
      dixAns.setFullYear(dixAns.getFullYear() - 10);

      await http()
        .post('/api/v1/auth/register')
        .send({
          ...inscription(adresse('mineur-inscription')),
          birthDate: dixAns.toISOString().slice(0, 10),
        })
        .expect(400);
    });

    it('refuse une inscription sans consentement RGPD', async () => {
      const { consentData: _ignore, ...sansConsentement } = inscription(adresse('rgpd'));

      await http().post('/api/v1/auth/register').send(sansConsentement).expect(400);
    });

    it('refuse une adresse deja inscrite', async () => {
      const email = adresse('doublon');
      await http().post('/api/v1/auth/register').send(inscription(email)).expect(201);

      const r = await http().post('/api/v1/auth/register').send(inscription(email));
      expect(r.status).toBeGreaterThanOrEqual(400);
      expect(r.status).toBeLessThan(500);

      const comptes = await ctx.prisma.user.count({ where: { email } });
      expect(comptes).toBe(1);
    });
  });

  // ===========================================
  // Connexion
  // ===========================================
  describe('Connexion', () => {
    it('ouvre une session avec les bons identifiants', async () => {
      const { email } = await compte('connexion');

      const r = await http()
        .post('/api/v1/auth/login')
        .send({ email, password: MOT_DE_PASSE })
        .expect(200);

      expect(r.body.accessToken).toEqual(expect.any(String));
      expect(r.body.refreshToken).toEqual(expect.any(String));
    });

    it('refuse un mot de passe errone sans dire lequel des deux est faux', async () => {
      const { email } = await compte('mauvais-mdp');

      const mauvaisMotDePasse = await http()
        .post('/api/v1/auth/login')
        .send({ email, password: 'Autrechose1!' });

      const compteInconnu = await http()
        .post('/api/v1/auth/login')
        .send({ email: adresse('jamais-inscrit'), password: MOT_DE_PASSE });

      // Aucune session n'est ouverte, dans les deux cas.
      expect(mauvaisMotDePasse.body.accessToken).toBeUndefined();
      expect(compteInconnu.body.accessToken).toBeUndefined();

      // Meme statut et meme message : rien ne doit permettre d'enumerer les
      // adresses inscrites.
      expect(mauvaisMotDePasse.status).toBe(compteInconnu.status);
      expect(mauvaisMotDePasse.body.message).toBe(compteInconnu.body.message);

      // NOTE — LocalAuthGuard et JwtRefreshGuard n'appliquent pas la
      // convention 403 du projet, contrairement a JwtAuthGuard qui la
      // documente et l'impose. Ces routes repondent donc encore 401. L'ecart
      // est signale ; tant qu'il n'est pas tranche, ce test verifie la
      // propriete de securite plutot que le code de statut, pour ne pas
      // graver un comportement contraire a la convention.
      expect(mauvaisMotDePasse.status).toBeGreaterThanOrEqual(400);
      expect(mauvaisMotDePasse.status).toBeLessThan(500);
    });
  });

  // ===========================================
  // Convention du projet : 403 et non 401
  // ===========================================
  describe('Routes protegees', () => {
    const routesProtegees = [
      ['get', '/api/v1/auth/me'],
      ['get', '/api/v1/participations/me'],
      ['post', '/api/v1/participations'],
    ] as const;

    it.each(routesProtegees)('repond 403 sans jeton sur %s %s', async (methode, route) => {
      const r = await http()[methode](route).send({});
      expect(r.status).toBe(403);
    });

    it.each(routesProtegees)(
      'repond 403 avec un jeton invalide sur %s %s',
      async (methode, route) => {
        const r = await http()
          [methode](route)
          .set('Authorization', 'Bearer nimporte.quoi')
          .send({});
        expect(r.status).toBe(403);
      },
    );

    it('laisse passer un jeton valide', async () => {
      const { accessToken, email } = await compte('jeton-valide');

      const r = await http()
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(r.body.email).toBe(email);
      expect(r.body.password).toBeUndefined();
    });
  });

  // ===========================================
  // Cloisonnement des roles
  // ===========================================
  describe('Cloisonnement des roles', () => {
    it('interdit a un client la liste complete des participations', async () => {
      const { accessToken } = await compte('client-curieux');

      await http()
        .get('/api/v1/participations')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('interdit a un client la recherche de participation par code', async () => {
      const { accessToken } = await compte('client-curieux-2');

      await http()
        .get('/api/v1/participations/by-code/ABCDEFGH12')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    /** Inscrit un compte puis le promeut : aucune route ne permet — et ne doit
     * permettre — de s'attribuer un role a soi-meme. */
    async function compteAvecRole(prefixe: string, role: Role) {
      const email = adresse(prefixe);
      await http().post('/api/v1/auth/register').send(inscription(email)).expect(201);
      await ctx.prisma.user.update({ where: { email }, data: { role } });

      const connexion = await http()
        .post('/api/v1/auth/login')
        .send({ email, password: MOT_DE_PASSE })
        .expect(200);

      return connexion.body.accessToken as string;
    }

    it('ouvre la recherche par code a un employe', async () => {
      const jeton = await compteAvecRole('employe', Role.EMPLOYEE);

      // 404 et non 403 : la garde a laisse passer, c'est le code qui n'existe
      // pas. Un 403 signifierait que le role n'a pas ete reconnu.
      await http()
        .get('/api/v1/participations/by-code/ABCDEFGH12')
        .set('Authorization', `Bearer ${jeton}`)
        .expect(404);
    });

    it('reserve la liste complete aux administrateurs', async () => {
      const employe = await compteAvecRole('employe-liste', Role.EMPLOYEE);
      const admin = await compteAvecRole('admin-liste', Role.ADMIN);

      // La liste integrale est plus large que la recherche ciblee : un employe
      // n'y a pas acces.
      await http()
        .get('/api/v1/participations')
        .set('Authorization', `Bearer ${employe}`)
        .expect(403);

      await http()
        .get('/api/v1/participations')
        .set('Authorization', `Bearer ${admin}`)
        .expect(200);
    });
  });

  // ===========================================
  // Cycle de vie des jetons
  // ===========================================
  describe('Cycle de vie des jetons', () => {
    it('renouvelle une session avec le jeton de rafraichissement', async () => {
      const { refreshToken } = await compte('rafraichissement');

      const r = await http().post('/api/v1/auth/refresh').send({ refreshToken }).expect(200);

      expect(r.body.accessToken).toEqual(expect.any(String));
    });

    it('refuse un jeton de rafraichissement fabrique', async () => {
      const r = await http()
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'jeton.completement.invente' });

      expect(r.status).toBeGreaterThanOrEqual(400);
      expect(r.body.accessToken).toBeUndefined();
    });

    it('invalide le jeton de rafraichissement a la deconnexion', async () => {
      const { accessToken, refreshToken } = await compte('deconnexion');

      await http()
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      // Le meme jeton ne doit plus rouvrir de session : c'est tout l'interet
      // d'une deconnexion cote serveur.
      const r = await http().post('/api/v1/auth/refresh').send({ refreshToken });
      expect(r.status).toBeGreaterThanOrEqual(400);
      expect(r.body.accessToken).toBeUndefined();
    });
  });
});
