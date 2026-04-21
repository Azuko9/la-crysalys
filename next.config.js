/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        // Applique ces en-têtes de sécurité à toutes les routes du site
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Empêche le Clickjacking (ton site ne peut pas être mis dans une iframe tierce)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Empêche le navigateur de "deviner" le type MIME (évite certaines failles XSS)
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Protège la confidentialité des requêtes sortantes
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload', // Force l'utilisation du HTTPS strict pendant 2 ans (HSTS)
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()', // Bloque les APIs sensibles du navigateur
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;