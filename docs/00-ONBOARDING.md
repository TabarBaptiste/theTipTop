# 00 — Onboarding : setup d'un nouveau poste

> Ce document décrit **tout ce qu'il faut installer et configurer** après un `git clone` de `thetiptop_v0`.
> Il sert aussi de **contexte machine** : une IA (Claude Code, Copilot…) peut le lire pour configurer
> l'environnement sans deviner. Il complète [`.claude/CLAUDE.md`](../.claude/CLAUDE.md) (règles de
> comportement + conventions de code) — ici, on ne parle que d'outillage et de workflow.

---

## 1. Prérequis à installer

| Outil | Version | Pourquoi | Bloquant ? |
|-------|---------|----------|-----------|
| **Node.js** | 22.x | Runtime des deux workspaces (`@types/node` ^22) | Oui |
| **npm** | ≥ 10 | Le monorepo utilise les **npm workspaces** | Oui |
| **Git** | ≥ 2.40 | — | Oui |
| **Docker + Docker Compose** | v2 (`docker compose`, pas `docker-compose`) | Postgres, Redis, Adminer, API, webapp | Oui pour la DB |
| **gitleaks** | récent | **Le hook pre-commit refuse de commiter si `gitleaks` est absent du PATH** | Oui |

Installation de gitleaks :

```bash
scoop install gitleaks
```

```bash
brew install gitleaks
```

Diagnostic complet des versions installées vs. attendues :

```bash
bash check-versions.sh
```

> ⚠️ **N'utilisez ni Yarn ni pnpm.** `yarn.lock` est présent à la racine mais il est maintenu
> automatiquement par npm ≥ 7 : il bougera après un `npm install`, c'est normal, on ne le supprime pas.

---

## 2. Premier setup, dans l'ordre

```bash
git clone <url-du-repo> thetiptop_v0
cd thetiptop_v0
npm install
cp api/.env.example api/.env
cp webapp/.env.example webapp/.env
docker compose up -d postgres redis
cd api && npx prisma migrate dev && npm run prisma:seed
```

Points d'attention sur ces commandes :

- `npm install` **à la racine uniquement** : les workspaces `api` et `webapp` sont installés en même
  temps. Il installe aussi Husky (script `prepare`) — sans lui, aucun hook Git ne s'active.
- `postinstall` de l'API lance automatiquement `prisma generate`.
- **Le seed génère 500 000 tickets** : comptez plusieurs minutes. C'est normal.
- Un warning npm `Unknown project config "CYPRESS_INSTALL_BINARY"` apparaît à l'install : cosmétique.
  La ligne dans `.npmrc` désactive le téléchargement du binaire Cypress, qui échoue derrière les proxys
  SSL (école / entreprise). Pour réellement lancer Cypress en local :
  ```bash
  CYPRESS_INSTALL_BINARY=1 npm install
  ```

