# Protocoles de tests - charge, régression, sécurité

Ce document définit **comment** ces trois familles de tests sont conduites : ce
qu'elles mesurent, dans quelles conditions, selon quels critères d'acceptation,
et ce qui se passe quand un critère n'est pas tenu.

Les tests unitaires et fonctionnels ne sont pas décrits ici - ils le sont dans
[api/test/README.md](../api/test/README.md) et dans la stratégie de tests du
cahier des clauses techniques détaillées. Ils interviennent en revanche comme
composants du protocole de régression.

---

## 1. Protocole de tests de charge

### 1.1. Objet

Vérifier que la plateforme absorbe les niveaux de trafic attendus pendant
l'opération, en particulier les pics d'activation influenceurs - « plusieurs
milliers de connexions simultanées en quelques minutes » selon le cahier des
charges.

Une plateforme qui fonctionne parfaitement en isolation mais s'effondre sous
charge constitue un échec opérationnel : sur une opération de trente jours à
date de lancement contractuelle, une indisponibilité pendant une activation ne
se rattrape pas.

### 1.2. Outillage

k6 de Grafana, exécuté via l'image officielle - aucune installation locale
n'est requise. Les scénarios vivent dans
[tests/performance/](../tests/performance/).

### 1.3. Les cinq profils

| Profil | Montée en charge | Question posée |
|---|---|---|
| **Montée en charge** | 10 → 500 VUs en 10 min | À partir de quel niveau les temps se dégradent-ils ? |
| **Charge soutenue** | 50 VUs pendant 30 min | Y a-t-il une dérive lente : fuite mémoire, pool PostgreSQL saturé ? |
| **Pic** | 400 VUs en moins d'une minute | Le cache Redis absorbe-t-il l'afflux sans le répercuter sur PostgreSQL ? |
| **Stress** | jusqu'à 1600 VUs | Où est le point de rupture, et la dégradation est-elle graduelle ? |
| **Récupération** | pic de 600 VUs, retour au nominal | La plateforme revient-elle à son état initial, et en combien de temps ? |

Les cinq sollicitent exactement le même trafic - page d'accueil, table des
lots, vérification de code - et ne diffèrent que par leur profil de montée.
C'est la condition pour que leurs résultats soient comparables entre eux.

### 1.4. Critères d'acceptation

Repris du cahier des clauses techniques détaillées, §3.5 :

| Critère | Seuil |
|---|---|
| Temps de réponse p95, vérification de code | < 500 ms |
| Temps de réponse p99, tous endpoints | < 2 s |
| Taux d'erreur en charge nominale | < 1 % |

Le profil **stress** échappe à ces seuils : il cherche délibérément le point de
rupture, et lui appliquer les critères nominaux le ferait échouer pour la
raison même de son existence. Il est jugé sur un seul critère : la dégradation
doit être graduelle, jamais un effondrement.

Les percentiles sont retenus plutôt que la moyenne, qui masque les valeurs
extrêmes : c'est l'expérience du participant le moins bien servi qui compte,
pas celle du participant moyen.

### 1.5. Environnement

Les campagnes se déroulent sur **préproduction**, qui réplique la configuration
de production. Jamais sur un poste de développement : les chiffres obtenus sur
une machine qui fait tourner l'IDE, la base et le navigateur ne mesurent rien
d'exploitable.

#### Préparation obligatoire : la limitation de débit

L'API plafonne les requêtes **par adresse IP** - trois par seconde sur le
palier le plus court. Une campagne k6 part d'une seule machine, donc d'une
seule adresse : au-delà de quelques utilisateurs virtuels, elle ne mesure plus
la plateforme mais le limiteur.

Ce n'est pas un contournement du dispositif de sécurité. En production, 500
participants simultanés arrivent de 500 adresses distinctes, chacune très en
deçà du plafond ; c'est la configuration mono-source du test qui est
artificielle, pas la levée du plafond. La protection elle-même est vérifiée
séparément, par les tests fonctionnels (`api/test/protection-anti-abus`).

Avant une campagne, relever les plafonds sur l'environnement de test :

```bash
THROTTLE_SHORT_LIMIT=100000
THROTTLE_MEDIUM_LIMIT=100000
THROTTLE_LIMIT=100000
```

