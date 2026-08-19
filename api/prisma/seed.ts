// ===========================================
// Seed Database - Génération des 500 000 codes
// ===========================================
// Exécuter avec: npm run prisma:seed
// ===========================================

import { PrismaClient, PrizeType, Gender } from '@prisma/client';
import * as crypto from 'crypto';
import * as readline from 'readline';
import * as bcrypt from 'bcryptjs';
import { buildPrizeImageUrl } from '../src/common/cloudinary';

const prisma = new PrismaClient();

// Alphabet sécurisé (sans caractères ambigus I, O, 0, 1)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 10;
const TOTAL_TICKETS = 500000;
const BATCH_SIZE = 10000; // Insertion par lots pour performance

// Répartition des gains selon le cahier des charges
const PRIZE_DISTRIBUTION: { type: PrizeType; percentage: number }[] = [
  { type: 'INFUSER', percentage: 60 }, // 300 000 tickets
  { type: 'TEA_DETOX', percentage: 20 }, // 100 000 tickets
  { type: 'TEA_SIGNATURE', percentage: 10 }, // 50 000 tickets
  { type: 'GIFT_BOX_39', percentage: 6 }, // 30 000 tickets
  { type: 'GIFT_BOX_69', percentage: 4 }, // 20 000 tickets
];

// Liste de mots à éviter dans les codes
const FORBIDDEN_WORDS = [
  'FUCK',
  'SHIT',
  'DAMN',
  'HELL',
  'CRAP',
  'NAZI',
  'SEXE',
  'PORN',
  'MERD',
  'PUTE',
  'BITE',
  'CULS',
  'NAZE',
  'BETE',
  'MORT',
];

/**
 * Génère un code aléatoire sécurisé de 10 caractères
 */
function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = crypto.randomInt(0, ALPHABET.length);
    code += ALPHABET[randomIndex];
  }
  return code;
}

/**
 * Vérifie si le code contient un mot interdit
 */
function containsForbiddenWord(code: string): boolean {
  return FORBIDDEN_WORDS.some((word) => code.includes(word));
}

/**
 * Génère un code unique et valide
 */
function generateValidCode(existingCodes: Set<string>): string {
  let code: string;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    code = generateCode();
    attempts++;
    if (attempts > maxAttempts) {
      throw new Error('Impossible de générer un code unique après plusieurs tentatives');
    }
  } while (existingCodes.has(code) || containsForbiddenWord(code));

  return code;
}

/**
 * Crée un tableau de gains mélangé selon la distribution
 */
function createShuffledPrizes(): PrizeType[] {
  const prizes: PrizeType[] = [];

  for (const { type, percentage } of PRIZE_DISTRIBUTION) {
    const count = Math.round((percentage / 100) * TOTAL_TICKETS);
    for (let i = 0; i < count; i++) {
      prizes.push(type);
    }
  }

  // Ajustement si le total n'est pas exact (arrondi)
  while (prizes.length < TOTAL_TICKETS) {
    prizes.push('INFUSER');
  }
  while (prizes.length > TOTAL_TICKETS) {
    prizes.pop();
  }

  // Mélange de Fisher-Yates pour une distribution aléatoire
  for (let i = prizes.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [prizes[i], prizes[j]] = [prizes[j], prizes[i]];
  }

  return prizes;
}

// Métadonnées des lots (source de vérité en DB, alignée avec le CDC)
const PRIZE_METADATA = [
  {
    code: 'INFUSER' as PrizeType,
    name: 'Infuseur à thé',
    description: 'Un élégant infuseur à thé en inox de qualité',
    value: null,
    percentage: 60,
    totalCount: 300000,
    displayOrder: 1,
  },
  {
    code: 'TEA_DETOX' as PrizeType,
    name: 'Thé Détox / Infusion',
    description: 'Une boîte de 100g de thé détox ou infusion bio',
    value: null,
    percentage: 20,
    totalCount: 100000,
    displayOrder: 2,
  },
  {
    code: 'TEA_SIGNATURE' as PrizeType,
    name: 'Thé Signature',
    description: 'Une boîte de 100g de thé signature Thé Tip Top',
    value: null,
    percentage: 10,
    totalCount: 50000,
    displayOrder: 3,
  },
  {
    code: 'GIFT_BOX_39' as PrizeType,
    name: 'Coffret Découverte',
    description: "Un coffret découverte avec une sélection de thés d'exception",
    value: '39€',
    percentage: 6,
    totalCount: 30000,
    displayOrder: 4,
  },
  {
    code: 'GIFT_BOX_69' as PrizeType,
    name: 'Coffret Découverte Premium',
    description: 'Notre coffret premium avec une sélection exclusive de grands crus',
    value: '69€',
    percentage: 4,
    totalCount: 20000,
    displayOrder: 5,
  },
];

