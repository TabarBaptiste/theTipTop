# Plan d'utilisation de Claude Fable 5 — Thé Tip Top

**Aujourd'hui** : mercredi 10 juin 2026  
**Limite d'accès gratuit Fable 5** : jusqu'au 22 juin (retiré le 23)  
**Reset quota hebdo** : samedi 08h00 chaque semaine

---

## Calendrier des fenêtres de travail

Tu as **3 fenêtres** de quota pour maximiser l'usage de Fable 5 avant son retrait du 23 juin :

| Fenêtre | Période | Mission recommandée | Budget estimé |
|---|---|---|---|
| **1** | Vendredi 12 juin (avant reset sam. 13 → 08h00) | **Mission 1 — Couverture de tests** | Tout le quota disponible |
| **2** | Semaine du 15 au 19 juin (quota neuf) | **Mission 2** (lundi 15) puis **Mission 3** (15-19) | Split sur 2-3 sessions |
| **3** | 20-22 juin (avant retrait 23) | **Mission 4** (Figma) ou buffer pour finir 1-3 | Buffer/optionnel |

---

## État des lieux : CSV Notion vs Réalité du code

Beaucoup de tâches marquées "À faire"/"En cours" sont **déjà entièrement codées** :

| # | Tâche | CSV | Réalité | Verdict |
|---|---|---|---|---|
| 9 | OAuth Facebook | En cours | Strategy, callback, JWT, fallback email **complets** | ✅ Terminé — vérifier juste que les vraies credentials Meta sont en `.env` |
| 22 | Page Profil | À faire | `/dashboard/profile` complet (champs perso, sidebar, suppression compte) | ✅ Terminé — à clore |
| 23 | Stats démographiques | À faire | `GET /stats/demographics` + UI admin (genre, tranches d'âge) | ✅ Terminé — à clore |
| 24 | Stats globales | À faire | `GET /stats/global`, `/stats/prizes` + UI admin | ✅ Terminé — à clore |
| 26 | Tirage Grand Prix | À faire | Module `grand-prize/` complet (RNG crypto, audit log, 1 chance/participant) | ✅ Terminé — reste juste un fix d'affichage (Mission 2) |
| 27 | Champs âge/genre formulaire | À faire | `register.dto.ts` + Zod + UI déjà tout en place | ✅ Terminé — à clore |
| 16 | Footer final | À faire | Footer complet avec tous les liens légaux | ✅ Quasi terminé — lien FAQ cassé (Mission 2) |
| 4 | Valeur monétaire des lots | À faire | `Prize.value` optionnel, `PrizeCard` gère déjà l'absence | ⚠️ Probablement déjà résolu — à vérifier vite |
| — | **Test coverage** | N/A | 2/9 modules backend testés, **0 test frontend** | 🔥 **BLOQUANT** (seuil 80% Jenkins) → Mission 1 |
| 28 | Champs âge/genre Prisma + seed | À faire | Schéma OK, mais `seed.ts` **ne peuple pas** les 3 users de test | 🔧 Mission 2 |
| 11 | Page FAQ | À faire | `/faq` **inexistant**, lien cassé header+footer | 🔧 Mission 2 |
| 20 | Bouton Inscription header desktop | À faire | absent en desktop | 🔧 Mission 2 |
| 29 | Mettre en avant le grand prix | À faire | absent de la home | 🔧 Mission 2 |
| 12 | Dates officielles concours | En cours | `GameConfig` seedé et utilisé sur la home, mais **date "1er mars 2025" hardcodée** dans `/admin` | 🔧 Mission 2 |
| 36 | Comptes FB sans email | À faire | fallback `fb_*@facebook-noreply.local` déjà en place | 🔧 Mission 2 (proposer à l'utilisateur d'ajouter un vrai email) |
| 19 | Skeleton loaders | À faire | 13 `animate-spin`, 1 skeleton inline existant | 🔧 Mission 3 |
| 37 | Couleurs grises → noires | À faire | `text-stone-grey` très utilisé ; DESIGN.md alerte lui-même sur le contraste | 🔧 Mission 3 |
| 3 | Inversion couleurs /dashboard | À faire | dashboard/admin/employee utilisent `gray/blue/pink/tea/amber/emerald` (hors design system) | 🔧 Mission 3 |
| 88/89 | Tests unitaires/fonctionnels | Pas commencé | 2/9 modules backend testés, **0 test frontend** | 🔥 Mission 1 |
| 101 | Accessibilité WAI | Pas commencé | rien de systématique | 🔧 Mission 3 |
| 102 | SEO | Pas commencé | rien fait | 🔧 Mission 3 |
| 91 | Audit perf/SEO/a11y/sécu | Pas commencé | rien fait | 🔧 Mission 3 |
| 100 | Responsive | En cours | non vérifié systématiquement | 🔧 Mission 3 (QA légère) |
| 103 | RGPD + cookies | En cours | `/gestion-cookies` existe, bannière au 1er accès à vérifier | 🔧 Mission 3 |
| 25/98 | Module emailing | À faire | export/segmentation **complet**, intégration Brevo manquante | ⏸️ Hors périmètre (compte Brevo requis) |
| 10 | Refonte login/register vs Figma | À faire | pages fonctionnelles, pas comparées au Figma | 🎨 Mission 4 (si Figma dispo) |
| 13 | "Comment participer" vs Figma | À faire | section existe, pas comparée au Figma | 🎨 Mission 4 |
| 21 | Audit navbar vs Figma | À faire | liens présents, fix rapide possible | 🔧 Mission 2 (fix rapide) + 🎨 Mission 4 (audit complet) |
| 7 | Flux /participate | À faire | gated derrière login | ⏸️ **On en rediscute** comme convenu |
| 14 | CDN images | À faire | rien d'implémenté | ⏸️ Hors périmètre (convenu) |
| 105 | Tests utilisateurs | Pas commencé | nécessite de vrais utilisateurs | ⏸️ Pas pour Fable |

---

## Mission 1 — Couverture de tests (backend + frontend) → Vendredi 12 juin

**Objectif** : faire passer la couverture Jest du backend (api/) à **≥80%** (seuil bloquant Jenkins) et créer une couverture de tests frontend (webapp/) + test E2E Cypress du parcours critique.

### Contexte

- **Backend** : 2/9 modules ont des specs (auth.service.spec.ts, participations.service.spec.ts) — utilise-les comme référence pour le style de mock de PrismaService.
- **Modules SANS tests** : users, tickets, gains, stats, game-config, grand-prize, audit (controllers + services)
- **Frontend** : Jest configuré mais 0 fichier `.test.tsx` n'existe. Cypress configuré mais contenu à vérifier/compléter.

### Plan détaillé

```
1. cd api && npm run test:cov → note la couverture de référence par fichier.

2. Pour chaque module sans test (users, tickets, gains, stats, game-config, grand-prize, audit) :
   a. Écris des tests unitaires pour le service :
      - Cas nominal (happy path)
      - Cas d'erreur (exceptions, edge cases)
      - Cas limites (bordures du domaine)
      - Mock PrismaService comme dans participations.service.spec.ts
   
   b. Écris des tests pour le controller :
      - Vérifie que les routes protégées retournent **403** (jamais 401, c'est une convention non négociable du projet)
      - Vérifie les @ApiTags/@ApiOperation/@ApiResponse du Swagger
      - Teste les gardes (JWT, Roles)
   
   c. Après chaque module : npm run test:cov (ne régresse pas, progresse vers 80%)

3. Une fois ≥80% backend atteint :
   a. Vérifie/complète config Jest pour Next.js 14 App Router (next/jest si nécessaire)
   b. Écris des tests pour :
      - PrizeCard (components/ui/card.tsx)
      - Header (components/layout/header.tsx)
      - Footer (components/layout/footer.tsx)
      - LoginForm + RegisterForm (validation Zod, soumission)
      - /dashboard (rendu, état loading, état error)
      - /dashboard/participate (rendu, soumission code, modale succès)
   c. Cypress : ajoute/complète un spec e2e du happy path :
      - Inscription (ou login si déjà connecté)
      - Aller à /dashboard/participate
      - Soumettre un code valide
      - Vérifier que le lot s'affiche dans l'historique du dashboard

4. Commits conventionnels : 1 commit par module testé
   Format : test: add unit tests for {module} module
            test: add integration tests for {module} controllers
            test: add frontend tests for {component}
            test: add e2e test for game participation flow
```

### Contraintes

- ✗ Ne modifie le code de prod QUE si un test révèle un vrai bug
- ✗ Pas de refactor, pas de nettoyage non lié aux tests
- ✓ Respecte TypeScript strict, Swagger existant, HTTP 403
- ✓ Utilise les patterns déjà dans auth.service.spec.ts et participations.service.spec.ts

### Critères de succès

- `cd api && npm run test:cov` → **≥80% global**, toutes suites vertes
- `cd webapp && npm test` → vert avec couverture non nulle sur les fichiers listés
- Spec Cypress passe en local

---

## Mission 2 — Quick wins frontend (~courte session, lundi 15 juin)

**Objectif** : traiter une série de petites tâches frontend bien définies, indépendantes. Committe séparément chaque item en conventional commits.

### A. Seed de test (api/prisma/seed.ts)

Le schéma Prisma a déjà `birthDate (DateTime?)` et `gender (Gender enum)` sur User, mais le seed ne les remplit pas pour les 3 users de test (admin@thetiptop.fr, employe@thetiptop.fr, client@test.fr).

**À faire** :
- Ajoute des valeurs plausibles différentes pour chacun (ex : admin = 1980-05-15 / MALE, employe = 1995-03-22 / FEMALE, client = 2000-11-08 / OTHER)
- Relance `npx prisma db seed` et vérifie pas d'erreur

**Commit** : `feat: seed birthDate and gender for test users`

### B. Bouton "S'inscrire" dans le header desktop

En desktop, seul le bouton "Connexion" est visible. Le bouton "S'inscrire" existe dans le menu mobile.

**À faire** :
- Édite `webapp/src/components/layout/header.tsx`
- Ajoute un bouton CTA "S'inscrire" (style `.btn-outline` du DESIGN.md) à côté du bouton "Connexion"
- Visible uniquement quand l'utilisateur N'EST PAS connecté
- Réutilise le même lien/style que le mobile

**Commit** : `feat: add Register button to desktop header navigation`

### C. Page FAQ (nouvelle route)

header.tsx et footer.tsx pointent vers `/faq` mais la page n'existe pas (lien cassé).

**À faire** :
- Crée `webapp/src/app/faq/page.tsx`
- Utilise un composant Shadcn/ui Accordion
- Rédige le contenu en t'appuyant sur les infos existantes dans le repo :
  - Règlement du jeu (depuis `/dashboard/participate`)
  - Durée : 30j participation + 30j réclamation (depuis GameConfig)
  - Comment participer, types de lots, récupération, tirage au sort
- Respecte la voix de marque du DESIGN.md

**Commit** : `feat: create FAQ page with accordion and contest rules`

### D. Mise en avant du Grand Prix sur la home

Le grand prix ("Un an de thé", valeur 360€, tirage au sort parmi tous les participants) n'apparaît QUE dans la modale de succès et dans /admin.

**À faire** :
- Édite `webapp/src/app/page.tsx` + `components/home/`
- Ajoute une section dédiée visible tôt (après Hero ou intégrée à CountdownSection)
- Met en avant le Grand Prix comme argument principal du jeu
- Respecte les composants/cards du DESIGN.md (pas de fond/bordure, image avec radius, typo éditoriale)

**Commit** : `feat: showcase grand prize prominently on home page`

### E. Date du tirage dans l'admin

La date "1er mars 2025" est en dur alors que les vraies dates viennent de GameConfig.

**À faire** :
- Édite `webapp/src/app/admin/page.tsx` (section "Grand Tirage au Sort")
- Remplace la date en dur par la vraie date de GameConfig, récupérée via l'API existante
- Utilise la date pertinente (probablement `endDate`)

**Commit** : `feat: use GameConfig endDate for grand prize draw display in admin`

### F. Comptes Facebook sans email

Les comptes FB sans email reçoivent `fb_xxx@facebook-noreply.local`.

**À faire** :
- Édite `webapp/src/app/dashboard/profile/page.tsx`
- Si l'email connecté finit par "@facebook-noreply.local", affiche un bandeau d'avertissement
- Invite l'utilisateur à renseigner un vrai email (réutilise le formulaire/endpoint d'édition du profil existant)

