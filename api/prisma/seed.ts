// ===========================================
// Seed Database - Génération des 500 000 codes
// ===========================================
// Exécuter avec: npm run prisma:seed
// ===========================================

import { PrismaClient, PrizeType } from '@prisma/client';
import * as crypto from 'crypto';
import * as readline from 'readline';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Alphabet sécurisé (sans caractères ambigus I, O, 0, 1)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 10;
const TOTAL_TICKETS = 500000;
const BATCH_SIZE = 10000; // Insertion par lots pour performance

// Répartition des gains selon le cahier des charges
const PRIZE_DISTRIBUTION: { type: PrizeType; percentage: number }[] = [
  { type: 'INFUSER', percentage: 60 },       // 300 000 tickets
  { type: 'TEA_DETOX', percentage: 20 },     // 100 000 tickets
  { type: 'TEA_SIGNATURE', percentage: 10 }, // 50 000 tickets
  { type: 'GIFT_BOX_39', percentage: 6 },    // 30 000 tickets
  { type: 'GIFT_BOX_69', percentage: 4 },    // 20 000 tickets
];

// Liste de mots à éviter dans les codes
const FORBIDDEN_WORDS = [
  'FUCK', 'SHIT', 'DAMN', 'HELL', 'CRAP', 'NAZI', 'SEXE', 'PORN',
  'MERD', 'PUTE', 'BITE', 'CULS', 'NAZE', 'BETE', 'MORT',
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

async function main() {
  console.log('🍵 Démarrage de la génération des tickets Thé Tip Top...\n');

  // Vérifier si des tickets existent déjà
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
      console.log('❌ Opération annulée.');
      return;
    }
  }

  // Créer la configuration du jeu si elle n'existe pas
  const existingConfig = await prisma.gameConfig.findFirst();
  if (!existingConfig) {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    const claimEndDate = new Date(endDate);
    claimEndDate.setDate(claimEndDate.getDate() + 30);

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
    console.log(`   - Fin réclamation: ${claimEndDate.toLocaleDateString('fr-FR')}\n`);
  }

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
      `\r   Progression: ${progress}% (${insertedCount.toLocaleString('fr-FR')}/${TOTAL_TICKETS.toLocaleString('fr-FR')}) - ${elapsed}s`
    );
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n✅ ${insertedCount.toLocaleString('fr-FR')} tickets générés en ${totalTime} secondes!\n`);

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
