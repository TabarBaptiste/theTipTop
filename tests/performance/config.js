// ===========================================
// Socle commun des tests de charge k6
// ===========================================
// Seuils, cibles et trafic simulé sont définis ici une seule fois : les cinq
// profils du cahier des clauses techniques ne diffèrent que par leur montée en
// charge, pas par ce qu'ils mesurent. Comparer un test de pic à un test de
// charge soutenue n'a de sens que s'ils sollicitent exactement les mêmes
// chemins.

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// ===========================================
// Cibles
// ===========================================

export const BASE_URL = __ENV.BASE_URL || 'http://host.docker.internal:3000';
export const API_URL = __ENV.API_URL || 'http://host.docker.internal:3001/api/v1';

/**
 * Réduit chaque profil à quelques secondes.
 *
 * Sert à vérifier qu'un scénario s'exécute - syntaxe, cibles joignables,
 * seuils bien nommés - avant de lancer une campagne de trente minutes. Ce
 * n'est pas une mesure : les chiffres produits sous SMOKE n'ont aucune valeur.
 */
export const SMOKE = __ENV.SMOKE === '1';

/**
 * Temps de réflexion entre deux itérations, en secondes.
 *
 * Sans lui, un utilisateur virtuel enchaîne ses requêtes aussi vite que le
 * serveur répond : « 500 VUs » ne représenterait plus 500 participants mais
 * quelques milliers de requêtes par seconde, très au-delà de ce que produit
 * une audience réelle. La pause rend la correspondance entre VUs et
 * utilisateurs simultanés interprétable.
 */
const PAUSE = Number(__ENV.PAUSE || 1);

// ===========================================
// Seuils d'acceptabilité
// ===========================================
// Repris tels quels du cahier des clauses techniques détaillées :
// p95 < 500 ms sur la vérification de code, taux d'erreur < 1 % en charge
// nominale, p99 < 2 s sur l'ensemble des endpoints.

export const SEUILS = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: ['p(99)<2000'],
  'http_req_duration{parcours:verification}': ['p(95)<500'],

  // Les deux seuils qui suivent ne servent pas a qualifier la plateforme : ils
  // existent pour que k6 produise la sous-metrique correspondante.
  //
  // Une etiquette seule ne suffit pas. k6 n'agrege un tag dans son resume que
  // si un seuil le nomme ; sans cela, les mesures du front et du catalogue se
  // fondent dans la moyenne globale et deviennent illisibles separement. Une
  // premiere campagne l'a montre a nos depens : le rapport ne contenait que la
  // verification de code, et le comportement du front - la seule partie
  // mesurable quand le limiteur de debit n'a pas ete releve - etait perdu.
  //
  // Les valeurs sont volontairement larges : c'est la separation par tier qui
  // est recherchee, pas un critere d'acceptation supplementaire. Les vrais
  // criteres restent les trois du cahier des clauses techniques.
  'http_req_duration{parcours:accueil}': ['p(95)<30000'],
  'http_req_duration{parcours:lots}': ['p(95)<30000'],
};

/**
 * Seuils desserrés pour les profils qui cherchent délibérément le point de
 * rupture. Y appliquer les seuils nominaux ferait échouer un test dont l'échec
 * applicatif est justement l'objet de la mesure.
 */
export const SEUILS_RUPTURE = {
  'http_req_duration{parcours:verification}': ['p(95)<5000'],
};

/**
 * Statistiques reprises dans le résumé.
 *
 * k6 n'inclut pas p(99) par défaut : les seuils le calculent, mais le rapport
 * ne l'affiche pas. Or c'est l'un des trois critères d'acceptation du CCTD, et
 * un rapport qui ne le montre pas oblige à rouvrir le JSON pour l'y chercher.
 */
export const STATS = ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'];

// Temps de réponse de la vérification de code, isolé des autres appels : c'est
// le chemin critique de l'opération, celui qui porte le seuil le plus strict.
export const dureeVerification = new Trend('duree_verification', true);

// ===========================================
// Trafic simulé
// ===========================================

/**
 * Codes volontairement inexistants.
 *
 * Un test de charge ne doit consommer aucun ticket : le parcours complet
 * brûlerait des lots réels à chaque exécution. La vérification d'un code
 * absent emprunte le même chemin - validation du format, lecture indexée du
 * ticket, chargement de la table des lots depuis Redis - sans rien écrire.
 * Seule la branche finale d'attribution n'est pas couverte, et elle relève des
 * tests fonctionnels, pas de la mesure de charge.
 */
