# Tests de charge k6

Cinq profils, repris du cahier des clauses techniques détaillées (§3.5). Ils
sollicitent tous exactement le même trafic - seule leur montée en charge
diffère : c'est ce qui rend leurs résultats comparables entre eux.

| Profil | Fichier | Ce qu'il cherche |
|---|---|---|
| Montée en charge | `montee-en-charge.js` | Le seuil à partir duquel les temps se dégradent (10 → 500 VUs en 10 min) |
| Charge soutenue | `charge-soutenue.js` | Les dérives lentes : fuite mémoire, pool PostgreSQL saturé (50 VUs, 30 min) |
| Pic | `pic.js` | Que Redis absorbe une activation influenceur (400 VUs en moins d'une minute) |
| Stress | `stress.js` | Le point de rupture, et que la dégradation soit graduelle (jusqu'à 1600 VUs) |
| Récupération | `recuperation.js` | Que la plateforme revienne à son état nominal après un pic |

## Lancer un profil

k6 n'a pas besoin d'être installé : l'image officielle suffit.

```bash
docker run --rm -v "$PWD/tests/performance:/scripts" -w /scripts -e BASE_URL=https://thetiptop-preprod.wk-archi-o24a-4-5-g1.fr -e API_URL=https://thetiptop-api-preprod.wk-archi-o24a-4-5-g1.fr/api/v1 grafana/k6 run pic.js
```

Chaque exécution écrit son rapport dans `resultats/<profil>.json` - le format
attendu pour l'archivage Jenkins - et affiche à l'écran les trois critères
d'acceptation.

### Vérifier un scénario sans le mesurer

```bash
docker run --rm -v "$PWD/tests/performance:/scripts" -w /scripts -e SMOKE=1 grafana/k6 run pic.js
```

`SMOKE=1` réduit le profil à dix secondes et un utilisateur : de quoi vérifier
que le script s'exécute et que les cibles répondent. Les chiffres produits dans
ce mode n'ont aucune valeur de mesure.

## Variables

| Variable | Défaut | Rôle |
|---|---|---|
| `BASE_URL` | `http://host.docker.internal:3000` | Front Next.js |
| `API_URL` | `http://host.docker.internal:3001/api/v1` | API NestJS |
| `PAUSE` | `1` | Temps de réflexion entre itérations, en secondes |
| `VUS_NOMINAL` | `50` | Palier de la charge soutenue |
| `SMOKE` | - | `1` pour réduire le profil à une vérification |

## Deux points à connaître avant d'interpréter un résultat

**La limitation de débit fausse la mesure.** L'API plafonne les requêtes par
adresse IP - trois par seconde sur le palier le plus court. Une campagne k6
part d'une seule machine, donc d'une seule IP : passé quelques utilisateurs
virtuels, elle ne mesure plus la plateforme mais le limiteur. Les plafonds sont
configurables (`THROTTLE_SHORT_LIMIT`, `THROTTLE_MEDIUM_LIMIT`,
`THROTTLE_LIMIT`) et doivent être relevés sur l'environnement de test le temps
de la campagne. La marche à suivre est dans
[docs/05-PROTOCOLES-DE-TESTS.md](../../docs/05-PROTOCOLES-DE-TESTS.md).

**Aucun ticket n'est consommé.** Le parcours simulé vérifie des codes
volontairement inexistants. Le chemin exercé est le même - validation du
format, lecture indexée du ticket, table des lots depuis Redis - mais rien
n'est écrit : un test de charge qui participerait réellement brûlerait des lots
à chaque exécution. Seule la branche d'attribution échappe à la mesure, et
elle est couverte par les tests fonctionnels.
