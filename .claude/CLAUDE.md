# CLAUDE.md

Directives comportementales pour réduire les erreurs courantes des LLM en développement. À fusionner avec les instructions spécifiques au projet selon les besoins.

**Compromis :** Ces directives penchent vers la prudence plutôt que la vitesse. Pour les tâches triviales, utilisez votre jugement.

## 1. Réfléchir avant de coder

**Ne pas supposer. Ne pas cacher la confusion. Mettre en évidence les compromis.**

Avant d'implémenter :

- Énoncez vos hypothèses explicitement. Si incertain, posez la question.
- S'il existe plusieurs interprétations, présentez-les — ne choisissez pas en silence.
- S'il existe une approche plus simple, dites-le. Contestez quand il y a lieu.
- Si quelque chose n'est pas clair, arrêtez-vous. Nommez ce qui est confus. Posez la question.

## 2. Simplicité d'abord

**Code minimal qui résout le problème. Rien de spéculatif.**

- Pas de fonctionnalités au-delà de ce qui a été demandé.
- Pas d'abstractions pour du code à usage unique.
- Pas de « flexibilité » ou « configurabilité » qui n'auraient pas été demandées.
- Pas de gestion d'erreurs pour des scénarios impossibles.
- Si vous écrivez 200 lignes et ça pourrait en être 50, réécrivez-le.

Demandez-vous : « Un ingénieur senior dirait-il que c'est surcompliqué ? » Si oui, simplifiez.

## 3. Modifications chirurgicales

**Ne touchez que ce que vous devez. Nettoyez seulement votre propre désordre.**

Lors de la modification du code existant :

- Ne « améliorez » pas le code adjacent, les commentaires ou la mise en forme.
- Ne refactorisez pas les choses qui ne sont pas cassées.
- Correspondez au style existant, même si vous le feriez autrement.
- Si vous remarquez du code mort non lié, mentionnez-le — ne le supprimez pas.

Quand vos modifications créent des orphelins :

- Supprimez les imports/variables/fonctions que VOS modifications ont rendus inutilisés.
- Ne supprimez pas le code mort préexistant sauf si demandé.

Le test : Chaque ligne modifiée doit remonter directement à la demande de l'utilisateur.

## 4. Exécution axée sur les objectifs

**Définissez les critères de succès. Bouclez jusqu'à vérification.**

Transformez les tâches en objectifs vérifiables :

- « Ajouter une validation » → « Écrire des tests pour les entrées invalides, puis les faire passer »
- « Corriger le bug » → « Écrire un test qui le reproduit, puis le faire passer »
- « Refactoriser X » → « S'assurer que les tests passent avant et après »

Pour les tâches multi-étapes, énoncez un bref plan :

```
1. [Étape] → vérifier : [contrôle]
2. [Étape] → vérifier : [contrôle]
3. [Étape] → vérifier : [contrôle]
```

Des critères de succès forts vous permettent de boucler indépendamment. Des critères faibles (« faire fonctionner ») nécessitent une clarification constante.

---

## 5. Contexte du projet — Thé Tip Top

### Stack

- **Backend** : NestJS 11, TypeScript strict, Passport.js (JWT + OAuth2)
- **Frontend** : Next.js 16 App Router, TailwindCSS, Shadcn/ui, Zustand, React Query, React Hook Form + Zod
- **ORM** : Prisma — ne jamais suggérer TypeORM ou Sequelize
- **Base de données** : PostgreSQL 16 — ne jamais suggérer MongoDB, MySQL ou toute autre
- **Cache / Sessions / Queue** : Redis (ioredis)
- **Runtime** : Node.js 22

### Architecture monorepo

```
thetiptop_v0/
├── api/       → NestJS (src/, prisma/, Dockerfile, jest.config.js)
└── webapp/    → Next.js (src/, Dockerfile)
```

Ne créez jamais de fichiers à la racine du monorepo. Les Dockerfiles se situent dans `api/` et `webapp/`, pas à la racine.

### Conventions critiques

- **HTTP 403** sur toutes les routes protégées — jamais 401. Convention du projet non négociable.
- **Swagger requis** sur chaque endpoint de l'API.
- **Pas de secrets en dur** — toujours via des variables d'environnement.
- **Commits conventionnels** appliqués : `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `ci`

### Ports locaux

| Service    | Port |
|------------|------|
| WebApp     | 3000 |
| API        | 3001 |
| PostgreSQL | 5432 |
| Redis      | 6379 |
| Adminer    | 8080 |

### CI/CD — règles qui font échouer le pipeline

- Erreurs ESLint (bloquant)
- Tests Jest échouant
- Couverture de code **< 70 %** (seuil Jenkins dur)
- Vulnérabilités critiques Trivy sur les images Docker

Ne jamais écrire du code qui ferait descendre la couverture en dessous de 70 %.

### Flux de travail Claude Code

Toujours suivre : **audit → validation → implémentation**.  
Ne jamais procéder à l'implémentation sans approbation explicite.

---

**Ces directives fonctionnent si :** moins de modifications inutiles dans les diffs, moins de réécritures dues à une surcomplexité, et les questions de clarification interviennent avant l'implémentation plutôt qu'après les erreurs.
