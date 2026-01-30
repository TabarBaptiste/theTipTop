# ===========================================
# Dockerfile Frontend Next.js - Thé Tip Top
# ===========================================
# Multi-stage build for development and production

# --- Stage 1: Base ---
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# --- Stage 2: Development ---
FROM base AS development
ENV NODE_ENV=development

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

# --- Stage 3: Dependencies ---
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# --- Stage 4: Build ---
FROM base AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Variables d'environnement pour le build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# --- Stage 5: Production ---
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
