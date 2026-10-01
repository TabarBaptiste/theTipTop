# 🍵 Thé Tip Top - Jeu-Concours

> Application web complète pour le jeu-concours de Thé Tip Top, développée par Furious Ducks Agency.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## 📋 Vue d'Ensemble

Application web complète pour le jeu-concours de Thé Tip Top, organisé à l'occasion de l'ouverture de leur 10ème boutique à Nice.

### Informations Client

| Information | Valeur |
|-------------|--------|
| **Client** | Thé Tip Top |
| **Gérant** | Mr Eric Bourdon |
| **Siège social** | 18 rue Léon Frot, 75011 Paris |
| **Statut juridique** | SA au capital de 150 000€ |

## 🎯 Concept du Jeu-Concours

- **Durée** : 30 jours de jeu + 30 jours pour récupérer les lots
- **Tickets maximum** : 500 000
- **Condition** : Achat ≥ 49€
- **100% gagnant** avec répartition des lots :
  - 60% : Infuseur à thé (15€)
  - 20% : Boite 100g thé détox/infusion (20€)
  - 10% : Boite 100g thé signature (25€)
  - 6% : Coffret découverte (39€)
  - 4% : Coffret découverte premium (69€)
- **Grand Prix** : 1 an de thé (360€) - tirage au sort final

## 📁 Structure du Projet

```
theTipTop/
├── 📄 README.md                       # Ce fichier
├── 📄 Jenkinsfile                     # Pipeline CI/CD
├── 📄 docker-compose.yml              # Dev environment
├── 📄 docker-compose.prod.yml         # Production environment
│
├── 📂 docs/                           # Documentation technique
│   ├── 📄 00-ONBOARDING.md
│   ├── 📄 01-SPECIFICATIONS-TECHNIQUES.md
│   ├── 📄 01-ecarts-vps-cst.md
│   ├── 📄 02-ARCHITECTURE.md
│   ├── 📄 03-GUIDE-DEPLOIEMENT.md
│   ├── 📄 04-RGPD-ACCESSIBILITE.md
│   ├── 📄 05-PROTOCOLES-DE-TESTS.md
│   ├── 📄 06-TESTS-UTILISATEURS.md
│   ├── 📄 07-AUDIT-DU-SITE.md
│   └── 📂 context/                    # Cahiers des charges et contexte
│
├── 📂 api/                            # Backend NestJS
│   ├── 📄 package.json
│   ├── 📄 Dockerfile
│   ├── 📂 prisma/                     # Schéma DB & migrations
│   └── 📂 src/
│       ├── 📂 modules/
│       │   ├── auth/                  # Authentification JWT + OAuth2
│       │   ├── users/                 # Gestion utilisateurs
│       │   ├── tickets/               # 500k codes pré-générés
│       │   ├── participations/        # Validation codes
│       │   ├── gains/                 # Remise des lots
│       │   ├── stats/                 # Dashboard admin
│       │   ├── grand-prize/           # Tirage au sort
│       │   └── audit/                 # Logs RGPD
│       └── 📂 prisma/
│
└── 📂 webapp/                         # Frontend Next.js
    ├── 📄 package.json
    ├── 📄 Dockerfile
    ├── 📂 cypress/                    # Tests E2E
    └── 📂 src/
        ├── 📂 app/                    # Pages (App Router)
        │   ├── auth/                  # Login / Register
        │   ├── dashboard/             # Espace client
        │   ├── employee/              # Espace employé
        │   └── admin/                 # Dashboard admin
        ├── 📂 components/
        └── 📂 lib/
```

## 🛠️ Technologies

### Backend (API)
- **Framework** : NestJS 11 avec TypeScript 5
- **ORM** : Prisma 5 avec PostgreSQL 16
- **Auth** : Passport.js (JWT + OAuth2 Google/Facebook)
- **Cache** : Redis (ioredis)
- **Documentation** : Swagger/OpenAPI
- **Tests** : Jest

### Frontend (WebApp)
- **Framework** : Next.js 16 (App Router) avec React 18 et TypeScript 5
- **Styling** : Tailwind CSS 3 + Shadcn/ui
- **State** : Zustand + React Query
- **Forms** : React Hook Form + Zod
- **Tests** : Jest + Cypress E2E

