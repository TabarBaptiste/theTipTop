## Les environnements disponibles
 
| Branche | Environnement | URL |
|---|---|---|
| `develop` | DEV (auto) | `thetiptop-dev.wk-archi-o24a-4-5-g1.fr` |
| `main` | PREPROD (auto) | `thetiptop-preprod.wk-archi-o24a-4-5-g1.fr` |
| `main` + tag `vX.Y.Z` | PROD (validation manuelle) | `dsp5-archi-o24a-4-5-g1.fr` |
 
---
 
## Ce que ça implique concrètement pour coder
 
- **Tes Dockerfiles** sont à `api/Dockerfile` et `webapp/Dockerfile`, pas à la racine.
- **Node.js cible : 22** (le pipeline tourne en `node:22-bullseye`, les Dockerfiles en `node:22-alpine`).
- **Les tests sont dans `api/`** avec `api/jest.config.js` — Jest est configuré pour TypeScript via `ts-jest`.
- **SonarQube analyse** `api/src` et `webapp/src` — les fichiers générés (`.next/`, `dist/`, `coverage/`) sont exclus.
- **Harbor** est le registry Docker privé — tu n'interagis pas avec lui directement, c'est le pipeline qui y pousse les images.
- Le tag Docker d'une image sur `develop` suit le format : `registry.wk-archi-o24a-4-5-g1.fr/thetiptop/<service>:develop-<commitSHA>`