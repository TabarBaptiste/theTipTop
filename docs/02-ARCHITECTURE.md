# Architecture Technique - Thé Tip Top

## 1. Vue d'Ensemble de l'Architecture

### 1.1 Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRODUCTION                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         INTERNET                                     │    │
│  └────────────────────────────────┬────────────────────────────────────┘    │
│                                   │                                          │
│                      ┌────────────▼────────────┐                            │
│                      │     CLOUDFLARE          │                            │
│                      │    (CDN + WAF + DDoS)   │                            │
│                      └────────────┬────────────┘                            │
│                                   │                                          │
│  ┌────────────────────────────────┼────────────────────────────────────┐    │
│  │                     VPS PRODUCTION                                   │    │
│  │                                │                                     │    │
│  │               ┌────────────────▼────────────────┐                   │    │
│  │               │           TRAEFIK               │                   │    │
│  │               │    (Reverse Proxy + SSL)        │                   │    │
│  │               └────────────────┬────────────────┘                   │    │
│  │                                │                                     │    │
│  │      ┌─────────────────────────┼─────────────────────────┐          │    │
│  │      │                         │                         │          │    │
│  │  ┌───▼───────────┐   ┌────────▼────────┐   ┌────────────▼────┐    │    │
│  │  │    WEBAPP     │   │      API        │   │     WEBAPP      │    │    │
│  │  │   (Next.js)   │   │   (NestJS)      │   │    (Replica)    │    │    │
│  │  │   Instance 1  │   │   Instance 1    │   │    Instance 2   │    │    │
│  │  └───────────────┘   └────────┬────────┘   └─────────────────┘    │    │
│  │                               │                                    │    │
│  │                    ┌──────────┴──────────┐                        │    │
│  │                    │                     │                        │    │
│  │           ┌────────▼────────┐  ┌────────▼────────┐               │    │
│  │           │   PostgreSQL   │  │     Redis       │               │    │
│  │           │   (Primary)    │  │    (Cache)      │               │    │
│  │           └────────────────┘  └─────────────────┘               │    │
│  │                                                                   │    │
│  └───────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture Multi-Environnement

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENVIRONNEMENTS                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐       │
│  │   DÉVELOPPEMENT   │  │    PRÉ-PRODUCTION │  │    PRODUCTION     │       │
│  ├───────────────────┤  ├───────────────────┤  ├───────────────────┤       │
│  │ • localhost       │  │ • preprod.        │  │ • jeu.thetiptop.fr│       │
│  │ • Docker Compose  │  │   thetiptop.fr    │  │ • api.jeu.        │       │
│  │ • Hot Reload      │  │ • Données test    │  │   thetiptop.fr    │       │
│  │ • Debug activé    │  │ • SSL Let's       │  │ • SSL Let's       │       │
│  │ • DB locale       │  │   Encrypt         │  │   Encrypt         │       │
│  │                   │  │ • 100 codes test  │  │ • 500k codes      │       │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘       │
│           │                      │                      │                   │
│           ▼                      ▼                      ▼                   │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │                        GITLAB CI/CD                                │     │
│  │  develop ──────► preprod ──────► main (prod)                      │     │
│  │     │               │               │                              │     │
│  │     ▼               ▼               ▼                              │     │
│  │   Auto            Auto           Manuel                           │     │
│  │   Deploy          Deploy         (Approval)                       │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture API (Backend)

### 2.1 Structure Modulaire NestJS