**Commit** : `feat: prompt Facebook users without email to update profile`

### Contraintes globales Mission 2

- ✓ Toutes les classes Tailwind utilisent les tokens du DESIGN.md (terracotta, cream, noir, moss-green, gold, stone-grey, terracotta-pale)
- ✗ Aucune nouvelle couleur gray-*/blue-*/etc
- ✓ Vérifie cohérence avec sections existantes (pas de doublon visuel)
- ✓ ESLint clean après chaque commit

---

## Mission 3 — Accessibilité / SEO / Sécurité / Design tokens (milieu de semaine 2, 15-19 juin)

**Objectif** : audit + corrections pour WAI, SEO, sécurité de base, et conformité design system. Committe séparément chaque item.

### A. Nettoyage des tokens couleur

Les pages admin/dashboard/employee utilisent des classes hors design system : `gray-*`, `blue-*`, `pink-*`, `purple-*`, `tea-*`, `amber-*`, `emerald-*`.

**À faire** :
- Édite `webapp/src/app/dashboard/page.tsx`, `webapp/src/app/admin/page.tsx`, `webapp/src/app/employee/page.tsx`
- Remplace les classes hors design system par les tokens du DESIGN.md (terracotta-deep, terracotta-pale, moss-green, gold, stone-grey, cream, noir)
- Garde la même hiérarchie sémantique (ex : succès → moss-green, attention → gold/terracotta selon contexte)

