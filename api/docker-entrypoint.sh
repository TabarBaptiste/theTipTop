#!/bin/sh
# Applique les migrations puis peuple la base au premier démarrage.
# Le seed lui-même ne redemande jamais confirmation quand la table est
# vide (cf. prisma/seed.ts) : le comptage ici sert seulement à éviter de le
# relancer -- et de retomber sur son prompt interactif -- une fois peuplée.
set -e

npx prisma migrate deploy

TICKET_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.ticket.count()
  .then((count) => { console.log(count); return prisma.\$disconnect(); })
  .catch((err) => { console.error(err); process.exit(1); });
" | tail -n 1)

if [ "$TICKET_COUNT" = "0" ]; then
  echo "Aucun ticket en base : exécution du seed initial..."
  npx prisma db seed
else
  echo "$TICKET_COUNT ticket(s) déjà en base : seed ignoré."
fi

exec node dist/src/main.js