```
api/
├── src/
│   ├── main.ts                    # Point d'entrée
│   ├── app.module.ts              # Module racine
│   │
│   ├── common/                    # Code partagé
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   │
│   ├── config/                    # Configuration
│   │   ├── config.module.ts
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   │
│   ├── prisma/                    # ORM Prisma
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── schema.prisma
│   │
│   ├── auth/                      # Authentification
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── local.strategy.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── google.strategy.ts
│   │   │   └── facebook.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── dto/
│   │
│   ├── users/                     # Gestion utilisateurs
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │
│   ├── tickets/                   # Gestion tickets/codes
│   │   ├── tickets.module.ts
│   │   ├── tickets.controller.ts
│   │   ├── tickets.service.ts
│   │   ├── tickets.seed.ts        # Génération 500k codes
│   │   └── dto/
│   │
│   ├── participations/            # Participations au jeu
│   │   ├── participations.module.ts
│   │   ├── participations.controller.ts
│   │   ├── participations.service.ts
│   │   └── dto/
│   │
│   ├── gains/                     # Gestion des gains
│   │   ├── gains.module.ts
│   │   ├── gains.controller.ts
│   │   ├── gains.service.ts
│   │   └── dto/
│   │
│   ├── stats/                     # Statistiques
│   │   ├── stats.module.ts
│   │   ├── stats.controller.ts
│   │   └── stats.service.ts
│   │
│   └── grand-prize/               # Tirage au sort
│       ├── grand-prize.module.ts
│       ├── grand-prize.controller.ts
│       └── grand-prize.service.ts
│
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── Dockerfile
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### 2.2 Flux d'Authentification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUX AUTHENTIFICATION                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      INSCRIPTION CLASSIQUE                           │    │
│  │                                                                      │    │
│  │   Client ──► POST /auth/register ──► Validation ──► Hash Password   │    │
│  │      │                                                     │         │    │
│  │      │                                                     ▼         │    │
│  │      │                                              Create User      │    │
│  │      │                                                     │         │    │
│  │      ◄───────────────── JWT Access + Refresh ◄─────────────┘         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        CONNEXION OAuth2                              │    │
│  │                                                                      │    │
│  │   Client ──► GET /auth/google ──► Google OAuth ──► Callback         │    │
│  │      │                                                   │           │    │
│  │      │                                                   ▼           │    │
│  │      │                                         Find or Create User   │    │
│  │      │                                                   │           │    │
│  │      ◄───────────────── JWT Access + Refresh ◄───────────┘           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      REFRESH TOKEN                                   │    │
│  │                                                                      │    │
│  │   Client ──► POST /auth/refresh ──► Validate Refresh ──► New JWT    │    │
│  │      │                                                      │        │    │
│  │      ◄──────────────────────────────────────────────────────┘        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Flux de Participation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FLUX DE PARTICIPATION                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Client                    API                         Database            │
│      │                       │                              │                │
│      │  POST /participations │                              │                │
│      │  { code: "ABC123XYZ" }│                              │                │
│      │───────────────────────►                              │                │
│      │                       │                              │                │
│      │                       │  SELECT * FROM tickets       │                │
│      │                       │  WHERE code = 'ABC123XYZ'    │                │
│      │                       │──────────────────────────────►                │
│      │                       │                              │                │
│      │                       │◄─────── Ticket found ────────│                │
│      │                       │                              │                │
│      │                       │  Vérifications:              │                │
│      │                       │  - Code existe ?             │                │
│      │                       │  - Code non utilisé ?        │                │
│      │                       │  - Jeu en cours ?            │                │
│      │                       │                              │                │
│      │                       │  BEGIN TRANSACTION           │                │
│      │                       │                              │                │
│      │                       │  UPDATE tickets              │                │
│      │                       │  SET isUsed = true           │                │
│      │                       │──────────────────────────────►                │
│      │                       │                              │                │
│      │                       │  INSERT participation        │                │
│      │                       │──────────────────────────────►                │
│      │                       │                              │                │
│      │                       │  COMMIT                      │                │
│      │                       │                              │                │
│      │◄─────────────────────│                              │                │
│      │  { prize: "INFUSER" } │                              │                │
│      │                       │                              │                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Architecture WebApp (Frontend)

### 3.1 Structure Next.js 14 (App Router)

```
webapp/
├── src/
│   ├── app/                       # App Router
│   │   ├── layout.tsx             # Layout racine
│   │   ├── page.tsx               # Page d'accueil
│   │   ├── globals.css
│   │   │
│   │   ├── (public)/              # Pages publiques
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── reglement/
│   │   │   │   └── page.tsx
│   │   │   ├── lots/
│   │   │   │   └── page.tsx
│   │   │   └── contact/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (auth)/                # Pages auth
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (protected)/           # Pages protégées
│   │   │   ├── layout.tsx         # Auth check
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Dashboard client
│   │   │   ├── participer/
│   │   │   │   └── page.tsx       # Formulaire participation
│   │   │   ├── mes-gains/
│   │   │   │   └── page.tsx       # Historique gains
│   │   │   └── profil/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (employee)/            # Espace employé
│   │   │   ├── layout.tsx
│   │   │   └── remise/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (admin)/               # Espace admin
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── statistiques/
│   │   │   │   └── page.tsx
│   │   │   ├── utilisateurs/
│   │   │   │   └── page.tsx
│   │   │   ├── tirage/
│   │   │   │   └── page.tsx
│   │   │   └── emailing/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                   # API Routes (BFF)
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                    # Composants UI (shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ParticipationForm.tsx
│   │   │
│   │   └── features/
│   │       ├── TicketValidator.tsx
│   │       ├── PrizeCard.tsx
│   │       ├── StatsChart.tsx
│   │       └── GrandPrizeDraw.tsx
│   │
│   ├── lib/
│   │   ├── api.ts                 # Client API
│   │   ├── auth.ts                # Config NextAuth
│   │   ├── utils.ts
│   │   └── validations.ts         # Schemas Zod
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useParticipation.ts
│   │   └── useStats.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   │
│   └── types/
│       ├── api.ts
│       └── index.ts
│
├── public/
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
│
├── Dockerfile
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

