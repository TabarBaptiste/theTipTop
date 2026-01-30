# Spécifications Techniques - Thé Tip Top

## 1. Introduction

Ce document présente les spécifications techniques et les choix technologiques pour le développement du site du jeu-concours Thé Tip Top.

---

## 2. Analyse des Besoins Techniques

### 2.1 Besoins Fonctionnels

| Fonctionnalité | Criticité | Complexité |
|----------------|-----------|------------|
| Génération 500 000 codes | Haute | Moyenne |
| Authentification OAuth2 + classique | Haute | Moyenne |
| Vérification et attribution des gains | Haute | Haute |
| Interface multi-rôles (client/employé/admin) | Haute | Haute |
| Statistiques temps réel | Moyenne | Moyenne |
| API pour caisses/site e-commerce | Haute | Moyenne |
| Tirage au sort grand prix | Haute | Basse |
| Conformité RGPD | Haute | Moyenne |

### 2.2 Besoins Non-Fonctionnels

| Exigence | Objectif |
|----------|----------|
| Performance | Temps de réponse < 200ms |
| Disponibilité | 99.9% uptime |
| Scalabilité | Support pic 10 000 req/min |
| Sécurité | OWASP Top 10 |
| Accessibilité | WCAG 2.1 niveau AA |
| SEO | Score Lighthouse > 90 |

---

## 3. Architecture Technique

### 3.1 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                            INTERNET                                  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      TRAEFIK            │
                    │   (Reverse Proxy/SSL)   │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
│    WEBAPP       │    │      API        │    │    pgAdmin      │
│   (Next.js)     │    │   (NestJS)      │    │   (Dev only)    │
│   Port: 3000    │    │   Port: 4000    │    │   Port: 5050    │
└────────┬────────┘    └────────┬────────┘    └─────────────────┘
         │                      │
         │             ┌────────▼────────┐
         │             │   PostgreSQL    │
         └─────────────►   Port: 5432    │
                       └────────┬────────┘
                                │
                       ┌────────▼────────┐
                       │     Redis       │
                       │  (Cache/Session)│
                       │   Port: 6379    │
                       └─────────────────┘
```

### 3.2 Flux de Données

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Caisses      │     │    Site Web     │     │   App Mobile    │
│   Magasins      │     │   Jeu-Concours  │     │   (Futur)       │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │          API            │
                    │   /api/v1/tickets       │
                    │   /api/v1/users         │
                    │   /api/v1/gains         │
                    │   /api/v1/stats         │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │       PostgreSQL        │
                    │   - users               │
                    │   - tickets (500k)      │
                    │   - participations      │
                    │   - gains               │
                    └─────────────────────────┘
```

---

## 4. Choix Technologiques

### 4.1 Backend - NestJS

#### Justification

| Critère | NestJS | Express | Fastify |
|---------|--------|---------|---------|
| Structure | ✅ Modulaire | ❌ Libre | ❌ Libre |
| TypeScript | ✅ Natif | ⚠️ Optionnel | ⚠️ Optionnel |
| Documentation | ✅ Swagger intégré | ❌ Manuel | ❌ Manuel |
| Validation | ✅ class-validator | ❌ Manuel | ❌ Manuel |
| Tests | ✅ Jest intégré | ❌ Configuration | ❌ Configuration |
| Écosystème | ✅ Très riche | ✅ Très riche | ⚠️ Moyen |
| Performance | ✅ Excellent | ✅ Excellent | ✅ Excellent |
| Courbe apprentissage | ⚠️ Moyenne | ✅ Facile | ✅ Facile |

**Choix : NestJS** pour sa structure modulaire inspirée d'Angular, idéale pour une API robuste avec plusieurs modules (auth, tickets, users, gains, stats).

#### Dépendances Principales

```json
{
  "@nestjs/core": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/swagger": "^7.0.0",
  "@prisma/client": "^5.0.0",
  "passport-google-oauth20": "^2.0.0",
  "passport-facebook": "^3.0.0",
  "class-validator": "^0.14.0",
  "bcrypt": "^5.1.0"
}
```