### Infrastructure
- **Containerisation** : Docker + Docker Compose
- **Reverse Proxy** : Traefik avec SSL Let's Encrypt
- **CI/CD** : Jenkins (workflow Furious Ducks)
- **Monitoring** : Prometheus + Grafana

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 22+
- Docker & Docker Compose
- Git

### Installation avec Docker (recommandé)

```bash
# Cloner le projet
git clone https://github.com/TabarBaptiste/theTipTop.git
cd theTipTop

# Copier les fichiers d'environnement
cp api/.env.example api/.env
cp webapp/.env.example webapp/.env

# Démarrer tous les services
docker compose up -d

# Exécuter les migrations et générer les 500k codes
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

### Installation en développement local

```bash
# Backend API
cd api
npm install
cp .env.example .env
# Éditer .env avec vos configurations
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# Frontend (nouveau terminal)
cd ../webapp
npm install
cp .env.example .env
npm run dev
```

### Accès aux Services

| Service | URL (Dev) | URL (Prod) |
|---------|-----------|------------|
| WebApp | http://localhost:3000 | https://dsp5-archi-o24a-4-5-g1.fr |
| API | http://localhost:3001 | https://thetiptop-api.wk-archi-o24a-4-5-g1.fr |
| API Docs | http://localhost:3001/api/docs | https://thetiptop-api.wk-archi-o24a-4-5-g1.fr/api/docs |
| Adminer | http://localhost:8080 | - |

## 🔐 Comptes de test

Après le seed de la base de données :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@thetiptop.fr | Test1234! |
| Employé | employe@thetiptop.fr | Test1234! |
| Client | client@test.fr | Test1234! |

## 📝 Scripts disponibles

### API
```bash
npm run start:dev     # Démarrage en mode dev avec hot reload
npm run build         # Build de production
npm run test          # Tests unitaires
npm run test:cov      # Tests avec couverture
npm run lint          # Vérification ESLint
```

### WebApp
```bash
npm run dev           # Démarrage en mode dev
npm run build         # Build de production
npm run test          # Tests unitaires
npm run test:e2e      # Tests Cypress E2E
npm run lint          # Vérification ESLint
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Onboarding](docs/00-ONBOARDING.md) | Installation et configuration d'un nouveau poste |
| [Spécifications Techniques](docs/01-SPECIFICATIONS-TECHNIQUES.md) | Choix techniques et justifications |
| [Écarts VPS / CST](docs/01-ecarts-vps-cst.md) | Journal des divergences entre le VPS et le CST |
| [Architecture](docs/02-ARCHITECTURE.md) | Diagrammes et flux de données |
| [Guide de Déploiement](docs/03-GUIDE-DEPLOIEMENT.md) | Instructions de mise en production |
| [RGPD & Accessibilité](docs/04-RGPD-ACCESSIBILITE.md) | Conformité légale et WCAG 2.1 |
| [Protocoles de Tests](docs/05-PROTOCOLES-DE-TESTS.md) | Tests de charge, de régression et de sécurité |
| [Tests Utilisateurs](docs/06-TESTS-UTILISATEURS.md) | Protocole de tests utilisateurs |
| [Audit du Site](docs/07-AUDIT-DU-SITE.md) | Performance, SEO, accessibilité et sécurité |

## 🌿 Démarche RSE

Ce projet intègre une démarche RSE :
- **Éco-conception** : Optimisation des ressources, lazy loading
- **Green Hosting** : Hébergeur éco-responsable recommandé
- **Accessibilité** : WCAG 2.1 AA
- **Performance** : Score Lighthouse > 90

## 👥 Auteurs

- **Baptiste Tabar Labonne** — [@TabarBaptiste](https://github.com/TabarBaptiste)
- **Harena Andriamananjara Mandimby** — [@AndriamHarena](https://github.com/AndriamHarena)
- **Ibrahima Elhadj Bah** — [@Ibrahima17](https://github.com/Ibrahima17)

## 📄 Licence

Distribué sous licence MIT. Voir [LICENSE](LICENSE).
