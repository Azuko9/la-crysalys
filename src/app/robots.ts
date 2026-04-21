import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // On interdit aux robots d'indexer l'interface d'administration
      disallow: ['/admin/', '/api/'], 
    },
    // Indique l'URL du sitemap généré automatiquement
    sitemap: 'https://la-crysalys.vercel.app/sitemap.xml',
  };
}