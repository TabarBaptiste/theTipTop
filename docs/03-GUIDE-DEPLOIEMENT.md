# 🚀 Guide de Déploiement - Thé Tip Top

Ce guide détaille toutes les étapes nécessaires pour déployer l'application Thé Tip Top en environnement de production.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Architecture de déploiement](#architecture-de-déploiement)
3. [Configuration DNS](#configuration-dns)
4. [Déploiement avec Docker](#déploiement-avec-docker)
5. [Configuration SSL/TLS](#configuration-ssltls)
6. [Configuration OAuth2](#configuration-oauth2)
7. [Base de données](#base-de-données)
8. [CI/CD avec Jenkins](#cicd-avec-jenkins)
9. [Monitoring](#monitoring)
10. [Sauvegardes](#sauvegardes)
11. [Checklist pré-production](#checklist-pré-production)

---

## 🔧 Prérequis

### Serveur de production
- **OS** : Ubuntu 22.04 LTS ou Debian 12
- **RAM** : Minimum 4 Go (recommandé 8 Go)
- **CPU** : 2 vCPU minimum
- **Stockage** : 50 Go SSD
- **Réseau** : IP publique fixe

### Logiciels requis
```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installation Docker Compose
sudo apt install docker-compose-plugin

# Vérification
docker --version
docker compose version
```

### Domaines requis
- `thetiptop.dsp5-archi-o24a-4-5-g1.fr` - Application web
- `api.thetiptop.dsp5-archi-o24a-4-5-g1.fr` - API Backend
- `staging.thetiptop.dsp5-archi-o24a-4-5-g1.fr` - Environnement staging

---

## 🏗️ Architecture de déploiement

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   (DNS + CDN)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    Traefik      │
                    │ (Reverse Proxy) │
                    │   :80 / :443    │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
    │  Webapp   │     │    API    │     │  Grafana  │
    │ (Next.js) │     │ (NestJS)  │     │ Monitoring│
    │   :3000   │     │   :3001   │     │   :3000   │
    └───────────┘     └─────┬─────┘     └───────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
        │PostgreSQL │ │   Redis   │ │   Loki    │
        │   :5432   │ │   :6379   │ │   Logs    │
        └───────────┘ └───────────┘ └───────────┘
```

---

## 🌐 Configuration DNS

### Enregistrements DNS à créer

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | thetiptop | IP_SERVEUR | 3600 |
| A | www.thetiptop | IP_SERVEUR | 3600 |
| A | api.thetiptop | IP_SERVEUR | 3600 |
| A | staging.thetiptop | IP_SERVEUR | 3600 |
| CNAME | www | thetiptop.dsp5-archi-o24a-4-5-g1.fr | 3600 |

### Configuration Cloudflare (recommandé)
1. Activer le proxy Cloudflare (orange cloud)
2. Mode SSL : Full (strict)
3. Always Use HTTPS : On
4. Minimum TLS Version : 1.2

---

## 🐳 Déploiement avec Docker

### 1. Cloner le projet
```bash
cd /opt
sudo git clone https://votre-repo/thetiptop.git
cd thetiptop
```

### 2. Configurer les variables d'environnement
```bash
# Copier les fichiers d'exemple
cp api/.env.example api/.env
cp webapp/.env.example webapp/.env

# Éditer les fichiers
nano api/.env
```

### 3. Variables d'environnement de production (api/.env)
```env
# Base de données
DATABASE_URL="postgresql://thetiptop:MOTDEPASSE_FORT@postgres:5432/thetiptop?schema=public"

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT (générer des secrets uniques)
JWT_SECRET=GENERER_CLE_256_BITS
JWT_REFRESH_SECRET=GENERER_AUTRE_CLE_256_BITS
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# OAuth2 Google
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=https://api.thetiptop.dsp5-archi-o24a-4-5-g1.fr/api/v1/auth/google/callback

# OAuth2 Facebook
FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx
FACEBOOK_CALLBACK_URL=https://api.thetiptop.dsp5-archi-o24a-4-5-g1.fr/api/v1/auth/facebook/callback

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://thetiptop.dsp5-archi-o24a-4-5-g1.fr
```

### 4. Générer des secrets sécurisés
```bash
# Générer JWT_SECRET
openssl rand -base64 64

# Générer JWT_REFRESH_SECRET
openssl rand -base64 64

# Générer mot de passe DB
openssl rand -base64 32
```

### 5. Lancer l'application
```bash
# Build et démarrage
docker compose -f docker-compose.prod.yml up -d --build

# Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f

# Exécuter les migrations
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Générer les 500 000 codes
docker compose -f docker-compose.prod.yml exec api npx prisma db seed
```

---

## 🔒 Configuration SSL/TLS

### Avec Traefik et Let's Encrypt

Le fichier `docker-compose.prod.yml` est configuré pour utiliser Traefik avec Let's Encrypt automatique.

### Configuration Traefik (traefik.yml)
```yaml
api:
  dashboard: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@thetiptop.fr
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

---

## 🔐 Configuration OAuth2

### Google Cloud Console

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner existant
3. APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client IDs
4. Application type: Web application
5. Authorized JavaScript origins:
   - `https://thetiptop.dsp5-archi-o24a-4-5-g1.fr`
6. Authorized redirect URIs:
   - `https://api.thetiptop.dsp5-archi-o24a-4-5-g1.fr/api/v1/auth/google/callback`

### Facebook Developers

1. Aller sur [Facebook Developers](https://developers.facebook.com/)
2. Créer une nouvelle application
3. Ajouter le produit "Facebook Login"
4. Settings > Basic : récupérer App ID et App Secret
5. Facebook Login > Settings:
   - Valid OAuth Redirect URIs:
     - `https://api.thetiptop.dsp5-archi-o24a-4-5-g1.fr/api/v1/auth/facebook/callback`

---

## 🗄️ Base de données

### Initialisation
```bash
# Connexion au conteneur
docker compose -f docker-compose.prod.yml exec postgres psql -U thetiptop

# Vérifier la base
\l
\dt
```

### Migrations Prisma
```bash
# Appliquer les migrations
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# En cas de problème, reset (ATTENTION: perte de données)
docker compose -f docker-compose.prod.yml exec api npx prisma migrate reset
```

### Génération des 500 000 codes
```bash
# Exécuter le seed
docker compose -f docker-compose.prod.yml exec api npx prisma db seed

# Vérifier le nombre de tickets
docker compose -f docker-compose.prod.yml exec postgres psql -U thetiptop -c "SELECT COUNT(*) FROM tickets;"
```

---

## 🔄 CI/CD avec Jenkins

### Configuration Jenkins

1. **Créer les credentials dans Jenkins** :
   - `docker-registry-credentials` : Identifiants registre Docker
   - `deploy-ssh-key` : Clé SSH pour déploiement
   - `sonarqube-token` : Token SonarQube
   - `deploy-host` : Adresse IP serveur
   - `deploy-user` : Utilisateur SSH

2. **Créer le pipeline** :
   - New Item > Pipeline
   - Pipeline from SCM
   - Repository URL : votre repo Git
   - Script Path : `Jenkinsfile`

3. **Webhooks GitLab/GitHub** :
   - URL : `https://jenkins.domain.fr/project/thetiptop`
   - Trigger : Push events, Merge request events

### Branches et environnements

| Branche | Environnement | Déploiement |
|---------|---------------|-------------|
| `develop` | - | Build + Tests uniquement |
| `staging` | Staging | Automatique |
| `main` | Production | Validation manuelle |

---

## 📊 Monitoring

### Prometheus + Grafana

L'infrastructure Furious Ducks inclut déjà Prometheus et Grafana. Pour ThéTipTop :

1. **Ajouter la cible Prometheus** (prometheus.yml) :
```yaml
scrape_configs:
  - job_name: 'thetiptop-api'
    static_configs:
      - targets: ['thetiptop-api:3001']
    metrics_path: '/api/v1/metrics'
```

2. **Dashboard Grafana recommandé** :
   - Temps de réponse API
   - Nombre de participations / heure
   - Erreurs 4xx / 5xx
   - Utilisation mémoire / CPU

### Alertes

Configurer des alertes pour :
- API indisponible
- Temps de réponse > 2s
- Erreurs 5xx > 10/min
- Espace disque < 20%

---

## 💾 Sauvegardes

### Script de backup automatique

```bash
#!/bin/bash
# /opt/thetiptop/backup.sh

BACKUP_DIR="/opt/backups/thetiptop"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker compose -f /opt/thetiptop/docker-compose.prod.yml exec -T postgres \
  pg_dump -U thetiptop thetiptop | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Garder les 7 derniers jours
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

### Cron job
```bash
# Backup quotidien à 3h du matin
0 3 * * * /opt/thetiptop/backup.sh >> /var/log/backup-thetiptop.log 2>&1
```

---

## ✅ Checklist pré-production

### Sécurité
- [ ] Tous les secrets sont générés et uniques
- [ ] HTTPS activé et forcé
- [ ] Headers de sécurité configurés (CSP, HSTS, etc.)
- [ ] Rate limiting activé
- [ ] Logs d'audit fonctionnels

### Performance
- [ ] Build de production (pas de dev dependencies)
- [ ] Gzip/Brotli activé
- [ ] Cache Redis fonctionnel
- [ ] Images Docker optimisées

### Fonctionnel
- [ ] 500 000 tickets générés
- [ ] OAuth Google fonctionnel
- [ ] OAuth Facebook fonctionnel
- [ ] Emails transactionnels configurés
- [ ] Tests E2E passés en staging

### Monitoring
- [ ] Prometheus scrape l'API
- [ ] Dashboards Grafana créés
- [ ] Alertes configurées
- [ ] Backups automatisés et testés

### Légal (RGPD)
- [ ] Politique de confidentialité publiée
- [ ] CGU publiées
- [ ] Règlement du jeu publié
- [ ] Consentement cookies fonctionnel
- [ ] Export données utilisateur fonctionnel
- [ ] Suppression compte fonctionnelle

---

## 🆘 Dépannage

### L'API ne démarre pas
```bash
# Vérifier les logs
docker compose -f docker-compose.prod.yml logs api

# Vérifier la connexion DB
docker compose -f docker-compose.prod.yml exec api npx prisma db push --dry-run
```

### Erreur de certificat SSL
```bash
# Vérifier Traefik
docker compose -f docker-compose.prod.yml logs traefik

# Vérifier le fichier acme.json
ls -la /opt/thetiptop/letsencrypt/
```

### Performance lente
```bash
# Vérifier l'utilisation des ressources
docker stats

# Vérifier les connexions DB
docker compose -f docker-compose.prod.yml exec postgres psql -U thetiptop -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 📞 Support

En cas de problème critique :
1. Vérifier les logs : `docker compose -f docker-compose.prod.yml logs -f`
2. Consulter le runbook Furious Ducks : `infrastructure/RUNBOOK.md`
3. Contacter l'équipe DevOps
