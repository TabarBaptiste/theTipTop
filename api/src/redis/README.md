# Cache Redis

`RedisModule` est `@Global()` : `RedisService` est injectable depuis n'importe quel
service sans import supplémentaire.

## Pattern cache-aside (`getOrSet`)

```ts
import { RedisService } from '../../redis/redis.service';

constructor(private readonly redis: RedisService) {}

async getSomething() {
  return this.redis.getOrSet('ma:cle', 300 /* TTL en secondes */, () =>
    this.computeSomething(), // fonction appelée seulement en cas de cache miss
  );
}
```

- Lit `ma:cle` dans Redis. Si présent → JSON.parse et retour immédiat.
- Sinon, exécute la fonction, stocke le résultat (`JSON.stringify`) avec le TTL,
  et le retourne.
- Si Redis est down, `getOrSet` exécute simplement la fonction sans cache
  (fallback silencieux, l'API continue de fonctionner).

Le résultat passe par `JSON.stringify`/`JSON.parse` : les `Date` redeviennent des
strings ISO après un cache hit. Si le code consommateur fait des comparaisons de
dates sur la valeur cachée, normalisez avec `new Date(valeur)` (voir
`GameConfigService.getPublicConfig`).

## Convention de nommage des clés

- `ressource:identifiant` (ex: `prizes:map`, `game:config`)
- `stats:<nom>` pour toutes les statistiques (ex: `stats:overview`,
  `stats:prizes:`). Préfixe centralisé dans `cache-keys.ts` via
  `STATS_CACHE_PREFIX` / `STATS_CACHE_PATTERN`.
- Si la valeur dépend de paramètres (ex: pagination, filtres), inclure ces
  paramètres dans la clé : `stats:timeline:${days}`,
  `stats:emailing:${consentEmail}:${hasParticipated}`.

Centralisez les clés et TTL dans [`cache-keys.ts`](./cache-keys.ts) plutôt que
d'utiliser des chaînes en dur dispersées dans les services.

## Invalidation

Quand une mutation change des données cachées, supprimez les clés concernées :

```ts
// Clé unique
await this.redis.del(PRIZES_MAP_CACHE_KEY);

// Toutes les clés d'un préfixe (ex: toutes les variantes de stats:*)
await this.redis.delByPattern(STATS_CACHE_PATTERN);
```

`delByPattern` utilise `SCAN` (non bloquant) plutôt que `KEYS`.

## Ajouter du cache à un nouveau service

1. Ajouter la clé (et son TTL) dans `cache-keys.ts`.
2. Injecter `RedisService` dans le constructeur du service.
3. Renommer la méthode existante en `computeXxx()` (privée) et créer/garder une
   méthode publique `getXxx()` qui appelle
   `this.redis.getOrSet(KEY, TTL, () => this.computeXxx())`.
4. Si une autre méthode mute les données utilisées par ce cache, appeler
   `this.redis.del(KEY)` (ou `delByPattern`) après la mutation.

## Rate limiting (INCR + EXPIRE)

Pour limiter un nombre d'actions par fenêtre de temps :

```ts
const key = `ratelimit:${userId}:action:${windowId}`;
const count = await this.redis.incr(key);
if (count === 1) {
  await this.redis.expire(key, 3600); // pose le TTL seulement à la 1ère requête
}
if (count > LIMIT) {
  throw new HttpException('Trop de requêtes', HttpStatus.TOO_MANY_REQUESTS);
}
```

Si Redis est down, `incr` retourne `0` : la limite n'est jamais dépassée
(fail-open), le throttling global (`ThrottlerModule`) reste la protection de
base.

## Healthcheck

`RedisService.isHealthy()` envoie un `PING` et retourne `true`/`false`. Utile
pour un futur endpoint `/health`.
