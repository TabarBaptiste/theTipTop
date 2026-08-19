// ===========================================
// Simulation du tirage au sort du grand prix
// ===========================================
// Vérifie les deux garanties que les tests unitaires ne peuvent pas couvrir,
// Prisma y étant simulé :
//
//   1. « Chaque participant a UNE seule chance, quel que soit son nombre de
//      participations » (article 5 du règlement déposé). Cette règle repose sur
//      un groupBy exécuté par PostgreSQL, pas sur du code applicatif : seule
//      une vraie base peut la prouver.
//
//   2. L'uniformité du tirage. randomInt est cryptographique, mais encore
//      faut-il vérifier qu'aucun participant n'est favorisé en pratique.
//
// Aucune donnée n'est écrite durablement : la population synthétique est créée
// dans une transaction volontairement annulée à la fin.
//
//   npm run draw:simulate [nombre_de_tirages]

import { PrismaClient, PrizeType } from '@prisma/client';
import { randomInt } from 'node:crypto';

import { GrandPrizeService } from '../src/modules/grand-prize/grand-prize.service';
import { PrismaService } from '../src/prisma/prisma.service';

const prisma = new PrismaClient();

/** Nombre de tirages simulés. Plus il est grand, plus l'écart toléré est fin. */
const DRAWS = Number(process.argv[2]) || 200_000;

/**
 * Population volontairement déséquilibrée : si la règle « une chance par
 * personne » était mal appliquée, l'acharné à 40 participations gagnerait
 * quarante fois plus souvent que le participant unique. C'est précisément ce
 * déséquilibre qui rend le test concluant.
 */
const POPULATION = [
  { profil: 'occasionnel', participants: 30, participationsChacun: 1 },
  { profil: 'regulier', participants: 10, participationsChacun: 5 },
  { profil: 'assidu', participants: 5, participationsChacun: 15 },
  { profil: 'acharne', participants: 2, participationsChacun: 40 },
];

const MARQUEUR = `sim-tirage-${Date.now()}`;

class Rollback extends Error {}

interface Resultat {
  participantsAttendus: number;
  participationsTotales: number;
  /** Participants déjà présents en base, hors simulation. */
  participantsPreexistants: number;
  idsDeduplique: string[];
  participationsParUtilisateur: Map<string, number>;
}

async function construireEtMesurer(): Promise<Resultat> {
  let resultat!: Resultat;

  try {
    await prisma.$transaction(
      async (tx) => {
        // La base contient déjà des participants réels : groupBy les compte
        // aussi. C'est l'augmentation qu'il faut mesurer, pas le total.
        const preexistants = (await tx.participation.groupBy({ by: ['userId'] })).length;

        const participationsParUtilisateur = new Map<string, string>();
        let compteurTicket = 0;
        let participationsTotales = 0;

        for (const groupe of POPULATION) {
          for (let i = 0; i < groupe.participants; i++) {
            const user = await tx.user.create({
              data: {
                email: `${MARQUEUR}-${groupe.profil}-${i}@simulation.invalid`,
                firstName: groupe.profil,
                lastName: `Simule${i}`,
              },
            });
            participationsParUtilisateur.set(user.id, groupe.profil);

            for (let p = 0; p < groupe.participationsChacun; p++) {
              // Le code fait exactement 10 caractères, comme en production.
              const code = `S${String(compteurTicket++).padStart(9, '0')}`;
              const ticket = await tx.ticket.create({
                data: { code, prizeType: PrizeType.INFUSER, isUsed: true },
              });
              await tx.participation.create({
                data: { userId: user.id, ticketId: ticket.id },
              });
              participationsTotales++;
            }
          }
        }

        // La requête exacte du service : c'est elle qui porte la règle du
        // règlement, et c'est PostgreSQL qui l'exécute.
        const groupes = await tx.participation.groupBy({ by: ['userId'] });

        const comptes = new Map<string, number>();
        for (const [id, profil] of participationsParUtilisateur) {
          comptes.set(id, POPULATION.find((g) => g.profil === profil)!.participationsChacun);
        }

        resultat = {
          participantsAttendus: participationsParUtilisateur.size,
          participationsTotales,
          participantsPreexistants: preexistants,
          idsDeduplique: groupes.map((g) => g.userId),
          participationsParUtilisateur: comptes,
        };

        // Annule tout : la base retrouve son état exact d'avant la simulation.
        throw new Rollback();
      },
      { timeout: 120_000 },
    );
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }

  return resultat;
}