**Et les remettre à leurs valeurs de production après la campagne.** Un
environnement de préproduction laissé sans limitation ne représente plus la
production, et le prochain scan de sécurité le signalera à juste titre.

#### Aucun ticket n'est consommé

Le parcours simulé vérifie des codes volontairement inexistants. Le chemin
exercé est le même - validation du format, lecture indexée du ticket, table des
lots depuis Redis - mais rien n'est écrit. Un test de charge qui participerait
réellement brûlerait des lots à chaque exécution, et fausserait les
statistiques de l'opération.

### 1.6. Déroulement d'une campagne

1. Relever les plafonds de limitation de débit sur la cible.
2. Vérifier que les scénarios s'exécutent (`SMOKE=1`), cibles joignables.
3. Lancer les profils **dans cet ordre** : montée en charge, charge soutenue,
   pic, récupération, stress. Le stress vient en dernier : il peut laisser la
   plateforme dans un état dégradé qui fausserait les profils suivants.
4. Laisser la plateforme revenir au repos entre deux profils.
5. Pendant le profil **pic**, relever le nombre de connexions actives sur
   PostgreSQL - c'est la seule façon de vérifier que Redis absorbe la charge
   plutôt que de la répercuter :
   ```sql
   SELECT count(*) FROM pg_stat_activity WHERE datname = 'thetiptop';
   ```
   Le nombre doit rester stable pendant que le trafic est multiplié par dix.
6. Rétablir les plafonds de limitation.
7. Archiver les rapports `tests/performance/resultats/*.json`.

### 1.7. En cas de dépassement

Un seuil dépassé **bloque la promotion vers la production** et déclenche une
analyse des goulots d'étranglement. L'ordre d'investigation, du plus fréquent
au plus rare : requêtes PostgreSQL non indexées, cache Redis inopérant ou mal
invalidé, pool de connexions sous-dimensionné, ressources de l'instance.

Le rapport JSON conserve la répartition par endpoint (`parcours:accueil`,
`parcours:lots`, `parcours:verification`) : c'est par là qu'on commence, pour
savoir quel tiers a lâché.

---

## 2. Protocole de tests de régression

### 2.1. Objet

Garantir qu'une modification n'a rien cassé de ce qui fonctionnait. La
régression n'est pas une famille de tests distincte : c'est l'**exécution
systématique** de l'ensemble des tests existants, à des moments définis, avec
interdiction de passer outre.

### 2.2. Le socle de régression

| Niveau | Portée | Commande |
|---|---|---|
| Lint | Les deux workspaces | `npm run lint --workspaces` |
| Unitaires API | 29 suites | `npm test --workspace api` |
| Unitaires WebApp | Composants, stores, utilitaires | `npm test --workspace webapp` |
| **Build** | **Les deux workspaces** | **`npm run build --workspaces`** |
| Fonctionnels API | 4 suites, parcours complets | `npm run test:e2e:ci --workspace api` |
| E2E WebApp | Cypress, parcours navigateur | `npm run test:e2e --workspace webapp` |

Les cinq premiers niveaux sont réunis sous une commande unique :

```bash
npm run test:regression
```

C'est la vérification à passer avant d'ouvrir une merge request.

**Le build en fait partie, et ce n'était pas le cas au départ.** Cette omission
a laissé passer un build cassé : la régression était verte, la merge request
partait, et l'échec n'apparaissait qu'au pipeline. Une vérification qui prétend
autoriser une MR doit couvrir **tout** ce qui bloque le déploiement, sans quoi
elle donne une assurance qu'elle ne tient pas.

Le type-check est précisément l'étape que les tests ne couvrent pas : Jest
compile chaque fichier isolément, sans jamais vérifier la cohérence de
l'ensemble. Un conflit de types global passe donc les tests et casse le build.

**Exécuter Cypress sans installer son binaire.** `.npmrc` fixe
`CYPRESS_INSTALL_BINARY=0` pour contourner une erreur de certificat derrière le
proxy : `npx cypress run` échoue donc sur un poste ainsi configuré. L'image
officielle embarque le binaire et le navigateur, et ne demande rien d'autre que
Docker. Il faut monter **la racine du dépôt** et non `webapp/` : le monorepo
hisse `node_modules` à la racine, et `cypress.config.ts` ne résoudrait pas
autrement le paquet `cypress`.

