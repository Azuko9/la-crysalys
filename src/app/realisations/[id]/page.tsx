"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import Link from "next/link";
import { 
  ArrowLeft, Calendar, Briefcase, ExternalLink, 
  RotateCcw, Info, Play, Maximize2 
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  youtube_url: string;
  category: string;
  description: string | null;
  client_name: string | null;
  client_website: string | null;
  project_date: string | null;
}

export default function RealisationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        router.push("/realisations");
      } else {
        setProject(data as Project);
      }
      setLoading(false);
    };

    if (id) fetchProject();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) return null;

  const videoId = getYouTubeID(project.youtube_url);
  const isShort = project.youtube_url.includes('/shorts/');

  return (
    <main className="min-h-screen bg-black text-white pb-24 pt-32 px-6 overflow-hidden">
      
      {/* BACKGROUND GLOW EFFECT */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER NAVIGATION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <Link 
            href="/realisations" 
            className="inline-flex items-center text-zinc-500 hover:text-white transition group uppercase text-[10px] font-black tracking-[0.3em]"
            >
            <ArrowLeft className="mr-3 group-hover:-translate-x-2 transition-transform" size={18} />
            Retour Portfolio
            </Link>
            
            <div className="flex items-center gap-3">
                <span className="text-zinc-700 font-bold text-[10px] uppercase tracking-widest">ID: {project.id.slice(0,8)}</span>
                <div className="h-4 w-[1px] bg-zinc-800"></div>
                <span className="text-green-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <Info size={12}/> Détails Techniques
                </span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* LECTEUR VIDÉO (Le cœur de la page) */}
          <div className={`lg:col-span-8 ${isShort ? 'flex justify-center' : ''}`}>
            <div className={`group relative rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 bg-zinc-950 w-full 
              ${isShort ? 'max-w-[450px] aspect-[9/16]' : 'aspect-video'}`}>
              
              {videoId ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&loop=1&playlist=${videoId}&controls=1&showinfo=0`}
                  title={project.title}
                  // CORRECTION : allow="fullscreen" est crucial ici
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-800 font-black uppercase italic">Flux Indisponible</div>
              )}

              {/* INDICATEURS VISUELS */}
              <div className="absolute top-6 left-6 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Live 4K Stream</span>
                </div>
              </div>

              {isShort && (
                <div className="absolute bottom-6 right-6 bg-green-600 text-black text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl">
                  <RotateCcw size={14} className="animate-spin-slow" /> REPLAY AUTO
                </div>
              )}
            </div>
          </div>

          {/* COLONNE INFOS (Style Spec-Sheet) */}
          <div className="lg:col-span-4 space-y-10">
            <div>
                <h1 className="text-6xl md:text-7xl font-black leading-[0.85] italic uppercase tracking-tighter mb-6">
                    {project.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                    {project.category.split(',').map((cat, i) => (
                        <span key={i} className="text-[10px] font-black uppercase tracking-widest border border-zinc-800 bg-zinc-900/50 px-3 py-1 rounded-md text-zinc-400">
                            {cat.trim()}
                        </span>
                    ))}
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-600">
                    <div className="h-[1px] w-4 bg-zinc-800"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Note de production</span>
                </div>
                <p className="text-zinc-400 text-lg leading-relaxed whitespace-pre-line italic border-l-2 border-green-500 pl-6">
                {project.description || "Aucune spécification technique fournie."}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* BLOC DONNÉES CLÉ */}
                <div className="bg-zinc-900/30 p-6 rounded-3xl border border-zinc-800/50 space-y-5">
                    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                        <span className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase"><Calendar size={14}/> Date</span>
                        <span className="text-xs font-bold uppercase italic">
                            {project.project_date ? new Date(project.project_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : "--"}
                        </span>
                    </div>

                    {project.client_name && (
                        <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                            <span className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase"><Briefcase size={14}/> Partenaire</span>
                            <span className="text-xs font-bold uppercase italic text-green-500">{project.client_name}</span>
                        </div>
                    )}

                    {project.client_website && (
                        <a 
                            href={project.client_website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-green-600 hover:text-white transition-all group uppercase text-[10px] tracking-widest mt-4"
                        >
                            Consulter le site <ExternalLink size={16} />
                        </a>
                    )}
                </div>
            </div>
          </div>

        </div>

        {/* CTA SECTION */}
        <div className="mt-40 p-12 bg-zinc-900/20 border border-zinc-900 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
                <p className="text-green-500 font-black uppercase text-[10px] tracking-[0.4em] mb-2">Collaboration</p>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                    Une vision <br /> <span className="text-zinc-700">À réaliser ?</span>
                </h2>
            </div>
            <Link href="/contact" className="group bg-white text-black px-12 py-6 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-green-500 hover:text-white transition-all flex items-center gap-4">
                Lancer un projet <Play size={16} className="fill-current" />
            </Link>
        </div>

      </div>
    </main>
  );
}