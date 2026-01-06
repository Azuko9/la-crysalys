"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Calendar, Briefcase, ExternalLink, RotateCcw } from "lucide-react";

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
      </div>
    );
  }

  if (!project) return null;

  const videoId = getYouTubeID(project.youtube_url);
  const isShort = project.youtube_url.includes('/shorts/');

  return (
    <main className="min-h-screen bg-black text-white pb-20 pt-28 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* BOUTON RETOUR */}
        <Link 
          href="/realisations" 
          className="inline-flex items-center text-zinc-500 hover:text-green-500 transition mb-10 group uppercase text-xs font-bold tracking-widest"
        >
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={16} />
          Retour au Portfolio
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LECTEUR VIDÉO (Adaptatif selon format) */}
          <div className={`lg:col-span-7 xl:col-span-8 ${isShort ? 'flex justify-center' : ''}`}>
            <div className={`relative rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-zinc-900 w-full 
              ${isShort ? 'max-w-[400px] aspect-[9/16]' : 'aspect-video'}`}>
              
              {videoId ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  /* loop=1 + playlist=ID permet de boucler sur YouTube */
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&loop=1&playlist=${videoId}`}
                  title={project.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-700 italic">Contenu indisponible</div>
              )}

              {isShort && (
                <div className="absolute bottom-4 left-4 bg-red-600/90 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-2">
                  <RotateCcw size={12} className="animate-spin-slow" /> LECTURE EN BOUCLE
                </div>
              )}
            </div>
          </div>

          {/* INFOS DU PROJET */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8">
            <div>
                <span className="text-green-500 text-[10px] font-black uppercase tracking-[0.3em] bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                    {project.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-black mt-8 leading-none italic uppercase tracking-tighter">
                    {project.title}
                </h1>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Description</h3>
                <p className="text-zinc-400 text-lg leading-relaxed whitespace-pre-line italic">
                {project.description || "Pas de description pour ce projet."}
                </p>
            </div>

            <div className="bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800/50 space-y-6">
                {/* DATE */}
                <div className="flex items-center gap-4">
                    <Calendar size={18} className="text-green-500" />
                    <p className="text-zinc-300 text-sm font-medium">
                        {project.project_date ? new Date(project.project_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : "Date inconnue"}
                    </p>
                </div>

                {/* CLIENT */}
                {project.client_name && (
                    <div className="flex items-center gap-4">
                        <Briefcase size={18} className="text-green-500" />
                        <p className="text-zinc-300 text-sm font-medium">{project.client_name}</p>
                    </div>
                )}

                {/* LIEN EXTERNE */}
                {project.client_website && (
                    <a 
                        href={project.client_website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-green-500 hover:text-white transition-all group uppercase text-xs tracking-widest"
                    >
                        Projet en ligne <ExternalLink size={16} />
                    </a>
                )}
            </div>
          </div>

        </div>

        {/* FOOTER ACTION */}
        <div className="mt-32 pt-16 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center md:text-left">
                Prêt pour votre <span className="text-green-500">prochain projet ?</span>
            </h2>
            <Link href="/contact" className="bg-zinc-900 border border-zinc-800 px-10 py-5 rounded-full font-bold hover:border-green-500 transition-colors uppercase text-sm tracking-widest">
                Nous contacter
            </Link>
        </div>

      </div>
    </main>
  );
}