**Commit** : `refactor: replace non-design-system colors with brand tokens in dashboard/admin/employee pages`

### B. Contraste de text-stone-grey

DESIGN.md alerte : "Ne jamais utiliser Gris Pierre (#8A8378) pour du texte sur fond crème sans vérification de contraste." `text-stone-grey` est utilisé 144 fois dans 15 fichiers.

**À faire** :
- Calcule ratio contraste : #8A8378 (stone-grey) sur #FAF6EF (cream) et #FFFFFF
- Pour les usages en TEXTE DE CORPS qui échouent WCAG AA (4.5:1), crée un token plus sombre
  - Variante `--color-stone-dark` dérivée du noir institutionnel #1A1A1A
  - Documente-la dans `.claude/DESIGN.md`
  - Applique-la à la place

**Commit** : `fix: improve text-stone-grey contrast for WCAG AA compliance`

### C. Passe accessibilité (WAI)

- Texte alternatif sur toutes les images
- aria-label sur les boutons/liens icône-seule
- États de focus visibles (ring terracotta) sur tous les éléments interactifs
- Hiérarchie h1/h2/h3 cohérente par page
- Labels de formulaire correctement associés (htmlFor/id)
- Lien "skip to content" sur le layout principal

**Commit** : `feat: improve accessibility (WAI) — alt text, aria labels, focus rings, heading hierarchy`