### 3.2 Routage et Navigation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARBORESCENCE DES PAGES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  /                           ─── Landing Page (Présentation jeu)            │
│  ├── /reglement              ─── Règlement du jeu-concours                  │
│  ├── /lots                   ─── Présentation des lots à gagner             │
│  ├── /contact                ─── Page de contact                            │
│  │                                                                          │
│  ├── /login                  ─── Connexion                                  │
│  ├── /register               ─── Inscription                                │
│  ├── /forgot-password        ─── Mot de passe oublié                        │
│  │                                                                          │
│  ├── /dashboard              ─── [AUTH] Dashboard client                    │
│  ├── /participer             ─── [AUTH] Formulaire de participation         │
│  ├── /mes-gains              ─── [AUTH] Historique des gains                │
│  ├── /profil                 ─── [AUTH] Profil utilisateur                  │
│  │                                                                          │
│  ├── /employee/              ─── [EMPLOYEE] Espace employé                  │
│  │   └── /remise             ─── [EMPLOYEE] Remise des lots                 │
│  │                                                                          │
│  └── /admin/                 ─── [ADMIN] Espace administration              │
│      ├── /dashboard          ─── [ADMIN] Vue d'ensemble                     │
│      ├── /statistiques       ─── [ADMIN] Statistiques détaillées            │
│      ├── /utilisateurs       ─── [ADMIN] Gestion utilisateurs               │
│      ├── /tirage             ─── [ADMIN] Tirage au sort grand prix          │
│      └── /emailing           ─── [ADMIN] Campagnes email                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Architecture Base de Données

### 4.1 Diagramme Entité-Relation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MODÈLE DE DONNÉES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────┐          ┌─────────────────────┐                   │
│  │       User          │          │      Ticket         │                   │
│  ├─────────────────────┤          ├─────────────────────┤                   │
│  │ id (PK)             │          │ id (PK)             │                   │
│  │ email               │          │ code (UNIQUE)       │                   │
│  │ password            │          │ prizeType           │                   │
│  │ firstName           │          │ isUsed              │                   │
│  │ lastName            │          │ isDistributed       │                   │
│  │ birthDate           │          │ createdAt           │                   │
│  │ gender              │          │ usedAt              │                   │
│  │ phone               │          └──────────┬──────────┘                   │
│  │ googleId            │                     │                              │
│  │ facebookId          │                     │                              │
│  │ role                │                     │ 1                            │
│  │ consentEmail        │                     │                              │
│  │ consentData         │                     │                              │
│  │ createdAt           │                     │                              │
│  │ updatedAt           │          ┌──────────┴──────────┐                   │
│  │ deletedAt           │          │    Participation    │                   │
│  └──────────┬──────────┘          ├─────────────────────┤                   │
│             │                     │ id (PK)             │                   │
│             │ 1                   │ userId (FK)         │                   │
│             │                     │ ticketId (FK,UNIQUE)│                   │
│             │                     │ prizeDelivered      │                   │
│             │                     │ prizeDeliveredAt    │                   │
│             └─────────── N ───────│ prizeDeliveredBy    │                   │
│                                   │ deliveryMethod      │                   │
│                                   │ createdAt           │                   │
│  ┌─────────────────────┐          └─────────────────────┘                   │
│  │    GameConfig       │                                                    │
│  ├─────────────────────┤          ┌─────────────────────┐                   │
│  │ id (PK)             │          │     AuditLog        │                   │
│  │ startDate           │          ├─────────────────────┤                   │
│  │ endDate             │          │ id (PK)             │                   │
│  │ claimEndDate        │          │ userId              │                   │
│  │ maxTickets          │          │ action              │                   │
│  │ grandPrizeDrawn     │          │ entity              │                   │
│  │ grandPrizeWinnerId  │          │ entityId            │                   │
│  │ grandPrizeDrawnAt   │          │ oldValue (JSON)     │                   │
│  │ isActive            │          │ newValue (JSON)     │                   │
│  └─────────────────────┘          │ ipAddress           │                   │
│                                   │ createdAt           │                   │
│                                   └─────────────────────┘                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Index Optimisés

