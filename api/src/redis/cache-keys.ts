// ===========================================
// Clés et durées (TTL) du cache Redis
// ===========================================

/** Map PrizeType -> { name, description, value } (TicketsService.getPrizesMap) */
export const PRIZES_MAP_CACHE_KEY = 'prizes:map';
export const PRIZES_MAP_TTL = 3600; // 1h, données statiques

/** Configuration active du jeu-concours (GameConfigService.getPublicConfig) */
export const GAME_CONFIG_CACHE_KEY = 'game:config';
export const GAME_CONFIG_TTL = 3600; // 1h, change rarement en prod

/** Préfixe commun à toutes les clés de stats (StatsService), pour invalidation groupée */
export const STATS_CACHE_PREFIX = 'stats:';
export const STATS_CACHE_PATTERN = `${STATS_CACHE_PREFIX}*`;

export const STATS_OVERVIEW_TTL = 300; // 5 min
export const STATS_PRIZES_TTL = 300; // 5 min
export const STATS_DEMOGRAPHICS_TTL = 600; // 10 min
export const STATS_TIMELINE_TTL = 600; // 10 min
export const STATS_EMAILING_TTL = 1800; // 30 min