function codeInexistant() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'ZZ';
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/**
 * Une itération de participant : il arrive sur le site, consulte les lots,
 * puis tente un code. Proportions volontairement simples - l'objet est de
 * charger les trois tiers (rendu Next, API, PostgreSQL/Redis), pas de
 * reproduire une pyramide d'audience.
 */
export function parcoursParticipant() {
  group('page d accueil', () => {
    const r = http.get(`${BASE_URL}/`, { tags: { parcours: 'accueil' } });
    check(r, { 'accueil rendu': (res) => res.status === 200 });
  });

  group('lots', () => {
    // Servi depuis le cache Redis : mesure la capacité du cache à absorber la
    // charge sans la répercuter sur PostgreSQL.
    const r = http.get(`${API_URL}/tickets/prizes`, { tags: { parcours: 'lots' } });
    check(r, { 'lots servis': (res) => res.status === 200 });
  });

  group('verification de code', () => {
    const r = http.post(
      `${API_URL}/tickets/verify`,
      JSON.stringify({ code: codeInexistant() }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { parcours: 'verification' },
      },
    );

    dureeVerification.add(r.timings.duration);

    // 200 attendu : l'endpoint répond toujours, en signalant dans son corps
    // que le code est inconnu. Un 4xx/5xx signifierait une défaillance - un
    // 429 en particulier, qui indiquerait que la limitation de débit fausse la
    // mesure (voir docs/05-PROTOCOLES-DE-TESTS.md).
    check(r, {
      'verification traitee': (res) => res.status === 200,
      'code correctement rejete': (res) => res.json('isValid') === false,
    });
  });

  // Légèrement variable : des pauses strictement identiques synchroniseraient
  // les utilisateurs virtuels en vagues, un artefact que la charge réelle n'a
  // pas.
  sleep(PAUSE * (0.5 + Math.random()));
}

// ===========================================
// Restitution
// ===========================================

/**
 * Écrit le résumé au format JSON, exigé pour l'archivage Jenkins, et conserve
 * l'affichage terminal pour l'exécution manuelle.
 */
export function resumeVers(nomDuProfil) {
  return function handleSummary(data) {
    return {
      stdout: `\n=== ${nomDuProfil} ===\n${resumeLisible(data)}\n`,
      [`resultats/${nomDuProfil}.json`]: JSON.stringify(data, null, 2),
    };
  };
}

/** Les quelques chiffres qu'on veut lire sans ouvrir le JSON. */
function resumeLisible(data) {
  const m = data.metrics;
  const lignes = [];

  // Toute statistique absente est signalée plutôt que lue à l'aveugle : une
  // exception ici ferait perdre l'export JSON, qui est l'essentiel du rapport.
  const stat = (metrique, cle) => {
    const valeurs = m[metrique] && m[metrique].values;
    const valeur = valeurs && valeurs[cle];
    return typeof valeur === 'number' ? valeur : null;
  };

  const afficher = (libelle, valeur, unite, suffixe = '') => {
    lignes.push(
      valeur === null
        ? `${libelle} : non mesure`
        : `${libelle} : ${valeur.toFixed(unite === '%' ? 2 : 0)} ${unite}${suffixe}`,
    );
  };

  lignes.push(`requetes           : ${stat('http_reqs', 'count') ?? 0}`);
  afficher('duree p95         ', stat('http_req_duration', 'p(95)'), 'ms');
  afficher('duree p99         ', stat('http_req_duration', 'p(99)'), 'ms', '  (seuil 2000)');
  afficher('verification p95  ', stat('duree_verification', 'p(95)'), 'ms', '  (seuil 500)');

  // Lecture par tier. Quand le limiteur de debit n'a pas ete releve sur la
  // cible, l'API sature et ses chiffres ne decrivent que lui : le front reste
  // alors la seule ligne exploitable.
  lignes.push('');
  afficher('front p95         ', stat('http_req_duration{parcours:accueil}', 'p(95)'), 'ms');
  afficher('catalogue p95     ', stat('http_req_duration{parcours:lots}', 'p(95)'), 'ms');

  const echecs = stat('http_req_failed', 'rate');
  afficher('taux d echec      ', echecs === null ? null : echecs * 100, '%', '  (seuil 1)');

  const seuilsRompus = Object.entries(data.metrics)
    .filter(([, valeur]) => valeur.thresholds)
    .flatMap(([nom, valeur]) =>
      Object.entries(valeur.thresholds)
        .filter(([, resultat]) => !resultat.ok)
        .map(([expression]) => `${nom} ${expression}`),
    );

  lignes.push(
    seuilsRompus.length === 0
      ? 'seuils             : tous respectes'
      : `seuils DEPASSES    : ${seuilsRompus.join(', ')}`,
  );

  return lignes.join('\n');
}
