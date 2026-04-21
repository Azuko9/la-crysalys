import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// On utilise le client anonyme juste pour lire les IDs publics
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://la-crysalys.vercel.app';

  // 1. Les pages statiques de ton site
  const staticRoutes = [
    '',
    '/expertise',
    '/realisations',
    '/equipe',
    '/postprod',
    '/contact',
    '/mentions-legales',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8, // La page d'accueil est la priorité absolue (1.0)
  }));

  // 2. Les pages dynamiques (Tes réalisations/projets)
  const { data: projects } = await supabase
    .from('portfolio_items')
    .select('id, created_at');

  const dynamicRoutes = (projects || []).map((project) => ({
    url: `${baseUrl}/realisations/${project.id}`,
    lastModified: new Date(project.created_at || new Date()),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}