### Comptes créés par le seed

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@thetiptop.fr` | `Test1234!` |
| Employé | `employe@thetiptop.fr` | `Test1234!` |
| Client | `client@test.fr` | `Test1234!` |

Source de vérité : `api/prisma/seed.ts`. Ce sont aussi les comptes utilisés par les tests Cypress.

---

## 3. Lancer le projet

### Option A — tout en Docker

```bash
docker compose up -d
```

### Option B — DB en Docker, apps en local (recommandé pour développer)

```bash
docker compose up -d postgres redis adminer
```

```bash
cd api && npm run start:dev
```

```bash
cd webapp && npm run dev
```

### Ports et URLs

| Service | URL |
|---------|-----|
| WebApp | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger | http://localhost:3001/api/docs |
| PostgreSQL | `localhost:5432` — user `thetiptop` / db `thetiptop` / pass `thetiptop_dev` |
| Redis | `localhost:6379` |
| Adminer | http://localhost:8080 |
| Redis Commander | http://localhost:8081 |

`DB_PASSWORD`, `JWT_SECRET` et `JWT_REFRESH_SECRET` ont des valeurs de repli dans
`docker-compose.yml` : en local rien à définir, **en prod tout doit venir de l'environnement**.

---

## 4. Politique de branches — appliquée par un hook

Le hook `pre-commit` **rejette le commit** si le nom de branche ne correspond pas à :

```
main | develop | feature/<nom> | refactor/<nom> | fix/<nom> | chore/<nom> | release/<version> | hotfix/<version>
```

Le `<nom>` doit être en `[a-z0-9._-]` (minuscules, pas d'espace, pas de majuscule).

```
✅ feature/page-404-not-found     ✅ hotfix/1.2.1      ✅ release/1.3.0
✅ refactor/skeleton-loaders      ✅ fix/bug-login      ✅ chore/upgrade-deps
❌ Feature/Page404                ❌ docs/readme        ❌ feature/Page404
```

> `docs/` n'est **pas** un préfixe de branche accepté par le hook (bien que ce soit un type de commit
> valide) — utilisez `feature/` ou `chore/` pour une branche de documentation.

Workflow : `feature/*` (ou `refactor/`, `fix/`, `chore/`) → PR/MR vers `develop` → `release/*` → `main`.
`hotfix/*` part de `main`.

---

## 5. Husky, lint-staged, commitlint

`npm install` installe les hooks. Deux hooks actifs, dans cet ordre :

**`.husky/pre-commit`** — 3 barrières, dans l'ordre, chacune bloquante :
1. Validation du nom de branche (voir §4).
2. `gitleaks protect --staged` — détection de secrets dans les fichiers stagés.
   Faux positif avéré → l'ajouter à `.gitleaksignore` (format `<sha>:<fichier>:<règle>:<ligne>`),
   jamais contourner avec `--no-verify`.
3. `lint-staged` — uniquement si des fichiers `.ts/.tsx/.js/.jsx` sont stagés. Lance `eslint --fix`
   avec la config du bon workspace (`api/eslint.config.js` ou `webapp/eslint.config.mjs`).

**`.husky/commit-msg`** — `commitlint` valide le message (`commitlint.config.js`) :

```
<type>(<scope>): <sujet>
```

- **types** : `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `ci`, `build`, `perf`, `style`, `revert`
- **scopes autorisés (liste fermée)** : `api`, `frontend`, `docker`, `jenkins`, `traefik`,
  `monitoring`, `security`, `infra`, `backup`, `db`, `docs` — le scope est optionnel, mais s'il est
  présent il **doit** venir de cette liste.
- header ≤ 200 caractères.

```
✅ feat(frontend): ajoute le skeleton loader du dashboard
✅ fix(api): corrige le calcul du quota de tickets
❌ feat(webapp): ...        ← scope hors liste (c'est "frontend")
❌ Feat: nouvelle page      ← type capitalisé
```

---

## 6. Qualité, tests, CI

### Commandes

```bash
npm run lint --workspaces
```

```bash
npm test --workspaces
```

| Périmètre | Commandes |
|-----------|-----------|
| API — unitaires | `cd api && npm test` / `npm run test:cov` |
| API — fonctionnels | `cd api && npm run test:e2e:ci` (provisionne ses propres Postgres + Redis, cf. `api/test/README.md`) |
| WebApp — unitaires | `cd webapp && npm test` |
| WebApp — E2E | `cd webapp && npm run test:e2e` (Cypress ; nécessite app + API + DB seedée en marche) |
| Régression complète | `npm run test:regression` (lint + unitaires des deux côtés + fonctionnels API) |
| Charge | `tests/performance/` — cinq profils k6, cf. [05-PROTOCOLES-DE-TESTS.md](05-PROTOCOLES-DE-TESTS.md) |
| Sécurité | `npm run test:securite` + scan ZAP, cf. [05-PROTOCOLES-DE-TESTS.md](05-PROTOCOLES-DE-TESTS.md) |

### Ce qui fait échouer le pipeline Jenkins

- Toute erreur ESLint.
- Tout test Jest en échec.
- **Couverture de code < 70 %** (seuil Jenkins dur, cf. `.claude/CLAUDE.md`).
- Vulnérabilités **CRITICAL** Trivy sur les images Docker. Les CVE non actionnables (OS de l'image de
  base, deps vendorisées dans Next) sont listées et **justifiées** dans `.trivyignore` — n'ajoutez
  jamais d'entrée sans avoir vérifié `npm audit` / `npm ls` et documenté la raison.
- Quality gate SonarQube (`sonar-project.properties`).

### Exclusions de couverture à ne pas casser

- API : `main.ts`, `*.module.ts`, `index.ts` (pas de logique testable).
- WebApp : `src/app/**` et `src/middleware.ts` — couverts par Cypress, pas par Jest.

### Pipeline

`Jenkinsfile` délègue tout à `ciPipeline` de la shared library `furious-ducks-shared-library`.
Trois environnements : dev, preprod, prod (domaines `*-archi-o24a-4-5-g1.fr`). Les Dockerfiles vivent
dans `api/` et `webapp/` — **jamais à la racine**.

---

## 7. Outillage : règles à ne pas enfreindre

- **ESLint 9 flat config partout.** Ne jamais réintroduire ESLint 8 ni un `.eslintrc.*` : le hoisting
  npm mélange les versions et casse le lint des deux workspaces.
- **`next lint` n'existe plus** (supprimé dans Next 16) — le script webapp est `eslint src`.
- **Ne jamais mettre à jour les dépendances d'un seul workspace.** Utilisez
  `npm run check-updates` / `upgrade:patch` / `upgrade:minor` à la racine, puis revalidez
  lint + test + build **des deux côtés**.
- **Aucun secret en dur** — tout passe par les variables d'environnement (gitleaks veille).
- **Aucun fichier créé à la racine du monorepo.**

---

## 8. Conventions de code à connaître avant la première PR

- **HTTP 403** sur toutes les routes protégées, jamais 401. Convention projet non négociable.
- **Décorateurs Swagger obligatoires** sur chaque endpoint de l'API.
- Prisma uniquement (jamais TypeORM/Sequelize), PostgreSQL uniquement (jamais Mongo/MySQL).
- Le détail est dans [`.claude/CLAUDE.md`](../.claude/CLAUDE.md).

---

## 9. Documentation du projet

| Fichier | Contenu |
|---------|---------|
| `.claude/CLAUDE.md` | Règles de travail (IA et humains) + conventions techniques |
| `docs/context/` | Cahier des charges et specs client d'origine |
| `.github/instructions/copilot-instructions.instructions.md` | Équivalent CLAUDE.md pour GitHub Copilot |

---

## 10. Checklist « mon poste est prêt »

- [ ] `node -v` → 22.x, `npm -v` → ≥ 10
- [ ] `gitleaks version` répond
- [ ] `docker compose ps` → postgres et redis `healthy`
- [ ] `api/.env` et `webapp/.env` existent
- [ ] http://localhost:3001/api/docs affiche Swagger
- [ ] http://localhost:3000 affiche la home
- [ ] Connexion réussie avec `client@test.fr` / `Test1234!`
- [ ] `npm test --workspaces` passe
- [ ] Un commit test sur une branche `feature/...` passe les deux hooks
