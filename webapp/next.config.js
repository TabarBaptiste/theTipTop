// ===========================================
// Content-Security-Policy
// ===========================================
// Deployee en Report-Only : les violations sont signalees dans la console du
// navigateur, rien n'est bloque. C'est la seule facon prudente d'introduire une
// CSP sur un site existant - une directive trop stricte casse silencieusement,
// la page s'affiche amputee chez le visiteur sans qu'aucune erreur ne remonte
// cote serveur.
//
// Passage en 'Content-Security-Policy' (sans -Report-Only) une fois verifie
// qu'aucune violation ne remonte sur les parcours reels, participation comprise.
//
// Choix assume : 'unsafe-inline' sur les scripts. L'alternative propre est un
// nonce par requete, pose par le middleware - mais cela rendrait chaque page
// dynamique et ferait perdre le prerendu statique dont beneficient aujourd'hui
// toutes les pages publiques. Le compromis se discute a froid, pas dans un
// correctif de securite.

// L'API vit sur un autre domaine, variable selon l'environnement. Son origine
// est derivee de la variable de build plutot que codee en dur.
const origineApi = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').origin;
  } catch {
    return 'http://localhost:3001';
  }
})();

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  // Coherent avec X-Frame-Options: SAMEORIGIN, deja pose plus bas.
  "frame-ancestors 'self'",
  "frame-src 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  // Avatars des comptes Google et Facebook, pixels de mesure d'audience, et
  // Cloudinary qui heberge les visuels des lots. Ces dernieres URL ne figurent
  // nulle part dans le code : elles arrivent de l'API, stockees en base. Sans
  // cette origine, toutes les images de lots disparaissaient de l'accueil.
  "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://graph.facebook.com https://www.googletagmanager.com https://www.google-analytics.com",
  // next/font auto-heberge les polices : aucune origine tierce necessaire.
  "font-src 'self' data:",
  `connect-src 'self' ${origineApi} https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com`,
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Chaque reponse annoncait « X-Powered-By: Next.js ». Ce n'est pas une faille
  // en soi, mais cela oriente vers les CVE du framework et de sa version.
  poweredByHeader: false,
  // Repertoire de sortie parametrable. Un build de production ecrit sinon dans
  // le meme .next que le serveur de developpement, qu'il interrompt : mesurer
  // les performances obligeait donc a arreter son environnement de travail.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Depuis Next 15.3, le serveur de developpement refuse les requetes venant
  // d'une origine autre que la sienne. Ouvrir le site depuis un telephone du
  // reseau local servait donc bien le HTML et les fichiers statiques, mais le
  // runtime etait bloque : la page ne s'hydratait pas, et tous les boutons
  // restaient inertes alors que les liens fonctionnaient.
  //
  // Les plages listees sont les trois plages privees RFC 1918. Elles n'ont
  // d'effet qu'en developpement, jamais sur un build de production.
  // host.docker.internal : nom par lequel un conteneur atteint la machine hote.
  // C'est l'origine utilisee quand Cypress tourne dans son image officielle,
  // le binaire ne pouvant pas s'installer derriere le proxy (cf. .npmrc).
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.16.*.*', 'host.docker.internal'],
  images: {
    qualities: [70, 75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
      },
    ],
  },
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy-Report-Only',
            value: contentSecurityPolicy,
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            // Aucune page n'utilise ces API. Les refuser explicitement empeche
            // qu'un script injecte, ou une iframe tierce, y accede au nom du
            // site.
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