```sql
-- Index pour recherche rapide de codes
CREATE UNIQUE INDEX idx_tickets_code ON tickets(code);

-- Index pour filtrage statut tickets
CREATE INDEX idx_tickets_status ON tickets(isUsed, isDistributed);

-- Index pour recherche utilisateurs
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_google ON users(googleId) WHERE googleId IS NOT NULL;
CREATE UNIQUE INDEX idx_users_facebook ON users(facebookId) WHERE facebookId IS NOT NULL;

-- Index pour participations
CREATE INDEX idx_participations_user ON participations(userId);
CREATE INDEX idx_participations_delivered ON participations(prizeDelivered);

-- Index pour audit
CREATE INDEX idx_audit_user ON audit_logs(userId);
CREATE INDEX idx_audit_entity ON audit_logs(entity, entityId);
CREATE INDEX idx_audit_date ON audit_logs(createdAt);
```

---

## 5. Architecture de Déploiement

### 5.1 Infrastructure Docker

```yaml
# docker-compose.yml simplifié
services:
  webapp:
    build: ./webapp
    environment:
      - NEXT_PUBLIC_API_URL=http://api:4000
    depends_on:
      - api

  api:
    build: ./api
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/thetiptop
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  traefik:
    image: traefik:v3.0
    ports:
      - "80:80"
      - "443:443"
```

### 5.2 Diagramme de Déploiement

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DÉPLOIEMENT PRODUCTION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        VPS PRODUCTION                                │    │
│  │                     (Ubuntu 22.04 LTS)                              │    │
│  │                     16GB RAM / 8 vCPU                               │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                   DOCKER SWARM / COMPOSE                     │    │    │
│  │  ├─────────────────────────────────────────────────────────────┤    │    │
│  │  │                                                              │    │    │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │    │    │
│  │  │  │   Traefik    │  │   WebApp     │  │    API       │      │    │    │
│  │  │  │   :80/:443   │  │   :3000      │  │   :4000      │      │    │    │
│  │  │  │   512MB      │  │   1GB x2     │  │   2GB x2     │      │    │    │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘      │    │    │
│  │  │                                                              │    │    │
│  │  │  ┌──────────────┐  ┌──────────────┐                        │    │    │
│  │  │  │  PostgreSQL  │  │    Redis     │                        │    │    │
│  │  │  │   :5432      │  │   :6379      │                        │    │    │
│  │  │  │   4GB        │  │   1GB        │                        │    │    │
│  │  │  └──────────────┘  └──────────────┘                        │    │    │
│  │  │                                                              │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  │                                                                      │    │
│  │  Volumes:                                                           │    │
│  │  ├── /var/lib/docker/volumes/postgres_data                          │    │
│  │  ├── /var/lib/docker/volumes/redis_data                             │    │
│  │  └── /var/lib/docker/volumes/traefik_certs                          │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      BACKUP (S3/MinIO)                               │    │
│  │  • PostgreSQL dumps quotidiens                                      │    │
│  │  • Rétention 30 jours                                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Intégration avec l'Écosystème Externe

