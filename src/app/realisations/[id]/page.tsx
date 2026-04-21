import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/app/server";
import type { Metadata } from 'next';
import type { Project } from "@/types";
import Script from "next/script";
import { getYouTubeID } from "@/lib/utils";
import { ImageCompareSlider } from "@/components/ImageCompareSlider";
import Link from "next/link";
import { ArrowLeft, User, Globe } from "lucide-react";



type Props = {
  params: { id: string }
}

// --- 1. OPEN GRAPH & SEO (Réseaux Sociaux) ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createSupabaseServerClient();

  const { data: project } = await supabase
    .from('portfolio_items')
    .select('id, title, description, youtube_url')
    .eq('id', params.id)
    .single();

  if (!project) {
    return { title: 'Projet introuvable | La Crysalys' };
  }

  const videoId = getYouTubeID(project.youtube_url || '');
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '/og-image.jpg';

  return {
    title: `${project.title} | La Crysalys`,
    description: project.description || `Découvrez la réalisation audiovisuelle : ${project.title}`,
    openGraph: {
      title: `${project.title} | La Crysalys`,
      description: project.description || '',
      url: `https://la-crysalys.vercel.app/realisations/${project.id}`,
      type: 'video.movie',
      images: [{ url: thumbnailUrl, width: 1280, height: 720 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} | La Crysalys`,
      description: project.description || '',
      images: [thumbnailUrl],
    }
  }
}

// --- 2. COMPOSANT SERVEUR (Performances Maximales) ---
export default async function RealisationDetailPage({ params }: { params: { id: string } }) {


  const supabase = createSupabaseServerClient();

  const { data: projectData, error } = await supabase.from('portfolio_items').select('*').eq('id', params.id).single();

  if (error || !projectData) {
    notFound();
  }

  // Nettoyage des données JSON
  let postprodDetails: any[] = [];
  if (projectData.description_postprod) {
    if (typeof projectData.description_postprod === 'string') {
      try { postprodDetails = JSON.parse(projectData.description_postprod); } catch (e) {}
    } else if (Array.isArray(projectData.description_postprod)) {
      postprodDetails = projectData.description_postprod;
    }
  }

  const videoId = getYouTubeID(projectData.youtube_url || '');

  // --- 3. JSON-LD (Rich Snippets Vidéo pour Google) ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": projectData.title,
    "description": projectData.description || `Découvrez la réalisation audiovisuelle : ${projectData.title} par La Crysalys.`,
    "thumbnailUrl": [videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "https://la-crysalys.vercel.app/og-image.jpg"],
    "uploadDate": projectData.project_date || projectData.created_at || new Date().toISOString(),
    "embedUrl": videoId ? `https://www.youtube.com/embed/${videoId}` : "",
    "publisher": {
      "@type": "Organization",
      "name": "La Crysalys",
      "logo": { "@type": "ImageObject", "url": "https://la-crysalys.vercel.app/Logo/logoAfficheBlanc.png" }
    }
  };

  const getImageUrl = (path: string | null) => path ? supabase.storage.from('postprod-images').getPublicUrl(path).data.publicUrl : '';

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-20 px-4 md:px-8">
      {/* Injection SEO invisible pour Google */}
      <Script id="video-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-5xl mx-auto">
        <Link href="/realisations" className="inline-flex items-center gap-2 text-foreground/50 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest mb-8">
          <ArrowLeft size={16} /> Retour au portfolio
        </Link>

        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4 text-primary">
          {projectData.title}
        </h1>

        {/* Infos Client */}
        {(projectData.client_name || projectData.client_website) && (
           <div className="flex flex-wrap gap-4 mb-8 text-xs font-bold uppercase tracking-widest text-foreground/60">
              {projectData.client_name && <span className="flex items-center gap-2"><User size={14}/> {projectData.client_name}</span>}
              {projectData.client_website && <a href={projectData.client_website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors"><Globe size={14}/> Site Web</a>}
           </div>
        )}
        
        {projectData.description && (
          <p className="text-foreground/80 text-lg mb-12 leading-relaxed">
            {projectData.description}
          </p>
        )}

        {videoId && (
          <div className="aspect-video w-full rounded-dynamic overflow-hidden border border-zinc-800 shadow-2xl bg-black mb-16">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1&rel=0`}
              title={projectData.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            ></iframe>
          </div>
        )}

        {/* Post Production Section (Si applicable) */}
        {(projectData.postprod_before_path || projectData.postprod_after_path || postprodDetails.length > 0) && (
          <div className="mt-16 space-y-12 border-t border-zinc-800 pt-16">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-purple-400 mb-8">Détails de Post-Production</h2>
            {projectData.postprod_main_description && <p className="text-foreground/70 mb-8 leading-relaxed">{projectData.postprod_main_description}</p>}

            {projectData.postprod_before_path && projectData.postprod_after_path && (
              <div className="mb-12">
                <div className="max-w-xl mx-auto rounded-dynamic overflow-hidden shadow-xl">
                  <ImageCompareSlider beforeImage={getImageUrl(projectData.postprod_before_path)} afterImage={getImageUrl(projectData.postprod_after_path)} />
                </div>
              </div>
            )}

            {postprodDetails.map((detail, index) => (
              <div key={index} className="mb-12">
                <h3 className="text-lg font-bold mb-4 text-purple-300">{detail.detail}</h3>
                {detail.before_path && detail.after_path && (
                  <div className="max-w-xl mx-auto rounded-dynamic overflow-hidden shadow-xl">
                    <ImageCompareSlider beforeImage={getImageUrl(detail.before_path)} afterImage={getImageUrl(detail.after_path)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}