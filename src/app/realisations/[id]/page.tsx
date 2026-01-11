"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import { 
  ArrowLeft, Calendar, Briefcase, ExternalLink, Info, 
  Share2, Check, Wind, Layers, AlignLeft, User, Globe,
  Cpu, Activity
} from "lucide-react";

export default function RealisationDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  const handleShare = async () => {
    if (!project) return;
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: project.title, url }); return; } catch (err) {}
    }
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent animate-spin rounded-dynamic"></div>
    </div>
  );

  if (!project) return null;

  const videoId = getYouTubeID(project.youtube_url);
  const isShort = project.youtube_url.includes('/shorts/') || project.category?.includes('Short');

  // NETTOYAGE DES TAGS DANS LA DESCRIPTION GÉNÉRALE
  const cleanDescription = project.description
    ? project.description
        .split('[DRONE]:')[0]
        .split('[POST-PROD]:')[0]
        .trim()
    : null;

  return (
    <main className="min-h-screen bg-background text-white pb-24 pt-32 px-4 md:px-8">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-10 border-b border-zinc-900 pb-6">
          <button onClick={() => router.back()} className="inline-flex items-center text-zinc-500 hover:text-primary transition group uppercase text-[10px] font-black tracking-[0.3em]">
            <ArrowLeft className="mr-3 group-hover:-translate-x-2 transition-transform" size={14} /> Retour
          </button>
          <div className="flex items-center gap-6">
             <button onClick={handleShare} className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors group relative">
                <span className={`text-[9px] font-bold uppercase transition-all ${isCopied ? "text-primary opacity-100" : "opacity-0"}`}>Copié !</span>
                <div className={`p-2 rounded-dynamic transition-all ${isCopied ? "bg-primary text-black" : "bg-card group-hover:bg-zinc-800"}`}>
                   {isCopied ? <Check size={14} /> : <Share2 size={14} />}
                </div>
             </button>
          </div>
        </div>

        {/* --- VIDEO PLAYER --- */}
        <div className="flex justify-center w-full mb-16">
            <div className={`relative bg-black border border-zinc-800 shadow-2xl shadow-black overflow-hidden group ${isShort ? 'w-[350px] aspect-[9/16] rounded-dynamic' : 'w-full aspect-video rounded-dynamic'}`}>
              {videoId ? (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&fs=1`}
                  title={project.title}
                  // C'EST ICI LA CORRECTION PRINCIPALE : ajout de "fullscreen"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-700 font-bold uppercase text-xs">Vidéo non disponible</div>
              )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* --- COLONNE GAUCHE : LES TEXTES --- */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Titre & Tags */}
            <div>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.9] mb-6">
                {project.title}<span className="text-primary">.</span>
              </h1>
              <div className="flex flex-wrap gap-2">
                {project.category?.split(',').map((cat: string, i: number) => (
                  <span key={i} className="text-[9px] font-black uppercase tracking-widest border border-primary bg-transparent px-3 py-1.5 text-primary rounded-dynamic">
                    {cat.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* 1. Contexte Général (NETTOYÉ) */}
            {cleanDescription && (
              <div className="prose prose-invert max-w-none">
                <div className="flex items-center gap-3 text-zinc-500 mb-4">
                  <div className="h-[1px] w-8 bg-primary"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Brief Mission</span>
                </div>
                <p className="text-zinc-300 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                  {cleanDescription}
                </p>
              </div>
            )}

            {/* --- BLOCS TECHNIQUES --- */}
            <div className="grid grid-cols-1 gap-6">

              {/* 2. Bloc DRONE (Style "Flight HUD") */}
              {project.description_drone && (
                <div className="group relative overflow-hidden rounded-dynamic border border-blue-500/20 bg-gradient-to-br from-blue-950/30 to-black p-8 transition-all hover:border-blue-500/40">
                  <Wind className="absolute -right-6 -bottom-6 h-40 w-40 text-blue-500/5 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6 duration-700" />
                  <div className="relative z-10">
                    <div className="mb-6 flex items-center gap-3 border-b border-blue-500/20 pb-4">
                      <div className="rounded-full bg-blue-500/10 p-2 text-blue-400">
                        <Activity size={18} />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-100">
                        Données de Vol
                      </h3>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-blue-200/80 font-mono">
                      {project.description_drone}
                    </p>
                  </div>
                </div>
              )}

              {/* 3. Bloc POST-PROD (Style "Studio Darkroom") */}
              {project.description_postprod && (
                <div className="group relative overflow-hidden rounded-dynamic border border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-black p-8 transition-all hover:border-purple-500/40">
                  <Cpu className="absolute -right-6 -bottom-6 h-40 w-40 text-purple-500/5 -rotate-12 transition-transform group-hover:scale-110 group-hover:-rotate-6 duration-700" />
                  <div className="relative z-10">
                    <div className="mb-6 flex items-center gap-3 border-b border-purple-500/20 pb-4">
                      <div className="rounded-full bg-purple-500/10 p-2 text-purple-400">
                        <Layers size={18} />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-purple-100">
                        Post-Process & VFX
                      </h3>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-purple-200/80 font-mono">
                      {project.description_postprod}
                    </p>
                  </div>
                </div>
              )}
              
            </div>
          </div>

          {/* --- COLONNE DROITE : INFOS STICKY --- */}
          <div className="lg:col-span-4">
            <div className="bg-card backdrop-blur-md border border-primary p-8 rounded-dynamic sticky top-32 shadow-xl">
              <h3 className="text-[10px] font-black uppercase text-primary mb-8 tracking-[0.4em] flex items-center gap-2 border-b border-primary pb-4">
                <Info size={14}/> Fiche Technique
              </h3>
              
              <div className="space-y-8">
                {/* Date */}
                <div>
                  <span className="text-primary text-[9px] font-black uppercase tracking-widest block mb-2">Date de sortie</span>
                  <span className="text-sm font-bold uppercase text-white flex items-center gap-3 bg-zinc-900/50 p-3 rounded border border-zinc-800">
                     <Calendar size={14} className="text-primary"/>
                     {project.project_date ? new Date(project.project_date).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long' }) : "Non spécifiée"}
                  </span>
                </div>

                {/* Client */}
                <div>
                  <span className="text-primary text-[9px] font-black uppercase tracking-widest block mb-2">Client / Production</span>
                  <span className="text-sm font-bold uppercase text-white flex items-center gap-3 bg-zinc-900/50 p-3 rounded border border-zinc-800">
                     <User size={14} className="text-primary"/>
                     {project.client_name || "Interne"}
                  </span>
                </div>
                
                {/* Type de mission */}
                <div>
                   <span className="text-primary text-[9px] font-black uppercase tracking-widest block mb-2">Classification</span>
                   <span className="text-sm font-bold uppercase text-white flex items-center gap-3 bg-zinc-900/50 p-3 rounded border border-zinc-800">
                      <Briefcase size={14} className="text-primary"/>
                      {project.category?.includes('Drone') ? 'Opération Aérienne' : 'Studio Créatif'}
                   </span>
                </div>

                {/* Site Web */}
                {project.client_website && (
                  <a href={project.client_website} target="_blank" rel="noopener noreferrer" 
                     className="group block w-full mt-6">
                    <div className="bg-zinc-100 hover:bg-primary text-black py-4 rounded-dynamic transition-all flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:shadow-primary/20">
                      <Globe size={14} /> Voir le site
                      <ExternalLink size={10} className="opacity-50 group-hover:translate-x-1 transition-transform"/>
                    </div>
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