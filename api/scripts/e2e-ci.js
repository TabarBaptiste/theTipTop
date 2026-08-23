// ===========================================
// Tests fonctionnels, services compris
// ===========================================
// Provisionne PostgreSQL et Redis, prépare le schéma, lance les suites, puis
// démonte tout. Objectif : que `npm run test:e2e:ci` suffise, sur un poste de
// développement comme sur un agent Jenkins, sans dépendre de services
// préexistants.
//
// Écrit en JavaScript et non en shell : la même commande doit fonctionner sous
// Windows et sous Linux.

const { spawnSync } = require('child_process');
const { join } = require('path');

const RACINE = join(__dirname, '..');
const COMPOSE = ['compose', '-f', join(RACINE, 'docker-compose.e2e.yml')];

// Ports décalés : les services de développement peuvent tourner en parallèle.
const ENV = {
  ...process.env,
  DATABASE_URL: 'postgresql://thetiptop:thetiptop_e2e@localhost:15432/thetiptop_e2e?schema=public',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '16379',
  REDIS_PASSWORD: '',
};

/** Exécute une commande en héritant du terminal, et interrompt tout si elle échoue. */
function executer(commande, arguments_, { tolerant = false } = {}) {
  // nosemgrep: javascript.lang.security.audit.spawn-shell-true.spawn-shell-true, javascript.lang.security.detect-child-process.detect-child-process -- script CI/dev uniquement, commande et arguments toujours codes en dur dans ce fichier, jamais d'entree utilisateur.
  const resultat = spawnSync(commande, arguments_, {
    cwd: RACINE,
    env: ENV,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (resultat.status !== 0 && !tolerant) {
    throw new Error(`Échec : ${commande} ${arguments_.join(' ')}`);
  }

  return resultat.status;
}

function demonter() {
  console.log('\n--- Arrêt des services ---');
  executer('docker', [...COMPOSE, 'down', '-v'], { tolerant: true });
}

let code = 1;
try {
  console.log('--- Démarrage de PostgreSQL et Redis ---');
  // --wait bloque jusqu'aux healthchecks : sans lui, les migrations
  // partiraient avant que la base accepte les connexions.
  executer('docker', [...COMPOSE, 'up', '-d', '--wait']);

  console.log('\n--- Schéma et jeu de données ---');
  executer('npx', ['prisma', 'migrate', 'deploy']);
  executer('npx', ['prisma', 'db', 'seed']);

  console.log('\n--- Tests fonctionnels ---');
  code = executer('npx', ['jest', '--config', './test/jest-e2e.json'], { tolerant: true });
} catch (erreur) {
  console.error(`\n${erreur.message}`);
} finally {
  demonter();
}

process.exit(code);
