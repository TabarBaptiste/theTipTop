# ===========================================
# Dockerfile API NestJS - Thé Tip Top
# ===========================================
# Multi-stage build for development and production

# --- Stage 1: Base ---
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
RUN npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm config set fetch-retries 5

# --- Stage 2: Development ---
FROM base AS development
ENV NODE_ENV=development

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# --- Stage 3: Build ---
# Contexte de build : la RACINE du monorepo (npm workspaces), pas api/.
FROM base AS builder
WORKDIR /app

COPY package*.json ./
COPY api/package.json ./api/
COPY webapp/package.json ./webapp/
COPY api/prisma ./api/prisma

RUN npm ci --include-workspace-root --workspace api

COPY api ./api
RUN npm run build --workspace api

# --- Stage 4: Production ---
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/api ./api

USER nestjs
WORKDIR /app/api

EXPOSE 3001
# prisma/seed.ts elargit le rootDir au dossier api/ : nest build emet donc
# dist/src/main.js et non dist/main.js.
CMD ["node", "dist/src/main.js"]
