# Tests - vue d'ensemble

Index de tous les types de tests du projet : ce qui existe, où ça vit, et
pourquoi. Chaque famille a sa propre documentation détaillée ; celle-ci ne
fait que les relier entre elles.

| Type | Emplacement | Outil | Lancé par |
|---|---|---|---|
| Unitaires API | [api/tests/unit/](../api/tests/unit/) (`*.spec.ts`, miroir de `api/src/`) | Jest | Stage `Unit Tests` du pipeline (`npx jest` dans `api/`), sur toute branche |
| Unitaires Webapp | [webapp/tests/unit/](../webapp/tests/unit/) (`*.test.ts(x)`, miroir de `webapp/src/`) | Jest | Idem, dans `webapp/` |
| Fonctionnels API (intégration) | [api/test/](../api/test/) (`*.e2e-spec.ts`) | Jest + Supertest | `npm run test:e2e:ci --workspace api`, en local ou manuellement - **pas encore branché au pipeline** (voir [api/test/README.md](../api/test/README.md)) |
| End-to-end Webapp | `webapp/cypress/e2e/*.cy.ts` (5 specs) | Cypress | Stage `E2E Tests` du pipeline, contre PREPROD, uniquement sur `main` |
| Performance | [tests/performance/](performance/) | k6 | `Jenkinsfile.k6`, planifié chaque semaine contre PREPROD |
| Sécurité (dynamique) | [tests/security/](security/) | OWASP ZAP | Stage `OWASP ZAP` du pipeline, contre PREPROD |
| Sécurité (statique) | tout le dépôt | Trivy, Gitleaks, Semgrep, SonarQube | Pipeline, sur le code source et l'image Docker |

Le protocole détaillé des tests de charge, de sécurité et de régression est
dans [docs/05-PROTOCOLES-DE-TESTS.md](../docs/05-PROTOCOLES-DE-TESTS.md).

## Où vivent les tests unitaires, et pourquoi

`api/src/**/*.spec.ts` et `webapp/src/**/*.test.ts(x)` ont été déplacés vers
`api/tests/unit/` et `webapp/tests/unit/` (miroir de l'arborescence `src/`),
en réécrivant leurs imports relatifs vers l'alias `@/` pour qu'ils restent
valides indépendamment de leur emplacement. `api/jest.config.js`
(`roots: ['<rootDir>/tests/unit']`) et `webapp/jest.config.js`
(`testMatch: ['<rootDir>/tests/unit/**/*.test.{ts,tsx}']`) pointent désormais
vers ce nouvel emplacement.

Le déplacement reste **interne à chaque workspace npm** (`api/`, `webapp/`) :
remonter jusqu'à `tests/` à la racine du dépôt casserait la résolution de
`node_modules`/`tsconfig` propre à chaque package pour un gain purement
cosmétique.

## Pourquoi `api/test/` et `webapp/cypress/` ne sont pas sous `tests/unit/` ou `tests/`

Les deux sont déjà isolés du code source, mais restent dans leur workspace
npm respectif car ils y sont fortement couplés :

- `api/test/` s'appuie sur `api/docker-compose.e2e.yml` (Postgres/Redis
  éphémères) et sur le workspace npm `api` (`npm run test:e2e:ci --workspace
  api`). Le déplacer casserait ce provisionnement sans rien gagner.
- `webapp/cypress/` est détecté par le pipeline via un chemin explicite
  (`webapp/cypress.config.ts`, voir `ciPipeline.groovy`) ; le déplacer
  demanderait de modifier cette détection pour un déplacement purement
  cosmétique.

`tests/` à la racine reste donc l'emplacement des suites qui ne dépendent
d'aucun des deux workspaces applicatifs : performance et sécurité.