### 6.1 API pour Caisses Magasins

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INTÉGRATION CAISSES MAGASINS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐                    ┌──────────────────┐               │
│  │   Caisse #1      │                    │       API        │               │
│  │   Nice           │    API KEY         │   Jeu-Concours   │               │
│  │                  │ ──────────────────►│                  │               │
│  │  POST /api/v1/   │                    │  Endpoints:      │               │
│  │  tickets/verify  │                    │                  │               │
│  │                  │◄────────────────── │  /tickets/verify │               │
│  │  { code, prize } │    Gain associé    │  /gains/{code}   │               │
│  └──────────────────┘                    │  /participations │               │
│                                          └──────────────────┘               │
│  ┌──────────────────┐                           │                           │
│  │   Site E-comm    │                           │                           │
│  │   (Futur)        │     API KEY               │                           │
│  │                  │ ──────────────────────────┘                           │
│  │  • Vérif codes   │                                                       │
│  │  • Historique    │                                                       │
│  │  • Livraison     │                                                       │
│  └──────────────────┘                                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Authentification OAuth2

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FLUX OAuth2 GOOGLE/FACEBOOK                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────┐     ┌────────┐     ┌────────────┐     ┌────────────┐            │
│  │ Client │     │ WebApp │     │    API     │     │  Provider  │            │
│  └───┬────┘     └───┬────┘     └─────┬──────┘     └─────┬──────┘            │
│      │              │                │                   │                   │
│      │  Click       │                │                   │                   │
│      │  "Google"    │                │                   │                   │
│      │─────────────►│                │                   │                   │
│      │              │                │                   │                   │
│      │              │  Redirect      │                   │                   │
│      │◄─────────────│ /auth/google   │                   │                   │
│      │              │                │                   │                   │
│      │──────────────────────────────────────────────────►│                   │
│      │              │                │   OAuth Page      │                   │
│      │              │                │                   │                   │
│      │◄──────────────────────────────────────────────────│                   │
│      │              │                │  code + state     │                   │
│      │              │                │                   │                   │
│      │─────────────►│                │                   │                   │
│      │  Callback    │                │                   │                   │
│      │              │ ───────────────►                   │                   │
│      │              │  Exchange code │                   │                   │
│      │              │                │ ─────────────────►│                   │
│      │              │                │   Get user info   │                   │
│      │              │                │ ◄─────────────────│                   │
│      │              │ ◄──────────────│                   │                   │
│      │              │   JWT tokens   │                   │                   │
│      │◄─────────────│                │                   │                   │
│      │   Logged in  │                │                   │                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Diagramme de Séquence - Tirage au Sort

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TIRAGE AU SORT GRAND PRIX                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Admin            API                    Database              Email         │
│    │               │                        │                    │           │
│    │ POST          │                        │                    │           │
│    │ /grand-prize/ │                        │                    │           │
│    │ draw          │                        │                    │           │
│    │──────────────►│                        │                    │           │
│    │               │                        │                    │           │
│    │               │  Vérif: jeu terminé ?  │                    │           │
│    │               │  Vérif: pas déjà tiré? │                    │           │
│    │               │                        │                    │           │
│    │               │  SELECT DISTINCT       │                    │           │
│    │               │  userId FROM           │                    │           │
│    │               │  participations        │                    │           │
│    │               │───────────────────────►│                    │           │
│    │               │                        │                    │           │
│    │               │◄───────────────────────│                    │           │
│    │               │   Liste participants   │                    │           │
│    │               │                        │                    │           │
│    │               │  Random selection      │                    │           │
│    │               │  (crypto.randomInt)    │                    │           │
│    │               │                        │                    │           │
│    │               │  UPDATE gameConfig     │                    │           │
│    │               │  SET winner            │                    │           │
│    │               │───────────────────────►│                    │           │
│    │               │                        │                    │           │
│    │               │                        │                    │           │
│    │               │  Send notification     │                    │           │
│    │               │────────────────────────────────────────────►│           │
│    │               │                        │                    │           │
│    │◄──────────────│                        │                    │           │
│    │  Winner info  │                        │                    │           │
│    │               │                        │                    │           │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Note importante** : Le tirage au sort doit garantir l'équité - chaque participant a une seule chance, quel que soit son nombre de participations.