```bash
docker run --rm -v "$PWD:/e2e" -w /e2e/webapp cypress/included:14.5.4 \
  --config baseUrl=http://host.docker.internal:3000 \
  --env API_URL=http://host.docker.internal:3001/api/v1
```

L'application et l'API doivent tourner sur la machine hôte, base seedée.

**Les parcours Cypress modifient l'environnement qu'ils visent.** Ceux de
`parcours-complets.cy.ts` traversent la vraie API sans rien simuler : ils
déplacent la fenêtre de jeu le temps de la suite puis la remettent en place,
consomment un à deux codes du stock, et créent un compte qu'ils suppriment. Ils
s'exécutent donc sur un environnement de test aux données représentatives,
jamais sur la production. C'est le prix de ce qu'ils prouvent : un code simulé
ne dirait rien de l'accord entre le front et le back.

**Ne rien exécuter d'autre en parallèle.** Certaines suites - le hachage de
mots de passe en particulier - approchent leur délai d'expiration sous forte
contention processeur. Lancée en même temps qu'une campagne de charge ou qu'un
calcul de couverture, la régression produit des échecs qui disparaissent à
l'exécution suivante. Un échec observé dans ces conditions doit être rejoué
seul avant d'être qualifié de régression.

### 2.3. Quand la régression est exécutée

| Moment | Ce qui tourne | Bloquant |
|---|---|---|
| Avant chaque commit | Lint sur les fichiers modifiés, détection de secrets | Oui (husky) |
| Avant d'ouvrir une MR | `npm run test:regression` | Oui (par convention) |
| À chaque push | Lint, unitaires, build, quality gate SonarQube | Oui (Jenkins) |
| Avant promotion en préproduction | Ci-dessus + E2E Cypress | Oui |
| Avant promotion en production | Ci-dessus + campagne de charge | Oui |

### 2.4. Critères d'acceptation

- Aucune erreur ESLint.
- Aucun test en échec, à aucun niveau.
- Couverture globale ≥ **70 %** (seuil Jenkins dur). Les seuils déclarés dans
  `api/jest.config.js` et `webapp/jest.config.js` échouent avant même Jenkins,
  ce qui donne le retour au développeur plutôt qu'au pipeline.
- Quality gate SonarQube : ≥ 80 % de couverture sur le nouveau code, zéro
  vulnérabilité critique ou bloquante, duplication < 3 %, maintenabilité A.

### 2.5. Règle de non-contournement

Un test en échec arrête le pipeline. Aucune dérogation manuelle. Un pipeline
dont les échecs peuvent être ignorés n'est pas un filet de sécurité, c'est une
suggestion.

### 2.6. Traitement d'une régression détectée

1. **Ne pas désactiver le test.** Un test qui échoue a fait exactement ce qu'on
   attendait de lui.
2. Écrire, si elle n'existe pas, l'assertion qui reproduit le défaut au niveau
   le plus bas où il se manifeste - unitaire de préférence, fonctionnel si le
   défaut naît de l'assemblage.
3. Corriger.
4. Vérifier que le test échoue sans la correction et passe avec.

Ce dernier point n'est pas une formalité. Un test ajouté après coup qui passe
dans les deux cas ne protège de rien : il donne l'illusion d'une couverture.

---

## 3. Protocole de tests de sécurité

### 3.1. Objet

Vérifier que la plateforme ne présente pas de vulnérabilité exploitable, à
quatre niveaux : les secrets, les dépendances, les images, et l'application
exposée.

### 3.2. Les quatre contrôles

| Contrôle | Outil | Déclenchement | Bloquant |
|---|---|---|---|
| Secrets dans le code | gitleaks | Avant chaque commit (husky) | Oui |
| Vulnérabilités des dépendances | `npm audit` | Manuel + revue de dépendances | Non - arbitrage |
| Vulnérabilités des images | Trivy | À chaque build d'image (Jenkins) | Oui, niveau CRITICAL |
| Application exposée | OWASP ZAP baseline | Après déploiement en préproduction | Oui, niveau FAIL |

À quoi s'ajoute l'analyse statique SonarQube, qui détecte injections, secrets
et mauvaises pratiques dans le code source lui-même.