### D. Skeleton loaders

Remplace les `animate-spin` utilisés pour des CHARGEMENTS DE PAGE/SECTION par un composant Skeleton réutilisable.

**À faire** :
- Crée `webapp/src/components/ui/skeleton.tsx` (blocs gris animés via animate-pulse)
- Remplace les 13 × `animate-spin` dans admin, dashboard, employee, profile, participate
- Respecte la mise en page de chaque section
- ✗ NE TOUCHE PAS aux spinners de boutons de soumission (loading state inline) — c'est volontaire

**Commit** : `feat: add Skeleton component and replace page loading spinners`

### E. SEO

Pour chaque route sous `webapp/src/app/` : vérifie/ajoute `metadata` ou `generateMetadata` avec title, description, Open Graph.

**À faire** :
- Ajoute `metadata` à chaque page (home, auth/login, auth/register, dashboard, dashboard/participate, dashboard/profile, admin, employee, faq, cgu, mentions-legales, politique-confidentialite, gestion-cookies)
- Crée `webapp/src/app/sitemap.ts` (conventions Next.js 14)
- Crée `webapp/src/app/robots.ts` (conventions Next.js 14)
- Ajoute JSON-LD (Organization / WebSite) sur la home

**Commit** : `feat: add comprehensive SEO metadata and structured data`

