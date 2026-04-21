import { createSupabaseServerClient } from "@/app/server";
import { notFound } from "next/navigation";
import { getYouTubeID } from "@/lib/utils";
import type { Metadata } from 'next';
import { ImageCompareSlider } from "@/components/ImageCompareSlider";
import { Calendar, User, Globe, Wind, Layers, AlignLeft, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Cette fonction génère les métadonnées dynamiques pour chaque projet
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: project } = await supabase.from('portfolio_items').select('title, description').eq('id', params.id).single();

  if (!project) {
    return { title: 'Projet introuvable' };
  }

  return {
    title: project.title,
    description: project.description || `Découvrez le projet ${project.title} réalisé par La Crysalys.`,
  };
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: project } = await supabase
    .from('portfolio_items')
    .select('*, portfolio_item_categories(categories(name))')
    .eq('id', params.id)
    .single();

  if (!project) {
    notFound();
  }

  const videoId = getYouTubeID(project.youtube_url);

  // --- Gestion Hybride des Catégories ---
  const rawCategories = (project as any).portfolio_item_categories;
  const mappedCategories = Array.isArray(rawCategories) 
    ? rawCategories.map((c: any) => c.categories?.name).filter(Boolean) 
    : [];

  const rawOldCategory = project.category as any;
  let oldCategories: string[] = [];
  if (Array.isArray(rawOldCategory)) {
    oldCategories = rawOldCategory;
  } else if (typeof rawOldCategory === 'string' && rawOldCategory.length > 0) {
    oldCategories = rawOldCategory.replace(/^\{|\}$/g, '').split(',').map((s: string) => s.replace(/^"|"$/g, '').trim());
  }
  const categoriesList = oldCategories.length > 0 ? oldCategories : mappedCategories;

  // --- Génération des URLs d'images pour le comparateur ---
  const beforeImageUrl = project.postprod_before_path 
    ? supabase.storage.from('postprod-images').getPublicUrl(project.postprod_before_path).data.publicUrl 
    : null;
  const afterImageUrl = project.postprod_after_path 
    ? supabase.storage.from('postprod-images').getPublicUrl(project.postprod_after_path).data.publicUrl 
    : null;

  // Schéma VideoObject pour Google
  const videoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    'name': project.title,
    'description': project.description || project.postprod_main_description || "Un projet réalisé par La Crysalys.",
    'thumbnailUrl': videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '',
    'uploadDate': project.project_date,
    'embedUrl': videoId ? `https://www.youtube.com/embed/${videoId}` : '',
    'publisher': { '@type': 'Organization', 'name': 'La Crysalys', 'logo': { '@type': 'ImageObject', 'url': 'https://la-crysalys.vercel.app/Logo/logo_v_blanc.png' } }
  };

  return (
    <main className="pt-32 pb-20 px-4 max-w-5xl mx-auto min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }} />
      
      <Link href="/realisations" className="inline-flex items-center gap-2 text-foreground/50 hover:text-primary transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
        <ArrowLeft size={16} /> Retour aux réalisations
      </Link>

      <header className="mb-12">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-primary mb-6">
          {project.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-foreground/70 text-sm">
          {project.project_date && (
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(project.project_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          )}
          {project.client_name && (
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{project.client_name}</span>
            </div>
          )}
          {project.client_website && (
            <a href={project.client_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Globe size={16} />
              <span>Site Web</span>
            </a>
          )}
        </div>

        {categoriesList.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {categoriesList.map((cat: string, i: number) => (
              <span key={i} className="text-xs bg-primary/10 border border-primary/30 text-primary px-3 py-1 rounded-full uppercase font-bold tracking-wide">
                {cat}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="aspect-video rounded-dynamic overflow-hidden border border-zinc-800 shadow-2xl bg-black mb-16">
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1&rel=0`}
            title={project.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="w-full h-full border-0"
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900/50">
            <span className="text-foreground/50 text-sm font-bold uppercase tracking-widest">Vidéo indisponible</span>
          </div>
        )}
      </div>

      <div className="space-y-12">
        {project.description && (
          <section className="bg-card p-8 rounded-dynamic border border-zinc-800 shadow-lg">
            <h2 className="text-xl font-black flex items-center gap-2 text-foreground mb-4 uppercase tracking-widest">
              <AlignLeft size={20} className="text-primary"/> Contexte Général
            </h2>
            <div className="prose prose-invert max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </div>
          </section>
        )}

        {project.description_drone && (
          <section className="bg-blue-950/10 p-8 rounded-dynamic border border-blue-900/30 shadow-lg">
            <h2 className="text-xl font-black flex items-center gap-2 text-blue-400 mb-4 uppercase tracking-widest">
              <Wind size={20} /> Prises de Vues Drone
            </h2>
            <div className="prose prose-invert max-w-none text-blue-100/70 leading-relaxed whitespace-pre-wrap">
              {project.description_drone}
            </div>
          </section>
        )}

        {(project.postprod_main_description || (beforeImageUrl && afterImageUrl)) && (
          <section className="bg-purple-950/10 p-8 rounded-dynamic border border-purple-900/30 shadow-lg">
            <h2 className="text-xl font-black flex items-center gap-2 text-purple-400 mb-4 uppercase tracking-widest">
              <Layers size={20} /> Post-Production & VFX
            </h2>
            
            {project.postprod_main_description && (
              <div className="prose prose-invert max-w-none text-purple-100/70 leading-relaxed whitespace-pre-wrap mb-8">
                {project.postprod_main_description}
              </div>
            )}

            {beforeImageUrl && afterImageUrl && (
              <div className="mt-8 border-t border-purple-900/30 pt-8">
                <h3 className="text-sm font-bold text-purple-400/50 uppercase tracking-widest mb-4 text-center">Comparatif Avant / Après</h3>
                <div className="max-w-4xl mx-auto rounded-dynamic overflow-hidden border border-purple-900/50 shadow-2xl">
                  <ImageCompareSlider
                    beforeImage={beforeImageUrl}
                    afterImage={afterImageUrl}
                  />
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}