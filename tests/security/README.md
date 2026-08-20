# Tests de sécurité

Le protocole complet — quand chaque contrôle est déclenché, ce qui bloque, et
comment traiter une découverte — est dans
[docs/05-PROTOCOLES-DE-TESTS.md](../../docs/05-PROTOCOLES-DE-TESTS.md). Ce
fichier ne couvre que la mise en œuvre.

## Scan OWASP ZAP baseline

Parcourt l'application déployée sans l'attaquer : analyse des réponses, des
en-têtes et des formulaires. Contrôle passif, sans risque pour les données de
l'environnement cible.

```bash
docker run --rm -v "$PWD/tests/security:/zap/wrk" -t ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t https://thetiptop-preprod.wk-archi-o24a-4-5-g1.fr -c zap-baseline.tsv -I
```

Contre l'environnement local, remplacer la cible par
`http://host.docker.internal:3000`.

L'option `-I` empêche les avertissements de faire échouer la commande ; seules
les règles classées `FAIL` bloquent. `-r rapport.html` produit un rapport
lisible dans le répertoire monté.

### Le fichier de règles

`zap-baseline.tsv` classe chaque règle en IGNORE, WARN ou FAIL, avec sa
justification. Trois colonnes séparées par des **tabulations** — un fichier mal
formé fait sortir ZAP en code 3 sans message explicite.

Règle de tenue : une alerte n'est écartée qu'après avoir été comprise, et la
raison est écrite. C'est la même discipline que `.trivyignore`.

## Vulnérabilités des dépendances

```bash
npm run test:securite
```

Équivaut à `npm audit --audit-level=high` depuis la racine. Pour distinguer ce
qui est réellement déployé de l'outillage de développement :

```bash
npm audit --omit=dev
```

Une vulnérabilité dans un outil de test n'expose pas la plateforme — la
distinction est le premier réflexe de tri.

## Secrets

`gitleaks` s'exécute avant chaque commit via husky, sur les fichiers indexés.
Aucune action manuelle n'est requise ; un secret détecté annule le commit.

## Images Docker

Trivy s'exécute dans le pipeline Jenkins à chaque build d'image. Les CVE non
actionnables — système de l'image de base, dépendances vendorisées dans Next —
sont listées et justifiées dans `.trivyignore` à la racine.
