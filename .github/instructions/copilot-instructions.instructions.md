---
applyTo: "**"
---

# Instructions AI pour Furious Ducks CI/CD

**Projet** : Furious Ducks  
**Stack** : Docker, GitLab CE, Jenkins, Traefik, SonarQube, Prometheus, Grafana  
**Domaine** : `wk-archi-o24a-4-5-g1.fr`

---

## 1. Stratégie de Branches (GitFlow)

### Branches permanentes

- **`main`** : Production. Protégée. Merge Request obligatoire.
  - Tags sémantiques : `v1.2.3` (créés à la fusion)
  - Déploiement : PROD (approbation manuelle dans Jenkins)

- **`develop`** : Intégration continue. Protégée. Merge Request obligatoire.
  - Déploiement : DEV (100% automatique à chaque push)

### Branches temporaires

- **`feature/<nom>`** : Branche de développement.
  - Source : `develop`
  - Destination : `develop` (via Merge Request)
  - Suppression après merge
  - Exemple : `feature/redis-caching`, `feature/blue-green-deployment`

- **`release/<version>`** : Préparation d'une release.
  - Source : `develop`
  - Destination : `main` (tag sémantique) ET `develop` (synchronisation)
  - Exemple : `release/1.2.0`
  - Durée : 1-2 jours max

- **`hotfix/<version>`** : Correction critique en production.
  - Source : `main`
  - Destination : `main` (tag) ET `develop` (synchronisation)
  - Exemple : `hotfix/1.2.1`
  - Durée : quelques heures

---

## 2. Conventions de Commits (Conventional Commits)

### Format

```
<type>(<scope>): <description>

[body]
[footer]
```

### Types de commit

| Type | Usage | Incrémente |
|------|-------|-----------|
| **feat** | Nouvelle fonctionnalité | MINOR (1.x.0) |
| **fix** | Correction de bug | PATCH (1.0.x) |
| **docs** | Documentation uniquement | Aucun |
| **style** | Formatage, sans changement logique | Aucun |
| **refactor** | Refactoring sans changement fonctionnel | Aucun |
| **test** | Ajout/modification de tests | Aucun |
| **chore** | Maintenance, dépendances, CI/CD | Aucun |
| **perf** | Amélioration de performance | PATCH (1.0.x) |
| **ci** | Modification configuration CI/CD | Aucun |

### Scopes courants

- `api` : NestJS API (Thé Tip Top)
- `frontend` : Application frontend
- `docker` : Dockerfile, docker-compose
- `jenkins` : Jenkinsfile, shared libraries
- `traefik` : Configuration reverse proxy
- `monitoring` : Prometheus, Grafana, Loki
- `security` : Scans Trivy, Gitleaks, SonarQube
- `infra` : Infrastructure, VPS, networking
- `backup` : Restic, MinIO, sauvegarde
- `db` : Base de données, migrations

### Exemples valides

```
feat(api): ajouter endpoint /stats/winners pour Thé Tip Top
fix(docker): corriger volume mount PostgreSQL en PREPROD
refactor(jenkins): simplifier condition when dans shared library
docs(setup): documenter procédure migration OVH VPS
perf(api): implémenter caching Redis sur endpoints /stats
ci(gitlab): exposer SSH sur port 443 pour école
chore(deps): mettre à jour ioredis v9.x
```

### Règle stricte : pas de co-auteur

Ne jamais ajouter de ligne `Co-Authored-By` (ou équivalente) dans un message de commit, y compris lorsque le commit est généré par Claude Code ou Copilot.

### Breaking Changes

Ajoutez `!` avant le `:` ou dans le footer pour signaler un changement cassant :

```
feat(api)!: remplacer authentication JWT par OAuth2

BREAKING CHANGE: migration requise de la configuration auth
```

---

## 3. Versioning Sémantique (Semantic Versioning)

### Format : `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0) : Changement incompatible (breaking change)
- **MINOR** (1.1.0) : Nouvelle fonctionnalité compatible
- **PATCH** (1.0.1) : Correction de bug compatible

### Règles

1. Chaque `feat` (sans `!`) → MINOR
2. Chaque `fix` → PATCH
3. Chaque `feat!` ou `BREAKING CHANGE` → MAJOR
4. Autres types → aucun incrément

### Tags Docker

| Branche | Format tag | Exemple |
|---------|-----------|---------|
| `develop` | `project:develop-<sha7>` | `the-tip-top:develop-a3f5k2j` |
| `main` | `project:main-<sha7>` | `the-tip-top:main-f8e2d9c` |
| Release (tag Git) | `project:v<major>.<minor>.<patch>` | `the-tip-top:v1.2.3` |

---

## 4. Workflow de Merge Request

### Checklist obligatoire

- [ ] Branche source : `feature/*`, `release/*`, ou `hotfix/*`
- [ ] Branche destination : `develop` (feature/hotfix) ou `main` (release/hotfix)
- [ ] Titre suit Conventional Commits : `feat(scope): description`
- [ ] Pipeline CI/CD passat (build ✓, tests ✓, scans ✓)
- [ ] 1 approbation minimum
- [ ] Aucun secret détecté (Gitleaks ✓)
- [ ] SonarQube : qualité gate passée
- [ ] Tests unitaires : 100% passants
- [ ] Scan Trivy : pas de vulnérabilité critique

### Après merge

