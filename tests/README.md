# Tests - vue d'ensemble

Index de tous les types de tests du projet : ce qui existe, où ça vit, et
pourquoi. Chaque famille a sa propre documentation détaillée ; celle-ci ne
fait que les relier entre elles.

| Type | Emplacement | Outil | Lancé par |
|---|---|---|---|
| Unitaires API | `api/src/**/*.spec.ts` (31 fichiers) | Jest | Stage `Unit Tests` du pipeline (`npx jest` dans `api/`), sur toute branche |
| Unitaires Webapp | `webapp/src/**/*.test.ts(x)` (32 fichiers) | Jest | Idem, dans `webapp/` |
| Fonctionnels API (intégration) | [api/test/](../api/test/) (`*.e2e-spec.ts`) | Jest + Supertest | `npm run test:e2e:ci --workspace api`, en local ou manuellement - **pas encore branché au pipeline** (voir [api/test/README.md](../api/test/README.md)) |
| End-to-end Webapp | `webapp/cypress/e2e/*.cy.ts` (5 specs) | Cypress | Stage `E2E Tests` du pipeline, contre PREPROD, uniquement sur `main` |
| Performance | [tests/performance/](performance/) | k6 | `Jenkinsfile.k6`, planifié chaque semaine contre PREPROD |
| Sécurité (dynamique) | [tests/security/](security/) | OWASP ZAP | Stage `OWASP ZAP` du pipeline, contre PREPROD |
| Sécurité (statique) | tout le dépôt | Trivy, Gitleaks, Semgrep, SonarQube | Pipeline, sur le code source et l'image Docker |

Le protocole détaillé des tests de charge, de sécurité et de régression est
dans [docs/05-PROTOCOLES-DE-TESTS.md](../docs/05-PROTOCOLES-DE-TESTS.md).

## Pourquoi les tests unitaires restent à côté du code source

`api/src/**/*.spec.ts` et `webapp/src/**/*.test.ts(x)` ne sont pas sous
`tests/` : ils sont colocalisés avec le fichier qu'ils testent, ce qui est la
convention standard de l'écosystème (Jest, NestJS, Next.js) - un contributeur
qui ouvre `users.service.ts` trouve `users.service.spec.ts` juste à côté, sans
naviguer un arbre parallèle.

Les regrouper physiquement sous `tests/` demanderait de réécrire les imports
relatifs d'une soixantaine de fichiers (`import { X } from './x.service'`) sans
aucun bénéfice fonctionnel : le `rootDir`/`testRegex` de chaque
`jest.config.js` (`api/jest.config.js`, `webapp/jest.config.js`) suffit déjà à
ce qu'ils soient exécutés correctement, où qu'ils vivent.

## Pourquoi `api/test/` et `webapp/cypress/` ne sont pas non plus sous `tests/`

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
