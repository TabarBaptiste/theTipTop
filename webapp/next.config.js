/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
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
        ],
      },
    ];
  },
};

module.exports = nextConfig;
