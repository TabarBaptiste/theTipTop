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
├── 📄 thetiptop.md                    # Cahier des charges original
├── 📄 Jenkinsfile                     # Pipeline CI/CD
├── 📄 docker-compose.yml              # Dev environment
├── 📄 docker-compose.prod.yml         # Production environment
│
├── 📂 docs/                           # Documentation technique
│   ├── 📄 01-SPECIFICATIONS-TECHNIQUES.md
│   ├── 📄 02-ARCHITECTURE.md
│   ├── 📄 03-GUIDE-DEPLOIEMENT.md
│   └── 📄 04-RGPD-ACCESSIBILITE.md
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
- **Framework** : NestJS 10 avec TypeScript
- **ORM** : Prisma avec PostgreSQL 16
- **Auth** : Passport.js (JWT + OAuth2 Google/Facebook)
- **Cache** : Redis
- **Documentation** : Swagger/OpenAPI

### Frontend (WebApp)
- **Framework** : Next.js 14 (App Router)
- **Styling** : TailwindCSS + Shadcn/ui
- **State** : Zustand + React Query
- **Forms** : React Hook Form + Zod
- **Tests** : Cypress E2E

### Infrastructure
- **Containerisation** : Docker + Docker Compose
- **Reverse Proxy** : Traefik avec SSL Let's Encrypt
- **CI/CD** : Jenkins (workflow Furious Ducks)
- **Monitoring** : Prometheus + Grafana

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 20+
- Docker & Docker Compose
- Git

### Installation avec Docker (recommandé)

```bash
# Cloner le projet
git clone https://votre-repo/thetiptop.git
cd thetiptop

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
cd webapp
npm install
cp .env.example .env
npm run dev
```

### Accès aux Services

| Service | URL (Dev) | URL (Prod) |
|---------|-----------|------------|
| WebApp | http://localhost:3000 | https://thetiptop.dsp5-archi-o24a-4-5-g1.fr |
| API | http://localhost:3001 | https://api.thetiptop.dsp5-archi-o24a-4-5-g1.fr |
| API Docs | http://localhost:3001/api/docs | https://api.thetiptop.dsp5-archi-o24a-4-5-g1.fr/api/docs |
| Adminer | http://localhost:8080 | - |

## 🔐 Comptes de test

Après le seed de la base de données :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@thetiptop.fr | Admin123! |
| Employé | employee@thetiptop.fr | Employee123! |
| Client | client@thetiptop.fr | Client123! |

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
| [Spécifications Techniques](docs/01-SPECIFICATIONS-TECHNIQUES.md) | Choix techniques et justifications |
| [Architecture](docs/02-ARCHITECTURE.md) | Diagrammes et flux de données |
| [Guide de Déploiement](docs/03-GUIDE-DEPLOIEMENT.md) | Instructions de mise en production |
| [RGPD & Accessibilité](docs/04-RGPD-ACCESSIBILITE.md) | Conformité légale et WCAG 2.1

## ⚡ Technologies

### Backend (API)

- **Framework** : NestJS 10
- **Base de données** : PostgreSQL 16
- **ORM** : Prisma
- **Authentication** : Passport.js (JWT + OAuth2)
- **Documentation** : Swagger/OpenAPI
- **Tests** : Jest

### Frontend (WebApp)

- **Framework** : Next.js 14 (App Router)
- **UI** : TailwindCSS + Shadcn/ui
- **State** : Zustand
- **Formulaires** : React Hook Form + Zod
- **Tests** : Jest + Cypress

### Infrastructure

- **Conteneurisation** : Docker
- **Reverse Proxy** : Traefik
- **CI/CD** : Jenkins (workflow Furious Ducks)
- **Monitoring** : Prometheus + Grafana

## 🌿 Démarche RSE

Ce projet intègre une démarche RSE :
- **Éco-conception** : Optimisation des ressources, lazy loading
- **Green Hosting** : Hébergeur éco-responsable recommandé
- **Accessibilité** : WCAG 2.1 AA
- **Performance** : Score Lighthouse > 90

## 📝 Licence

Projet développé par l'agence **Furious Ducks** pour **Thé Tip Top**.

© 2026 - Tous droits réservés
