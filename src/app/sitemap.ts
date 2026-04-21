import { MetadataRoute } from 'next';
import { createSupabaseServerClient } from "@/app/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://la-crysalys.vercel.app';
  
  // URLs statiques de base
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/expertise`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/postprod`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/realisations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/equipe`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.8 },
  ];

  try {
    const supabase = createSupabaseServerClient();
    // On récupère seulement l'ID et la date de mise à jour de tous les projets
    const { data: projects } = await supabase
      .from('portfolio_items')
      .select('id, project_date')
      .order('project_date', { ascending: false });

    if (!projects) return staticRoutes;

    // On génère une URL pour chaque projet dynamique
    const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
      url: `${baseUrl}/realisations/${project.id}`,
      lastModified: new Date(project.project_date),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...projectRoutes];
  } catch (e) {
    return staticRoutes;
  }
}