### 3.3. Content-Security-Policy : passer en mode bloquant

La politique est en place en `Content-Security-Policy-Report-Only` : les
violations sont signalées dans la console du navigateur, rien n'est bloqué.
C'est un état transitoire, pas une destination — une CSP en mode rapport ne
protège de rien.

#### Ce qui a déjà été vérifié

Balayage complet sur un build de production local, avec API jointe et
consentement analytics accordé. Aucune violation sur :

| Surface | Détail |
|---|---|
| Pages publiques | Accueil, participation, connexion, inscription, règlement, FAQ, mentions légales, gestion des cookies |
| Google Tag Manager | Script réellement chargé, `gtag` défini, `dataLayer` alimenté |
| Parcours authentifiés | Tableau de bord, participation, profil, paramètres — connexion par le formulaire, pas par injection de session |
| Back-office | Administration et espace employé |
| Retour OAuth | POST d'échange du code : préflight 204, refus 403 attendu |

Une seule violation a été trouvée pendant la mise au point, et elle valide
l'approche : les visuels des lots sont servis par Cloudinary, dont les URL ne
figurent nulle part dans le code — elles viennent de la base. Une lecture des
sources ne pouvait pas les voir. Sans cette origine, les images de lots
disparaissaient de l'accueil.

#### Ce qui reste à observer, et pourquoi

Le risque résiduel n'est plus applicatif mais **environnemental** : un domaine
présent en préproduction et absent en développement. Un CDN de polices
configuré côté infrastructure, une balise injectée par Traefik, ou des visuels
de lots pointant vers un autre compte Cloudinary que celui de la base locale.

Le cas Cloudinary montre exactement ce qu'on cherche : une origine qui
n'apparaît qu'à l'exécution, et seulement dans l'environnement concerné.

#### Procédure

1. Déployer en préproduction, la politique restant en `Report-Only`.
2. Observer **plusieurs jours**, en couvrant au minimum un parcours de
   participation complet, une connexion Google et une connexion Facebook —
   ces deux dernières n'ont jamais pu être automatisées.
3. Relever les violations dans la console du navigateur. Il n'y a pas de
   collecteur : `report-uri` n'est pas configuré, et l'ajouter supposerait un
   service tiers de plus.
4. Pour chaque violation, **comprendre l'origine avant d'élargir la
   politique**. Ajouter un domaine sans savoir ce qu'il sert revient à
   désactiver la directive.
5. Basculer en `Content-Security-Policy` une fois la période écoulée sans
   violation.

#### Deux points de mise en œuvre

Next évalue `headers()` **à la compilation** : le nom de l'en-tête est figé
dans le manifeste de routes. Le passage en mode bloquant demande donc une
modification de code et un redéploiement, pas une variable d'environnement.

Et `'unsafe-inline'` reste autorisé sur les scripts. L'alternative est un
*nonce* par requête posé par le middleware, qui rendrait chaque page dynamique
et ferait perdre le prérendu statique de toutes les pages publiques. Ce
compromis est à trancher séparément, à froid.

### 3.4. Scan OWASP ZAP

Le scan baseline parcourt l'application déployée sans l'attaquer activement :
il analyse les réponses, les en-têtes et les formulaires. C'est un contrôle
passif, sans risque pour les données de l'environnement cible.

```bash
docker run --rm -v "$PWD/tests/security:/zap/wrk" -t ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t https://thetiptop-preprod.wk-archi-o24a-4-5-g1.fr \
  -c zap-baseline.tsv -I
```

Le fichier [tests/security/zap-baseline.tsv](../tests/security/zap-baseline.tsv)
classe chaque règle. La discipline est celle de `.trivyignore` : **une alerte
n'est écartée qu'après avoir été comprise, et la raison est écrite**. Une règle
passée en IGNORE sans justification est une régression de sécurité déguisée en
configuration.

Trois alertes y sont écartées, toutes imputables aux bundles de Next.js et
React et non au code du projet : commentaires dits suspects, fonctions
JavaScript dangereuses, contenu non stockable. Les autres restent visibles
jusqu'à leur correction.