### 4.2 Frontend - Next.js 14

#### Justification

| Critère | Next.js | React SPA | Vue/Nuxt |
|---------|---------|-----------|----------|
| SEO | ✅ SSR/SSG natif | ❌ Client-side | ✅ SSR/SSG |
| Performance | ✅ Optimisé | ⚠️ Variable | ✅ Bon |
| App Router | ✅ Server Components | ❌ N/A | ❌ N/A |
| Image Optimization | ✅ Natif | ❌ Manuel | ⚠️ Plugin |
| Routing | ✅ File-based | ❌ React Router | ✅ File-based |
| Écosystème | ✅ Très riche | ✅ Très riche | ⚠️ Moyen |

**Choix : Next.js 14 avec App Router** pour :
- SEO optimal (SSR/SSG)
- Performance via Server Components
- Optimisation images automatique
- Excellent écosystème React

#### Dépendances Principales

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-*": "^1.0.0",
  "zustand": "^4.4.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "next-auth": "^4.24.0"
}
```

### 4.3 Base de Données - PostgreSQL

#### Justification

| Critère | PostgreSQL | MySQL | MongoDB |
|---------|------------|-------|---------|
| Transactions ACID | ✅ Complet | ✅ Complet | ⚠️ Limité |
| JSON Support | ✅ JSONB natif | ⚠️ Basique | ✅ Natif |
| Performance | ✅ Excellent | ✅ Excellent | ✅ Excellent |
| Scalabilité | ✅ Réplication | ✅ Réplication | ✅ Sharding |
| Index | ✅ Avancés (GIN, GiST) | ⚠️ Basiques | ⚠️ Basiques |
| Open Source | ✅ 100% libre | ⚠️ Oracle | ⚠️ SSPL |

**Choix : PostgreSQL 16** pour :
- Intégrité des données garantie (500 000 codes uniques)
- Index performants pour recherche de codes
- JSONB pour flexibilité des métadonnées
- 100% open source

### 4.4 ORM - Prisma

#### Justification

| Critère | Prisma | TypeORM | Sequelize |
|---------|--------|---------|-----------|
| Type Safety | ✅ Génération automatique | ⚠️ Décorateurs | ❌ Limité |
| Migrations | ✅ Automatiques | ⚠️ Manuelles | ⚠️ Manuelles |
| Performance | ✅ Optimisé | ✅ Bon | ⚠️ Variable |
| DX | ✅ Excellent | ⚠️ Moyen | ⚠️ Moyen |
| Schema | ✅ Déclaratif | ⚠️ Code-first | ⚠️ Code-first |

**Choix : Prisma** pour sa génération de types TypeScript automatique et ses migrations intuitives.

### 4.5 Cache - Redis

**Utilisation :**
- Cache des statistiques (invalidation toutes les 5 minutes)
- Sessions utilisateurs
- Rate limiting API
- File d'attente pour génération de codes (si nécessaire)

---

## 5. Modèle de Données

### 5.1 Schéma Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Utilisateurs
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String?   // Null si OAuth
  firstName     String
  lastName      String
  birthDate     DateTime?
  gender        Gender?
  phone         String?
  
  // OAuth
  googleId      String?   @unique
  facebookId    String?   @unique
  
  // Rôle
  role          Role      @default(CLIENT)
  
  // RGPD
  consentEmail  Boolean   @default(false)
  consentData   Boolean   @default(false)
  
  // Relations
  participations Participation[]
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? // Soft delete RGPD

  @@index([email])
  @@index([googleId])
  @@index([facebookId])
}

enum Role {
  CLIENT
  EMPLOYEE
  ADMIN
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

// Tickets avec codes pré-générés
model Ticket {
  id            String    @id @default(uuid())
  code          String    @unique @db.VarChar(10)
  
  // Gain associé (pré-attribué)
  prizeType     PrizeType
  
  // Statut
  isUsed        Boolean   @default(false)
  isDistributed Boolean   @default(false) // Donné en magasin
  
  // Relation
  participation Participation?
  
  // Timestamps
  createdAt     DateTime  @default(now())
  usedAt        DateTime?

  @@index([code])
  @@index([isUsed])
  @@index([isDistributed])
}

enum PrizeType {
  INFUSER           // 60% - Infuseur à thé
  TEA_DETOX         // 20% - Boite 100g thé détox/infusion
  TEA_SIGNATURE     // 10% - Boite 100g thé signature
  GIFT_BOX_39       // 6%  - Coffret découverte 39€
  GIFT_BOX_69       // 4%  - Coffret découverte 69€
}

// Participations (lien User <-> Ticket)
model Participation {
  id            String    @id @default(uuid())
  
  // Relations
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  ticketId      String    @unique
  ticket        Ticket    @relation(fields: [ticketId], references: [id])
  
  // Remise du lot
  prizeDelivered     Boolean   @default(false)
  prizeDeliveredAt   DateTime?
  prizeDeliveredBy   String?   // Employee ID
  deliveryMethod     DeliveryMethod?
  
  // Timestamps
  createdAt     DateTime  @default(now())

  @@index([userId])
  @@index([prizeDelivered])
}

enum DeliveryMethod {
  IN_STORE
  ONLINE
}

// Configuration du jeu-concours
model GameConfig {
  id            String    @id @default(uuid())
  
  // Dates
  startDate     DateTime
  endDate       DateTime  // Fin distribution tickets
  claimEndDate  DateTime  // Fin réclamation lots (+30j)
  
  // Limites
  maxTickets    Int       @default(500000)
  
  // Grand Prix
  grandPrizeDrawn     Boolean   @default(false)
  grandPrizeWinnerId  String?
  grandPrizeDrawnAt   DateTime?
  
  // Status
  isActive      Boolean   @default(true)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Logs d'audit (RGPD)
model AuditLog {
  id            String    @id @default(uuid())
  userId        String?
  action        String
  entity        String
  entityId      String?
  oldValue      Json?
  newValue      Json?
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime  @default(now())

  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
}
```

