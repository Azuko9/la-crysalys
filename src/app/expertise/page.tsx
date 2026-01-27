import type { Project } from '@/types';
import { createSupabaseServerClient } from '@/app/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import FeaturesSection from '@/components/FeaturesSection';
import { getYouTubeID } from "@/lib/utils"; // Import de la fonction pour obtenir l'ID YouTube
import { Wind, ArrowRight } from "lucide-react"; // Import des icônes

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Expertise Drone - La Crysalys',
  description: 'Découvrez notre savoir-faire en prises de vues par drone. Des services professionnels pour des images aériennes cinématographiques et percutantes.',
};

export default async function ExpertiseDronePage() {
  const supabase = createSupabaseServerClient();

  // 2. Récupérer les projets qui ont la catégorie "Drone"
  const { data: projects, error: projectsError } = await supabase
    .from('portfolio_items')
    // OPTIMISATION: Ne sélectionnez que les colonnes nécessaires pour cette page.
    .select('id, title, youtube_url, description_drone') // Ces colonnes définissent le type réel des projets récupérés
    // CORRECTION : .contains() ne fonctionne que si la colonne 'category' est de type tableau (text[]).
    // Rétablissement de .like() pour une compatibilité immédiate. La meilleure solution reste de migrer la colonne.
    .like('category', '%Drone%')
    .order('project_date', { ascending: false });

  if (projectsError) {
    console.error("Erreur lors de la récupération des projets pour la page expertise:", projectsError);
  }


  return (
    <main className="min-h-screen bg-background text-white pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* En-tête de la page */}
        <header className="text-center mb-16">
          <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Savoir-Faire</p>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
            Expertise Drone
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-zinc-400 text-lg">
            Nous maîtrisons l'art de la prise de vue aérienne pour offrir des perspectives uniques et des images à couper le souffle.
          </p>
        </header>

        {/* Section des atouts (Features) */}
        <section className="mb-20">
          <FeaturesSection pageContext="expertise" />
        </section>

        {/* Section des projets liés au drone */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-3xl font-black text-center mb-12 text-primary italic uppercase tracking-tighter">Nos Réalisations Drone</h2>
            <div className="space-y-16">
              {projects.map((project: Pick<Project, 'id' | 'title' | 'youtube_url' | 'description_drone'>) => (
                <div key={project.id} className="bg-card border border-zinc-800 rounded-dynamic p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Colonne de gauche : Texte */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-blue-400 mb-3 flex items-center gap-2 italic uppercase tracking-tighter">
                        <Wind size={22}/> {project.title}
                      </h3>
                      <div className="prose prose-sm prose-invert prose-zinc max-w-none text-zinc-400 leading-relaxed">
                        <p className="line-clamp-6">
                          {project.description_drone || "Aucune spécificité drone détaillée pour ce projet."}
                        </p>
                      </div>
                    </div>

                    {/* Colonne de droite : Vidéo */}
                    <div className="aspect-video rounded-dynamic overflow-hidden border border-zinc-700 shadow-lg bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeID(project.youtube_url)}?autoplay=0&controls=1&modestbranding=1&rel=0`}
                        title={project.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="border-0 w-full h-full"
                      ></iframe>
                    </div>
                  </div>
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