**La surface analysée varie d'une exécution à l'autre.** Le scan baseline
s'appuie sur un parcours automatique du site, dont la profondeur dépend du
temps de réponse et du chargement asynchrone. Deux exécutions successives ne
visitent pas exactement les mêmes pages : une alerte absente d'un rapport n'est
donc pas nécessairement corrigée, elle peut simplement ne pas avoir été
atteinte. C'est la raison pour laquelle le scan complète les tests
fonctionnels, sans les remplacer - eux visitent un parcours déterminé.

### 3.5. Première application du protocole

Exécuté contre l'environnement local, à titre d'étalonnage :
**0 FAIL, 9 WARN, 3 IGNORE, 55 PASS**.

Aucune alerte bloquante. Les avertissements retenus correspondent tous à des
manques réels, vérifiés dans la configuration du projet et non déduits du seul
rapport :

| Alerte | Constat |
|---|---|
| Jetons dans l'URL [10024] | Le retour OAuth redirige vers `/auth/callback?accessToken=…&refreshToken=…`. Les jetons entrent alors dans l'historique du navigateur, les en-têtes `Referer` et les journaux des intermédiaires. C'est le point le plus sérieux du rapport. |
| CSP absente [10038] | `webapp/next.config.js` pose cinq en-têtes de sécurité, mais aucune Content-Security-Policy. |
| Permissions-Policy absente [10063] | Non configurée. |
| X-Powered-By [10037] | `poweredByHeader` n'est pas désactivé : Next.js annonce le framework. |
| COEP absente [90004] | Non configurée. |

À quoi s'ajoute, côté dépendances, `npm audit --omit=dev` : **12
vulnérabilités en production**, dont neuf de gravité élevée, la principale
étant `sharp` et ses CVE héritées de libvips.

Ces constats relèvent de l'audit du site et y sont traités. Ils figurent ici
parce qu'un protocole dont on n'a jamais publié la première mesure reste une
intention.

### 3.6. Contrôles applicatifs vérifiés par ailleurs

Plusieurs propriétés de sécurité ne relèvent pas d'un scanner mais des tests
fonctionnels, qui les vérifient à chaque exécution :

- **Contrôle d'accès** : toute route protégée répond 403 sans jeton valide, et
  un client ne peut atteindre ni la liste complète des participations ni les
  routes réservées aux employés.
- **Anti-énumération** : un mot de passe erroné et une adresse inconnue
  produisent le même statut et le même message ; il en va de même pour un code
  de vérification faux et une demande inexistante.
- **Anti-IDOR** : un client consultant la participation d'un autre reçoit 404,
  et non 403 - le second révélerait l'existence de la ressource.
- **Limitation de débit** : plafonds par IP et par utilisateur.
- **Validation stricte** : toute propriété non prévue au contrat est refusée,
  jamais ignorée silencieusement.
- **RGPD** : aucune donnée personnelle n'est enregistrée sans consentement
  explicite.

Ces vérifications vivent dans `api/test/` et sont détaillées dans
[api/test/README.md](../api/test/README.md).

### 3.7. Traitement des vulnérabilités de dépendances

`npm audit` remonte régulièrement des vulnérabilités qui ne sont pas toutes
actionnables ni toutes exposées. La grille de lecture :

1. **La dépendance est-elle en production ?** `npm audit --omit=dev` isole les
   dépendances réellement déployées. Une vulnérabilité dans un outil de test
   n'expose pas la plateforme.
2. **Le chemin vulnérable est-il emprunté ?** Une CVE dans une fonction que le
   projet n'appelle jamais ne constitue pas une exposition.
3. **La correction est-elle non cassante ?** `npm audit fix` sans `--force`
   applique les correctifs compatibles.

Toute mise à jour se fait depuis la racine et pour les deux workspaces à la
fois - `npm run upgrade:patch` ou `upgrade:minor` - jamais sur un seul côté :
le hoisting npm mélangerait les versions.

### 3.8. En cas de découverte

| Gravité | Délai de traitement | Effet |
|---|---|---|
| Critique, exploitable en production | Immédiat | Blocage du déploiement, correctif en `hotfix/` |
| Élevée, non exposée | Prochain sprint | Documentée, suivie |
| Faible ou non actionnable | Documentée et justifiée | `.trivyignore` ou `zap-baseline.tsv` |

Aucune vulnérabilité n'est écartée sans trace écrite de la raison.
