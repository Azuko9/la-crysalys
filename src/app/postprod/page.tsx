import { supabase } from "@/lib/supabaseClient";
import type { Project } from '@/types';
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
  // 1. Récupérer les projets qui ont la catégorie "Post-Prod"
  const { data: projects, error: projectsError } = await supabase
    .from('portfolio_items')
    .select('*')
    .like('category', '%Post-Prod%')
    .not('postprod_main_description', 'is', null) // S'assurer qu'il y a une description
    .order('project_date', { ascending: false });

  if (projectsError) {
    console.error("Erreur lors de la récupération des projets pour la page post-production:", projectsError);
  }

  return (
    <main className="min-h-screen bg-background text-white pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* En-tête de la page */}
        <header className="text-center mb-16">
          <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Savoir-Faire</p>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
            Post-Production & VFX
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-zinc-400 text-lg">
            Du montage à l'étalonnage, en passant par les effets spéciaux, nous sublimons vos images pour un résultat percutant et professionnel.
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
              {projects.map((project: Project) => (
                <div key={project.id} className="bg-card border border-zinc-800 rounded-dynamic p-8">
                  {/* Section haute : Texte et Vidéo */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Colonne de gauche : Texte */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-purple-400 mb-3 flex items-center gap-2 italic uppercase tracking-tighter">
                        <Layers size={22}/> {project.title}
                      </h3>
                      {project.postprod_main_description && (
                        <div className="prose prose-sm prose-invert prose-zinc max-w-none text-zinc-400 leading-relaxed">
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
                          className="border-0 w-full h-full"
                        ></iframe>
                      )}
                    </div>
                  </div>

                  {/* Section basse : Comparaisons d'images */}
                  {(project.postprod_before_url || (Array.isArray(project.description_postprod) && project.description_postprod.length > 0)) && (
                    <div className="space-y-8 border-t border-zinc-700 pt-8 mt-8">
                    {project.postprod_before_url && project.postprod_after_url && (
                      <div className="mb-8">
                        <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest mb-4">Aperçu Global Avant/Après</p>
                        <ImageCompareSlider beforeImage={project.postprod_before_url} afterImage={project.postprod_after_url} />
                      </div>
                    )}

                    {Array.isArray(project.description_postprod) && project.description_postprod.length > 0 && (
                      <div className="space-y-8">
                        {project.description_postprod.map((item, index) => (
                          <div key={index}>
                            <p className="text-white font-bold mb-4 text-base"> #{index + 1}: <span className="text-purple-300 font-medium">{item.detail}</span></p>
                            {item.before_url && item.after_url && (
                              <ImageCompareSlider beforeImage={item.before_url} afterImage={item.after_url} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                  )}
                  
                  <div className="mt-8 border-t border-zinc-700 pt-6">
                    <Link href={`/realisations/${project.id}`} className="inline-flex items-center gap-2 text-primary hover:text-white text-sm font-bold">
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