- [ ] Tag créé automatiquement (si version bump détecté)
- [ ] Image Docker construite et pushée
- [ ] Déploiement automatique en DEV (branche develop)
- [ ] Déploiement en PREPROD sur demande (branche main)

---

## 5. Environnements et Déploiement

### DEV (branche `develop`)

- **Déploiement** : 100% automatique à chaque push
- **URL** : `https://projet-dev.wk-archi-o24a-4-5-g1.fr`
- **Durée** : 5-15 minutes (build + tests + déploiement)
- **Données** : Reset possible, données non persistantes
- **Public** : Non (accès VPN ou direct)

### PREPROD (branche `main`, sans tag)

- **Déploiement** : Automatique, validation métier manuelle
- **URL** : `https://projet-preprod.wk-archi-o24a-4-5-g1.fr`
- **Durée** : 10-20 minutes
- **Données** : Identiques à PROD (repliquées)
- **Public** : Non (accès contrôlé)
- **Validation** : PO/client teste avant approbation PROD

### PROD (branche `main`, avec tag sémantique)

- **Déploiement** : Approbation manuelle dans Jenkins → automatisé
- **URL** : `https://projet.wk-archi-o24a-4-5-g1.fr`
- **Durée** : 10-20 minutes
- **Données** : Données client réelles
- **Public** : Oui (accès utilisateurs finaux)
- **Validation** : Approbation obligatoire (compliance, responsabilité)
- **Rollback** : Automatisé (Blue/Green deployment)

---

## 6. Règles de Code et Qualité

### Linting et Formatting

- **Node.js** : ESLint + Prettier
- **PHP** : PHPStan, PHPCS
- **Python** : Pylint, Black

Tous les commits doivent passer le lint avant merge.

### Tests

- **Couverture minimale** : 70%
- **Exécution** : À chaque push (dev et preprod)
- **Blocage** : Un test échoué = pipeline arrêté

### Scans de Sécurité

- **SonarQube** : Analyse qualité + vulnérabilités
- **Trivy** : Scan images Docker
- **Gitleaks** : Détection de secrets dans le code
- **Semgrep** : Pattern matching malveillants

**Blocage** : Vulnérabilité critique = pipeline arrêté.

---

## 7. Commit Hooks (Git)

### Pre-commit obligatoire

- ✓ Lint (ESLint / Pylint / PHPStan)
- ✓ Format (Prettier / Black)
- ✓ Gitleaks (pas de secrets)

### Commit message validation

Tous les commits doivent suivre Conventional Commits. Rejet automatique sinon.

---

## 8. Commandes Git courantes

### Démarrer une feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/redis-caching
```

### Avant de commiter

```bash
# Vérifier le lint
npm run lint

# Formater le code
npm run format

# Lancer les tests locaux
npm test

# Puis commiter
git add .
git commit -m "feat(api): ajouter caching Redis sur /stats"
```

### Créer une Merge Request

```bash
git push origin feature/redis-caching
# Puis via GitLab : créer MR vers develop
```

### Hotfix urgent (production)

```bash
git checkout main
git pull origin main
git checkout -b hotfix/1.2.1
# Faire les fixes
git commit -m "fix(api): corriger fuite mémoire Session"
git push origin hotfix/1.2.1
# MR vers main ET develop
```

---

## 9. Outils et Ressources

| Outil | Rôle |
|-------|------|
| **GitLab CE** | SCM, webhooks Jenkins |
| **Jenkins** | Orchestration CI/CD |
| **Harbor** | Registry Docker |
| **SonarQube** | Qualité de code |
| **Traefik** | Reverse proxy, routage |
| **Prometheus** | Métriques infrastructure |
| **Grafana** | Dashboards monitoring |

**Accès** :
- GitLab : `https://git.wk-archi-o24a-4-5-g1.fr` (port SSH: 2222)
- Jenkins : `https://ci.wk-archi-o24a-4-5-g1.fr`
- Registry : `https://registry.wk-archi-o24a-4-5-g1.fr`

---

## 10. Questions courantes pour Copilot / Claude Code

### "Génère un commit message pour..."

→ Utiliser le format Conventional Commits  
→ Scope parmi la liste fournie  
→ Description courte, impératif présent

### "Crée une branche pour..."

→ Utiliser `feature/`, `release/`, ou `hotfix/` selon le cas  
→ Noms kebab-case, descriptifs

### "Écris le Jenkinsfile pour..."

→ Utiliser les shared libraries Groovy  
→ Stages : Checkout, Lint, Build, Test, Scan, Docker, Deploy  
→ Conditions `when` claires (branche, tag)

### "Aide-moi à debugger un pipeline échoué..."

→ Vérifier les logs Jenkins  
→ Vérifier les scans SonarQube / Trivy  
→ Vérifier les tests unitaires

---

## 11. Récapitulatif des règles clés

✅ **DO**
- Commits courts et explicites
- Merge Requests sur les branches temporaires
- 1 approbation minimum avant merge
- Pipeline vert avant production
- Versions sémantiques pour chaque release
- Tags Git pour les releases
- Blue/Green en production

❌ **DON'T**
- Push direct sur `main` ou `develop`
- Commits vagues ou sans contexte
- Commiter des secrets ou credentials
- Merger avec un pipeline rouge
- Sauter les étapes de validation
- Tags à la main sans versioning

---

**Dernière mise à jour** : 2026-06-24  
**Équipe** : Furious Ducks (Baptiste, Harena, Ibrahima)