### 5.2 Distribution des Gains

La génération des 500 000 codes avec répartition des gains doit être faite au démarrage :

| Type de Gain | Pourcentage | Nombre |
|--------------|-------------|--------|
| INFUSER | 60% | 300 000 |
| TEA_DETOX | 20% | 100 000 |
| TEA_SIGNATURE | 10% | 50 000 |
| GIFT_BOX_39 | 6% | 30 000 |
| GIFT_BOX_69 | 4% | 20 000 |
| **Total** | **100%** | **500 000** |

---

## 6. Sécurité

### 6.1 Authentification

```
┌─────────────────────────────────────────────────────────────────┐
│                    STRATÉGIES D'AUTH                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Local      │  │   Google     │  │   Facebook   │          │
│  │   (Email/    │  │   OAuth2     │  │   OAuth2     │          │
│  │   Password)  │  │              │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           │                                     │
│                  ┌────────▼────────┐                            │
│                  │   JWT Token     │                            │
│                  │  (Access +      │                            │
│                  │   Refresh)      │                            │
│                  └────────┬────────┘                            │
│                           │                                     │
│                  ┌────────▼────────┐                            │
│                  │   Guards        │                            │
│                  │  (Role-based)   │                            │
│                  └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Mesures de Sécurité

| Mesure | Implémentation |
|--------|----------------|
| Hachage mots de passe | bcrypt (cost factor 12) |
| Tokens JWT | Access (15min) + Refresh (7j) |
| Rate Limiting | 100 req/min par IP |
| CORS | Origines autorisées uniquement |
| Helmet | Headers sécurisés |
| Validation | class-validator + Zod |
| SQL Injection | Prisma (requêtes préparées) |
| XSS | Sanitization + CSP |
| CSRF | Token CSRF sur mutations |

### 6.3 Génération de Codes Sécurisée

Les codes de 10 caractères doivent être :
- **Uniques** : Vérification en base
- **Non prédictibles** : Crypto random
- **Non offensants** : Filtrage mots interdits

```typescript
// Alphabet sécurisé (sans caractères ambigus)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1