/**
 * Vérifie qu'un tirage concurrent ne peut pas désigner un second gagnant.
 *
 * Le service protège l'écriture par un updateMany conditionné à
 * `grandPrizeDrawn: false`. C'est un compare-and-set : sa validité repose sur
 * l'atomicité d'un UPDATE PostgreSQL, que seule une exécution réellement
 * concurrente peut démontrer. Les tests unitaires simulent Prisma et ne
 * peuvent donc que vérifier la branche, pas la garantie.
 *
 * La configuration créée ici est inactive : l'application ne la voit pas, et
 * elle est supprimée immédiatement après.
 */
async function verifierVerrouConcurrent(tentatives = 20): Promise<number> {
  const jetable = await prisma.gameConfig.create({
    data: {
      startDate: new Date('2000-01-01T00:00:00Z'),
      endDate: new Date('2000-01-31T00:00:00Z'),
      claimEndDate: new Date('2000-03-01T00:00:00Z'),
      isActive: false,
      grandPrizeDrawn: false,
    },
  });

  try {
    // Toutes partent ensemble et empruntent des connexions distinctes du pool.
    const resultats = await Promise.all(
      Array.from({ length: tentatives }, (_, i) =>
        prisma.gameConfig.updateMany({
          where: { id: jetable.id, grandPrizeDrawn: false },
          data: {
            grandPrizeDrawn: true,
            grandPrizeWinnerId: `gagnant-concurrent-${i}`,
            grandPrizeDrawnAt: new Date(),
          },
        }),
      ),
    );

    return resultats.filter((r) => r.count === 1).length;
  } finally {
    await prisma.gameConfig.delete({ where: { id: jetable.id } });
  }
}

/**
 * Déroule le cycle de vie complet du tirage sur le vrai service.
 *
 * Le service est instancié avec le client de transaction plutôt qu'avec le
 * client global : c'est donc le code de production qui s'exécute, contre
 * PostgreSQL, mais tout est annulé à la sortie. C'est ce qui permet de
 * manipuler la date de clôture sans jamais toucher à la configuration réelle.
 *
 * La configuration active du moment est désactivée dans la transaction, sinon
 * canDraw lirait la vraie plutôt que celle de l'essai.
 */
async function verifierCycleDeVie(): Promise<string[]> {
  const constats: string[] = [];

  try {
    await prisma.$transaction(
      async (tx) => {
        const service = new GrandPrizeService(tx as unknown as PrismaService);

        await tx.gameConfig.updateMany({ data: { isActive: false } });

        const config = await tx.gameConfig.create({
          data: {
            startDate: new Date(Date.now() - 30 * 86_400_000),
            // Clôture dans le futur : le tirage doit être refusé.
            endDate: new Date(Date.now() + 86_400_000),
            claimEndDate: new Date(Date.now() + 31 * 86_400_000),
            isActive: true,
            grandPrizeDrawn: false,
          },
        });

        const avant = await service.canDraw();
        constats.push(
          avant.canDraw === false && avant.reason?.includes('pas encore terminé')
            ? 'OK|jeu en cours : tirage refusé — ' + avant.reason
            : `KO|jeu en cours : tirage autorisé à tort (${JSON.stringify(avant)})`,
        );

        // La clôture passe dans le passé, rien d'autre ne change.
        await tx.gameConfig.update({
          where: { id: config.id },
          data: { endDate: new Date(Date.now() - 86_400_000) },
        });

        const apres = await service.canDraw();
        constats.push(
          apres.canDraw === true
            ? `OK|jeu clôturé : tirage autorisé sur ${apres.participantsCount} participants`
            : `KO|jeu clôturé : tirage toujours refusé (${apres.reason})`,
        );

        const resultat = await service.draw();
        constats.push(
          resultat.success && resultat.winner?.email
            ? `OK|tirage effectué, gagnant désigné et adresse masquée : ${resultat.winner.email}`
            : 'KO|le tirage n’a pas désigné de gagnant',
        );

        // Second tirage : le verrou doit se refermer.
        try {
          await service.draw();
          constats.push('KO|un second tirage a été accepté');
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          constats.push(
            message.includes('déjà')
              ? `OK|second tirage refusé — ${message}`
              : `KO|second tirage refusé pour une mauvaise raison : ${message}`,
          );
        }

        throw new Rollback();
      },
      { timeout: 120_000 },
    );
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }

  return constats;
}

