import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://la-crysalys.vercel.app'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Empêche Google d'indexer la page de login admin
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}