function generateCode(): string {
  const crypto = require('crypto');
  let code = '';
  for (let i = 0; i < 10; i++) {
    const randomIndex = crypto.randomInt(0, ALPHABET.length);
    code += ALPHABET[randomIndex];
  }
  return code;
}
```

---

## 7. Performance

### 7.1 Optimisations Backend

| Technique | Application |
|-----------|-------------|
| Index DB | Sur code, email, userId |
| Cache Redis | Statistiques, sessions |
| Pagination | Listes (20 items/page) |
| Compression | gzip sur réponses |
| Connection Pooling | Prisma (pool_size=10) |

### 7.2 Optimisations Frontend

| Technique | Application |
|-----------|-------------|
| Server Components | Pages statiques |
| Image Optimization | next/image |
| Code Splitting | Dynamic imports |
| Lazy Loading | Composants lourds |
| Caching | ISR pour pages statiques |

### 7.3 Objectifs de Performance

| Métrique | Objectif |
|----------|----------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTFB (Time to First Byte) | < 200ms |
| Score Lighthouse | > 90 |

---

## 8. Tests

### 8.1 Stratégie de Tests

```
┌─────────────────────────────────────────────────────────────────┐
│                    PYRAMIDE DES TESTS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                        ┌───────┐                                 │
│                       /   E2E   \        10%                     │
│                      /  (Cypress) \                              │
│                     ┌─────────────┐                              │
│                    /  Intégration  \     20%                     │
│                   /   (Supertest)   \                            │
│                  ┌───────────────────┐                           │
│                 /    Tests Unitaires  \  70%                     │
│                /        (Jest)         \                         │
│               └─────────────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Couverture Cible

| Type | Couverture |
|------|------------|
| Unitaires | > 80% |
| Intégration | > 60% |
| E2E | Parcours critiques |

### 8.3 Scénarios E2E Critiques

1. Inscription client (classique + OAuth)
2. Connexion / Déconnexion
3. Participation avec un code valide
4. Participation avec un code invalide/déjà utilisé
5. Visualisation historique des gains
6. Remise d'un lot par un employé
7. Consultation statistiques admin

---

## 9. Démarche RSE

### 9.1 Éco-conception

| Action | Impact |
|--------|--------|
| Lazy loading images | Réduction bande passante |
| Compression assets | Réduction taille transferts |
| Cache agressif | Réduction requêtes serveur |
| Dark mode | Réduction consommation écrans OLED |
| Pagination | Réduction données transférées |

### 9.2 Green Hosting

Recommandations d'hébergeurs éco-responsables :
- **Infomaniak** (Suisse) - 100% énergie renouvelable
- **OVH** (France) - Datacenter refroidi à l'eau
- **Scaleway** (France) - Datacenter adiabatique

### 9.3 Mesure d'Impact

| Outil | Usage |
|-------|-------|
| Website Carbon | Mesure empreinte carbone |
| Lighthouse | Score performance/accessibilité |
| EcoIndex | Score éco-conception |

---

## 10. Planning Technique

### Phase 1 : Setup (Semaine 1)
- [ ] Initialisation projets (API + WebApp)
- [ ] Configuration Docker
- [ ] Setup CI/CD
- [ ] Modèle de données Prisma

### Phase 2 : Backend Core (Semaines 2-3)
- [ ] Module Auth (local + OAuth)
- [ ] Module Tickets (génération 500k codes)
- [ ] Module Participations
- [ ] Module Users
- [ ] Tests unitaires

### Phase 3 : Frontend Core (Semaines 3-4)
- [ ] Pages publiques (accueil, règlement)
- [ ] Authentification (inscription, connexion)
- [ ] Dashboard client
- [ ] Interface participation

### Phase 4 : Fonctionnalités Avancées (Semaines 4-5)
- [ ] Dashboard employé
- [ ] Dashboard admin + statistiques
- [ ] Tirage au sort grand prix
- [ ] Tests E2E

### Phase 5 : Finalisation (Semaine 6)
- [ ] Optimisation performance
- [ ] Audit accessibilité
- [ ] Documentation
- [ ] Déploiement production
