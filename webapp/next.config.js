/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Depuis Next 15.3, le serveur de developpement refuse les requetes venant
  // d'une origine autre que la sienne. Ouvrir le site depuis un telephone du
  // reseau local servait donc bien le HTML et les fichiers statiques, mais le
  // runtime etait bloque : la page ne s'hydratait pas, et tous les boutons
  // restaient inertes alors que les liens fonctionnaient.
  //
  // Les plages listees sont les trois plages privees RFC 1918. Elles n'ont
  // d'effet qu'en developpement, jamais sur un build de production.
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.16.*.*'],
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
