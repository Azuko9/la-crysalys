import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://la-crysalys.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/admin/'], // Interdit aux robots d'indexer ton interface d'administration
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}