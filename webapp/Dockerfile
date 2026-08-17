# ===========================================
# Dockerfile Frontend Next.js - Thé Tip Top
# ===========================================
# Multi-stage build for development and production

# --- Stage 1: Base ---
FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm config set fetch-retries 5

# --- Stage 2: Development ---
FROM base AS development
ENV NODE_ENV=development

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

# --- Stage 3: Build ---
FROM base AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Variables d'environnement pour le build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# --- Stage 4: Production ---
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
# npm workspaces cause Next.js to nest the standalone output under webapp/
# (root package-lock.json makes /app the outputFileTracingRoot), so
# .next/standalone/webapp/server.js is the real entrypoint, not ./server.js.
COPY --from=builder /app/webapp/public ./webapp/public
COPY --from=builder --chown=nextjs:nodejs /app/webapp/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/webapp/.next/static ./webapp/.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "webapp/server.js"]
