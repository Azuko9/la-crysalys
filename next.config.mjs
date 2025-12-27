/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! ATTENTION !!
    // Permet de déployer même s'il y a des erreurs TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Permet de déployer même s'il y a des erreurs ESLint (apostrophes, etc.)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;