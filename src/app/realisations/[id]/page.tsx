"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import { ArrowLeft, Calendar, Briefcase, ExternalLink, Info, Monitor, Share2, Check } from "lucide-react";

export default function RealisationDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // État pour gérer l'animation de copie du lien
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase.from("portfolio_items").select("*").eq("id", id).single();
      if (error || !data) router.push("/realisations");
      else setProject(data);
      setLoading(false);
    };
    if (id) fetchProject();
  }, [id, router]);

  // --- FONCTION DE PARTAGE INTELLIGENTE ---
  const handleShare = async () => {
    if (!project) return;
    
    const shareData = {
      title: project.title,
      text: `Découvre le projet "${project.title}" réalisé par Crysalys.`,
      url: window.location.href, // L'URL actuelle de la page
    };

    // 1. Essayer le partage natif (Mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return; 
      } catch (err) {
        console.log("Partage annulé ou non supporté, passage au copier-coller.");
      }
    }

    // 2. Fallback : Copier dans le presse-papier (Desktop)
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Remet l'icône normale après 2s
    } catch (err) {
      console.error("Échec de la copie", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent animate-spin rounded-dynamic"></div>
    </div>
  );

  if (!project) return null;

  const videoId = getYouTubeID(project.youtube_url);
  const isShort = project.youtube_url.includes('/shorts/') || project.category?.includes('Short');

  return (
    <main className="min-h-screen bg-background text-white pb-24 pt-32 px-4 md:px-8">
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* --- HEADER NAVIGATION --- */}
        <div className="flex justify-between items-center mb-10 border-b border-zinc-900 pb-6">
          
          {/* BOUTON RETOUR (Router Back) */}
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center text-zinc-500 hover:text-primary transition group uppercase text-[10px] font-black tracking-[0.3em]"
          >
            <ArrowLeft className="mr-3 group-hover:-translate-x-2 transition-transform" size={14} />
            Retour
          </button>

          <div className="flex items-center gap-6">
             <span className="text-[9px] font-black text-zinc-700 uppercase hidden sm:block">REF_{project.id.slice(0,4)}</span>
             
             {/* --- BOUTON SHARE FONCTIONNEL --- */}
             <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors group relative"
                title="Partager ce projet"
             >
                <span className={`text-[9px] font-bold uppercase transition-all duration-300 ${isCopied ? "text-primary opacity-100" : "opacity-0 -translate-x-2"}`}>
                  Lien copié !
                </span>
                <div className={`p-2 rounded-dynamic transition-all duration-300 ${isCopied ? "bg-primary text-black" : "bg-card group-hover:bg-zinc-800"}`}>
                   {isCopied ? <Check size={14} /> : <Share2 size={14} />}
                </div>
             </button>
          </div>
        </div>

        {/* --- CONTENEUR VIDÉO (Format "Boxed") --- */}
        <div className="flex justify-center w-full mb-12">
            <div className={`relative bg-black border border-zinc-800 shadow-2xl shadow-black overflow-hidden
              ${isShort ? 'w-[300px] aspect-[9/16]' : 'w-full max-w-3xl aspect-video'}`}
            >
              {videoId ? (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&fs=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-700 font-bold uppercase text-xs">
                  Vidéo non disponible
                </div>
              )}
            </div>
        </div>

        {/* --- CONTENU --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* GAUCHE */}
          <div className="md:col-span-8 space-y-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-4">
                {project.title}<span className="text-primary">.</span>
              </h1>
              <div className="flex flex-wrap gap-2">
                {project.category?.split(',').map((cat: string, i: number) => (
                  <span key={i} className="text-[8px] font-bold uppercase tracking-widest border border-zinc-800 bg-card px-2 py-1 text-zinc-500 rounded">
                    {cat.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-600">
                <Monitor size={12}/>
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Notes_Production</span>
              </div>
              <p className="text-zinc-400 text-base md:text-lg leading-relaxed font-medium border-l-2 border-primary pl-5 italic">
                {project.description || "Aucune description disponible."}
              </p>
            </div>
          </div>

          {/* DROITE (Sticky) */}
          <div className="md:col-span-4">
            <div className="bg-card backdrop-blur-sm border border-zinc-800 p-6 rounded-dynamic sticky top-24">
              <h3 className="text-[9px] font-black uppercase text-zinc-500 mb-6 tracking-[0.3em] flex items-center gap-2">
                <Info size={12}/> Détails
              </h3>
              
              <div className="space-y-6">
                <div className="group">
                  <span className="text-zinc-700 text-[8px] font-black uppercase tracking-widest block mb-1">Date</span>
                  <span className="text-sm font-bold uppercase text-white flex items-center gap-2">
                     <Calendar size={14} className="text-primary"/>
                     {project.project_date ? new Date(project.project_date).getFullYear() : "N/A"}
                  </span>
                </div>

                <div className="group">
                  <span className="text-zinc-700 text-[8px] font-black uppercase tracking-widest block mb-1">Client</span>
                  <span className="text-sm font-bold uppercase text-white flex items-center gap-2">
                     <Briefcase size={14} className="text-primary"/>
                     {project.client_name || "Interne"}
                  </span>
                </div>

                {project.client_website && (
                  <a href={project.client_website} target="_blank" rel="noopener noreferrer" 
                     className="block w-full text-center bg-zinc-800 hover:bg-primary hover:text-black text-white py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded mt-4 flex items-center justify-center gap-2">
                    Voir le lien <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}