### F. Sécurité de base

- Vérifie presence de helmet
- Config CORS restrictive
- Rate-limiting (@nestjs/throttler) sur routes sensibles (auth, participations)

**À faire** :
- Édite `api/src/main.ts` (complète ce qui manque)
- Vérifie aucun secret en dur (tout via .env)
- Teste que les routes sensibles ont un rate-limit

**Commit** : `feat: add helmet, CORS, and rate-limiting for security hardening`

### G. Bannière cookies RGPD

La page `/gestion-cookies` existe. Vérifie si une bannière apparaît au premier chargement.

**À faire** :
- Cherche un composant `CookieBanner` ou `ConsentBanner`
- Si absent : implémente-le simple (conforme RGPD, renvoi vers `/gestion-cookies`)
- Affiche au premier chargement

**Commit** : `feat: implement GDPR cookie consent banner on first visit`

### H. (Si temps) QA responsive

Vérifie rendu de `/`, `/auth/login`, `/dashboard/participate` aux breakpoints sm/md/lg/xl et corrige les régressions.

**Commit** : `test: verify responsive design across mobile/tablet/desktop breakpoints`

### Critères de succès Mission 3

- ESLint clean
- Tests Mission 1 toujours verts
- 0 classes gray-*/blue-*/pink-*/purple-*/tea-*/amber-*/emerald-* restantes dans admin/dashboard/employee
- sitemap.xml et robots.txt accessibles
- Lighthouse audit sur /, /auth/login, /dashboard/participate (cible A11y ≥90, SEO ≥90)

---

## Mission 4 — Refonte visuelle vs Figma (optionnel, 20-22 juin)

À n'utiliser que si :
- MCP Figma est connecté dans la session Fable
- Tu as accès aux maquettes

Couvre :
- **Issue 10** : refonte `/auth/login` et `/auth/register` vs Figma
- **Issue 13** : refonte section "Comment participer" vs Figma
- **Issue 21 (complet)** : audit navbar vs Figma + cohérence connecté/déconnecté

Prompt détaillé à rédiger une fois que tu confirmes la disponibilité de cette fenêtre + du MCP Figma.

---

## Mis de côté (comme convenu)

- **Issue #7 (/participate)** : on rediscute pour trouver la meilleure approche (auth obligatoire vs flux invité)
- **Issue #14 (CDN images)** : hors périmètre, images locales conservées
- **Issue #25/98 (Brevo)** : nécessite compte/API key Brevo
- **Issue #105 (tests utilisateurs)** : nécessite vrais participants

---

## Checklist avant de lancer Fable 5 vendredi

- [ ] Lire ce plan en entier
- [ ] Mettre à jour le .env avec les vraies credentials Meta pour FB OAuth
- [ ] Vérifier que `npm run test:cov` s'exécute sans erreur en local (note la couverture baseline)
- [ ] Vérifier que `npm test` fonctionne côté webapp (même vide)
- [ ] Préparer un prompt clair pour Fable 5 basé sur la Mission 1 ci-dessus
- [ ] Si possible, noter les fichiers de test existants (auth.service.spec.ts, participations.service.spec.ts) comme références de style

---

**Bon courage vendredi ! 🚀**
