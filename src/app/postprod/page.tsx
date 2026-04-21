import type { Project } from '@/types';
import { createSupabaseServerClient } from '@/app/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import FeaturesSection from '@/components/FeaturesSection';
import { ImageCompareSlider } from "@/components/ImageCompareSlider";
import { getYouTubeID } from "@/lib/utils";
import { Layers, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: 'Post-Production - Montage, Étalonnage, VFX | La Crysalys',
  description: 'Découvrez notre expertise en post-production. Services de montage, étalonnage, effets spéciaux (VFX) et mixage audio pour un rendu cinématographique.',
};

export default async function PostProdPage() {
  const supabase = createSupabaseServerClient();

  // 1. Récupération hybride : on prend l'ancienne colonne ET la nouvelle relation Many-to-Many
  let { data: allProjects, error: projectsError }: { data: any[] | null, error: any } = await supabase
    .from('portfolio_items')
    .select('id, title, youtube_url, postprod_main_description, postprod_before_path, postprod_after_path, description_postprod, category, portfolio_item_categories(categories(name))')
    .order('project_date', { ascending: false });

  // SÉCURITÉ MAXIMALE : Si Supabase plante, on bascule sur la requête de secours (sans la table de liaison)
  if (projectsError) {
    console.warn("Erreur avec la nouvelle table de catégories, activation du mode secours :", projectsError.message);
    const fallback = await supabase
      .from('portfolio_items')
      .select('id, title, youtube_url, postprod_main_description, postprod_before_path, postprod_after_path, description_postprod, category')
      .order('project_date', { ascending: false });
    allProjects = fallback.data;
  }

  // 2. Filtrage intelligent côté serveur (Bulletproof)
  const projects = allProjects?.filter(project => {
    const oldCatStr = String(project.category || "").toLowerCase();
    const newCatStr = JSON.stringify(project.portfolio_item_categories || []).toLowerCase();

    const hasOldCat = oldCatStr.includes('post-prod') || oldCatStr.includes('postprod');
    const hasNewCat = newCatStr.includes('post-prod') || newCatStr.includes('postprod');
    const hasDescription = project.postprod_main_description && String(project.postprod_main_description).trim() !== "";
    return (hasOldCat || hasNewCat) && hasDescription;
  });

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* En-tête de la page */}
        <header className="text-center mb-16">
          <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Savoir-Faire</p>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-foreground">
            Post-Production & VFX
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-foreground/70 text-lg">
            Du montage à l&apos;étalonnage, en passant par les effets spéciaux, nous sublimons vos images pour un résultat percutant et professionnel.
          </p>
        </header>

        {/* Section des atouts (Features) */}
        <section className="mb-20">
          <FeaturesSection pageContext="postprod" />
        </section>

        {/* Section des projets liés à la post-production */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-3xl font-black text-center mb-12 text-primary italic uppercase tracking-tighter">Nos Projets en Post-Production</h2>
            <div className="space-y-16">
              {projects.map((project: Pick<Project, 'id' | 'title' | 'youtube_url' | 'postprod_main_description' | 'postprod_before_path' | 'postprod_after_path' | 'description_postprod'>) => (
                <div key={project.id} className="bg-card border border-zinc-800 rounded-dynamic p-8">
                  {/* Section haute : Texte et Vidéo */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Colonne de gauche : Texte */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-purple-400 mb-3 flex items-center gap-2 italic uppercase tracking-tighter">
                        <Layers size={22}/> {project.title}
                      </h3>
                      {project.postprod_main_description && (
                        <div className="prose prose-sm prose-invert prose-zinc max-w-none text-foreground/70 leading-relaxed">
                          <p className="line-clamp-6">
                            {project.postprod_main_description || "Aucun détail de post-production pour ce projet."}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Colonne de droite : Vidéo */}
                    <div className="aspect-video rounded-dynamic overflow-hidden border border-zinc-700 shadow-lg bg-black">
                      {getYouTubeID(project.youtube_url) && (
                        <iframe
                          src={`https://www.youtube.com/embed/${getYouTubeID(project.youtube_url)}?autoplay=0&controls=1&modestbranding=1&rel=0`}
                          title={project.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                          className="border-0 w-full h-full"
                        ></iframe>
                      )}
                    </div>
                  </div>

                  {/* Section basse : Comparaisons d'images (Aperçu Principal uniquement) */}
                  {project.postprod_before_path && project.postprod_after_path && (
                    <div className="space-y-8 border-t border-zinc-700 pt-8 mt-8">
                      <div className="mb-8">
                        <div className="max-w-[250px] sm:max-w-[300px] mx-auto">
                          <ImageCompareSlider
                            beforeImage={supabase.storage.from('postprod-images').getPublicUrl(project.postprod_before_path).data.publicUrl}
                            afterImage={supabase.storage.from('postprod-images').getPublicUrl(project.postprod_after_path).data.publicUrl}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8 border-t border-zinc-700 pt-6">
                    <Link href={`/realisations/${project.id}`} className="inline-flex items-center gap-2 text-primary hover:text-foreground text-sm font-bold">
                      Voir le projet complet <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}