// ===========================================
// Cohorte démographique
// ===========================================
// Les graphiques de /stats/demographics filtrent sur `participations: { some: {} }` :
// un compte sans participation n'apparaît dans aucun d'eux. Chaque profil
// consomme donc un ticket disponible, sans quoi la cohorte serait invisible.
//
// Le domaine demo.thetiptop.fr n'existe pas. C'est délibéré : aucun envoi
// transactionnel Brevo ne peut ainsi atteindre une vraie personne depuis ces
// comptes de démonstration.
const DEMO_EMAIL_DOMAIN = 'demo.thetiptop.fr';

const DEMO_FIRST_NAMES = [
  'Camille',
  'Lucas',
  'Amina',
  'Théo',
  'Sarah',
  'Mehdi',
  'Chloé',
  'Antoine',
  'Fatou',
  'Julien',
  'Inès',
  'Maxime',
  'Léa',
  'Karim',
  'Manon',
  'Hugo',
];

const DEMO_LAST_NAMES = [
  'Bernard',
  'Moreau',
  'Diallo',
  'Petit',
  'Nguyen',
  'Rousseau',
  'Benali',
  'Girard',
  'Lambert',
  'Traoré',
  'Fontaine',
  'Marchand',
  'Dasilva',
  'Leroy',
  'Chevalier',
  'Perrot',
];

// Répartition volontairement inégale, calée sur les cinq tranches calculées par
// StatsService. Une distribution uniforme ne ressemblerait à aucune clientèle
// réelle et rendrait le graphique impossible à commenter en soutenance.
const DEMO_AGE_BUCKETS = [
  { min: 18, max: 25, count: 9 },
  { min: 26, max: 35, count: 15 },
  { min: 36, max: 45, count: 12 },
  { min: 46, max: 55, count: 8 },
  { min: 56, max: 72, count: 4 },
];

// Motif de 16 répété 3 fois : 21 femmes, 18 hommes, 3 autres, 6 non précisés.
const DEMO_GENDER_PATTERN: Gender[] = [
  'FEMALE',
  'MALE',
  'FEMALE',
  'MALE',
  'FEMALE',
  'OTHER',
  'MALE',
  'FEMALE',
  'MALE',
  'FEMALE',
  'PREFER_NOT_TO_SAY',
  'MALE',
  'FEMALE',
  'MALE',
  'FEMALE',
  'PREFER_NOT_TO_SAY',
];

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