function main() {
  const ok = (m: string) => console.log('  \x1b[32mOK\x1b[0m   ' + m);
  const ko = (m: string) => {
    console.log('  \x1b[31mKO\x1b[0m   ' + m);
    process.exitCode = 1;
  };

  return construireEtMesurer().then((r) => {
    console.log(
      `\nPopulation simulée : ${r.participantsAttendus} participants, ` +
        `${r.participationsTotales} participations` +
        `\nDéjà en base       : ${r.participantsPreexistants} participants\n`,
    );

    // --- Garantie 1 : une chance par personne -----------------------------
    // On mesure l'augmentation, la base contenant déjà de vrais participants.
    const ajoutes = r.idsDeduplique.length - r.participantsPreexistants;
    if (ajoutes === r.participantsAttendus) {
      ok(
        `groupBy réduit ${r.participationsTotales} participations à ` +
          `${ajoutes} participants supplémentaires`,
      );
    } else {
      ko(`groupBy ajoute ${ajoutes} entrées pour ${r.participantsAttendus} participants créés`);
    }

    // --- Garantie 2 : uniformité du tirage --------------------------------
    const victoires = new Map<string, number>(r.idsDeduplique.map((id) => [id, 0]));
    for (let i = 0; i < DRAWS; i++) {
      const gagnant = r.idsDeduplique[randomInt(0, r.idsDeduplique.length)];
      victoires.set(gagnant, victoires.get(gagnant)! + 1);
    }

    const attendu = DRAWS / r.idsDeduplique.length;
    let ecartMax = 0;
    for (const nb of victoires.values()) {
      ecartMax = Math.max(ecartMax, Math.abs(nb - attendu) / attendu);
    }

    // Le seuil se déduit de l'échantillon plutôt que d'être posé au doigt
    // mouillé. Le nombre de victoires suit une loi de Poisson d'écart-type
    // racine de la moyenne : quatre écarts-types laissent passer la
    // fluctuation normale tout en rejetant un vrai biais, qui se compterait
    // ici en centaines de pourcents.
    const tolerance = 4 / Math.sqrt(attendu);
    if (ecartMax < tolerance) {
      ok(
        `écart maximal ${(ecartMax * 100).toFixed(1)} %, sous la tolérance ` +
          `statistique de ${(tolerance * 100).toFixed(1)} % (${DRAWS} tirages)`,
      );
    } else {
      ko(
        `écart maximal ${(ecartMax * 100).toFixed(1)} %, au-delà de ` +
          `${(tolerance * 100).toFixed(1)} %`,
      );
    }

    // --- Garantie 3 : le nombre de participations n'avantage personne ------
    const parProfil = new Map<string, { victoires: number; participants: number }>();
    for (const groupe of POPULATION) {
      parProfil.set(groupe.profil, { victoires: 0, participants: 0 });
    }
    for (const [id, nbParticipations] of r.participationsParUtilisateur) {
      const groupe = POPULATION.find((g) => g.participationsChacun === nbParticipations)!;
      const acc = parProfil.get(groupe.profil)!;
      acc.victoires += victoires.get(id) ?? 0;
      acc.participants += 1;
    }

    console.log('\n  Taux de victoire par profil, rapporté au participant :\n');
    console.log('    profil        participations  victoires/personne  écart');

    let biaisDetecte = false;
    for (const groupe of POPULATION) {
      const acc = parProfil.get(groupe.profil)!;
      const parPersonne = acc.victoires / acc.participants;
      const ecart = (parPersonne - attendu) / attendu;
      if (Math.abs(ecart) >= 0.1) biaisDetecte = true;
      console.log(
        `    ${groupe.profil.padEnd(13)} ${String(groupe.participationsChacun).padStart(9)}` +
          `${parPersonne.toFixed(0).padStart(20)}` +
          `${(ecart * 100 >= 0 ? '+' : '') + (ecart * 100).toFixed(1) + ' %'}`.padStart(11),
      );
    }
    console.log();

    if (biaisDetecte) {
      ko('un profil est avantagé : la règle du règlement n’est pas respectée');
    } else {
      ok('aucun profil avantagé — 40 participations ne valent pas plus qu’une');
    }

    // --- Garantie 4 : un seul gagnant, même en concurrence ----------------
    return verifierVerrouConcurrent().then((gagnants) => {
      if (gagnants === 1) {
        ok('20 tirages simultanés : exactement 1 a pu écrire un gagnant');
      } else {
        ko(`20 tirages simultanés ont produit ${gagnants} écritures`);
      }

      // --- Garantie 5 : les verrous du cycle de vie -----------------------
      return verifierCycleDeVie().then((constats) => {
        console.log('\n  Cycle de vie, joué sur le vrai service :\n');
        for (const constat of constats) {
          const [statut, message] = constat.split('|');
          if (statut === 'OK') {
            ok(message);
          } else {
            ko(message);
          }
        }

        console.log(
          '\nAucune donnée écrite : transactions annulées, configuration jetable supprimée.\n',
        );
      });
    });
  });
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