/** Retire les accents pour former une adresse e-mail valide. */
function slugify(value: string): string {
  // Les marques combinantes Unicode (U+0300 a U+036F) sont retirees par leur
  // code plutot que par une classe de caracteres : ecrite litteralement, la
  // plage est invisible a la relecture et se corrompt au moindre changement
  // d'encodage du fichier.
  return value
    .normalize('NFD')
    .split('')
    .filter((c) => {
      const code = c.charCodeAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

function buildDemoProfiles() {
  const now = Date.now();
  const profiles: {
    email: string;
    firstName: string;
    lastName: string;
    birthDate: Date;
    gender: Gender;
    consentEmail: boolean;
  }[] = [];

  let i = 0;
  for (const bucket of DEMO_AGE_BUCKETS) {
    for (let n = 0; n < bucket.count; n++) {
      const age = bucket.min + (n % (bucket.max - bucket.min + 1));
      const firstName = DEMO_FIRST_NAMES[i % DEMO_FIRST_NAMES.length];
      const lastName = DEMO_LAST_NAMES[(i * 7) % DEMO_LAST_NAMES.length];

      profiles.push({
        email: `${slugify(firstName)}.${slugify(lastName)}.${i}@${DEMO_EMAIL_DOMAIN}`,
        firstName,
        lastName,
        // La date est calculée depuis maintenant, et non figée : la demi-année
        // ajoutée écarte l'anniversaire des bornes, pour que l'arrondi opéré
        // par StatsService retombe toujours dans la tranche visée.
        birthDate: new Date(now - (age + 0.5) * YEAR_MS),
        gender: DEMO_GENDER_PATTERN[i % DEMO_GENDER_PATTERN.length],
        // Deux profils sur trois consentent : les segments d'export emailing
        // n'ont d'intérêt que si les deux camps sont représentés.
        consentEmail: i % 3 !== 0,
      });
      i++;
    }
  }

  return profiles;
}

/**
 * Crée la cohorte de démonstration et lui attribue une participation.
 *
 * Idempotente : les comptes sont upsertés par e-mail, et seuls ceux encore
 * dépourvus de participation en consomment une. Relancer la seed ne crée donc
 * ni doublon ni consommation de ticket supplémentaire.
 */
async function seedDemographicCohort(hashedPassword: string) {
  const profiles = buildDemoProfiles();
  console.log(`👤 Cohorte démographique : ${profiles.length} profils...`);

  for (const profile of profiles) {
    await prisma.user.upsert({
      where: { email: profile.email },
      update: { birthDate: profile.birthDate, gender: profile.gender },
      create: {
        ...profile,
        password: hashedPassword,
        role: 'CLIENT',
        consentData: true,
      },
    });
  }

  const withoutParticipation = await prisma.user.findMany({
    where: {
      email: { endsWith: `@${DEMO_EMAIL_DOMAIN}` },
      participations: { none: {} },
    },
    select: { id: true },
  });

  if (withoutParticipation.length === 0) {
    console.log('✅ Cohorte déjà complète, aucune participation à créer.\n');
    return;
  }

  const tickets = await prisma.ticket.findMany({
    where: { isUsed: false },
    take: withoutParticipation.length,
    select: { id: true },
  });

  if (tickets.length < withoutParticipation.length) {
    console.log(
      `⚠️  ${tickets.length} ticket(s) disponible(s) pour ${withoutParticipation.length} profil(s) : la cohorte sera partielle.`,
    );
  }

  const employee = await prisma.user.findUnique({
    where: { email: 'employe@thetiptop.fr' },
    select: { id: true },
  });

  let delivered = 0;
  for (let n = 0; n < tickets.length; n++) {
    // Un lot sur trois est déjà remis : sans cela l'historique des remises et
    // le taux de distribution resteraient vides côté back-office.
    const isDelivered = n % 3 === 0;
    if (isDelivered) delivered++;

    await prisma.$transaction([
      prisma.ticket.update({
        where: { id: tickets[n].id },
        data: { isUsed: true, usedAt: new Date() },
      }),
      prisma.participation.create({
        data: {
          userId: withoutParticipation[n].id,
          ticketId: tickets[n].id,
          prizeDelivered: isDelivered,
          prizeDeliveredAt: isDelivered ? new Date() : null,
          prizeDeliveredBy: isDelivered ? (employee?.id ?? null) : null,
          deliveryMethod: isDelivered ? 'IN_STORE' : null,
        },
      }),
    ]);
  }

  console.log(
    `✅ ${tickets.length} participation(s) créée(s), dont ${delivered} lot(s) déjà remis.\n`,
  );
}

async function main() {
  console.log('🍵 Démarrage de la génération des tickets Thé Tip Top...\n');

  // ── Lots : créer / mettre à jour les métadonnées ──────────────────────────
  console.log('🎁 Création des métadonnées des lots...');
  for (const prize of PRIZE_METADATA) {
    // null quand Cloudinary n'est pas configuré : la seed doit rester
    // exécutable sans compte, et l'interface retombe alors sur ses images
    // empaquetées.
    const imageUrl = buildPrizeImageUrl(prize.code, process.env.CLOUDINARY_CLOUD_NAME);

    await prisma.prize.upsert({
      where: { code: prize.code },
      update: {
        name: prize.name,
        description: prize.description,
        value: prize.value,
        percentage: prize.percentage,
        totalCount: prize.totalCount,
        displayOrder: prize.displayOrder,
        imageUrl,
      },
      create: { ...prize, imageUrl },
    });
  }
  console.log('✅ 5 lots créés/mis à jour.\n');

  // Vérifier si des tickets existent déjà
  let skipTicketGeneration = false;
  const existingCount = await prisma.ticket.count();
  if (existingCount > 0) {
    console.log(`⚠️  ${existingCount} tickets existent déjà en base.`);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question('Voulez-vous supprimer les tickets existants ? (oui/non): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() === 'oui') {
      console.log('🗑️  Suppression des tickets existants...');
      await prisma.participation.deleteMany();
      await prisma.ticket.deleteMany();
      console.log('✅ Tickets supprimés.\n');
    } else {
      // On ne s'arrête plus ici. Refuser de régénérer les tickets ne doit pas
      // empêcher la création des comptes de test et de la cohorte
      // démographique : sans cela, il n'existe aucun moyen d'ajouter des
      // profils à une base déjà peuplée sans d'abord la vider.
      skipTicketGeneration = true;
      console.log('↪️  Tickets conservés, génération ignorée.\n');
    }
  }

  // Créer la configuration du jeu si elle n'existe pas
  const existingConfig = await prisma.gameConfig.findFirst();
  if (!existingConfig) {
    // Lire les dates depuis les variables d'environnement (définis dans api/.env)
    // Fallback : début aujourd'hui, fin dans 30 jours, réclamation dans 60 jours
    const startDate = process.env.GAME_START_DATE
      ? new Date(process.env.GAME_START_DATE)
      : new Date();

    const endDate = process.env.GAME_END_DATE
      ? new Date(process.env.GAME_END_DATE)
      : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const claimEndDate = process.env.CLAIM_END_DATE
      ? new Date(process.env.CLAIM_END_DATE)
      : new Date(endDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    await prisma.gameConfig.create({
      data: {
        startDate,
        endDate,
        claimEndDate,
        maxTickets: TOTAL_TICKETS,
        isActive: true,
      },
    });
    console.log('📅 Configuration du jeu créée:');
    console.log(`   - Début: ${startDate.toLocaleDateString('fr-FR')}`);
    console.log(`   - Fin distribution: ${endDate.toLocaleDateString('fr-FR')}`);
    console.log(`   - Fin réclamation: ${claimEndDate.toLocaleDateString('fr-FR')}`);
    console.log(
      process.env.GAME_START_DATE
        ? "   (dates lues depuis les variables d'environnement)\n"
        : '   ⚠️  GAME_START_DATE non défini - dates calculées depuis maintenant\n',
    );
  }

  if (!skipTicketGeneration) {
    // Générer les gains mélangés
    console.log('🎲 Génération de la distribution des gains...');
    const prizes = createShuffledPrizes();
    console.log('✅ Distribution créée et mélangée.\n');

    // Afficher la répartition
    const distribution: Record<PrizeType, number> = prizes.reduce(
      (acc, prize) => {
        acc[prize] = (acc[prize] || 0) + 1;
        return acc;
      },
      {} as Record<PrizeType, number>,
    );

    console.log('📊 Répartition des gains:');
    Object.entries(distribution).forEach(([type, count]: [string, number]) => {
      const percentage = ((count / TOTAL_TICKETS) * 100).toFixed(2);
      console.log(`   - ${type}: ${count.toLocaleString('fr-FR')} (${percentage}%)`);
    });
    console.log();

    // Générer les codes et insérer par lots
    console.log(`🎫 Génération de ${TOTAL_TICKETS.toLocaleString('fr-FR')} codes...`);
    const existingCodes = new Set<string>();
    const startTime = Date.now();
    let insertedCount = 0;

    for (let batchStart = 0; batchStart < TOTAL_TICKETS; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_TICKETS);
      const batchData: { code: string; prizeType: PrizeType }[] = [];

      for (let i = batchStart; i < batchEnd; i++) {
        const code = generateValidCode(existingCodes);
        existingCodes.add(code);
        batchData.push({
          code,
          prizeType: prizes[i],
        });
      }

      await prisma.ticket.createMany({
        data: batchData,
      });

      insertedCount += batchData.length;
      const progress = ((insertedCount / TOTAL_TICKETS) * 100).toFixed(1);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(
        `\r   Progression: ${progress}% (${insertedCount.toLocaleString('fr-FR')}/${TOTAL_TICKETS.toLocaleString('fr-FR')}) - ${elapsed}s`,
      );
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `\n\n✅ ${insertedCount.toLocaleString('fr-FR')} tickets générés en ${totalTime} secondes!\n`,
    );
  }

  // Créer des utilisateurs de test
  console.log('👥 Création des utilisateurs de test...');

  const hashedPassword = await bcrypt.hash('Test1234!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@thetiptop.fr' },
    update: {},
    create: {
      email: 'admin@thetiptop.fr',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'TheTipTop',
      birthDate: new Date('1985-03-12'),
      gender: 'PREFER_NOT_TO_SAY',
      role: 'ADMIN',
      consentEmail: true,
      consentData: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'employe@thetiptop.fr' },
    update: {},
    create: {
      email: 'employe@thetiptop.fr',
      password: hashedPassword,
      firstName: 'Employé',
      lastName: 'Boutique',
      birthDate: new Date('1992-07-24'),
      gender: 'FEMALE',
      role: 'EMPLOYEE',
      consentEmail: true,
      consentData: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'client@test.fr' },
    update: {},
    create: {
      email: 'client@test.fr',
      password: hashedPassword,
      firstName: 'Client',
      lastName: 'Test',
      birthDate: new Date('1998-11-05'),
      gender: 'MALE',
      role: 'CLIENT',
      consentEmail: true,
      consentData: true,
    },
  });

  console.log('✅ Utilisateurs de test créés:');
  console.log('   - admin@thetiptop.fr (Admin)');
  console.log('   - employe@thetiptop.fr (Employé)');
  console.log('   - client@test.fr (Client)');
  console.log('   - Mot de passe: Test1234!\n');

  await seedDemographicCohort(hashedPassword);

  console.log('🎉 Seed terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
