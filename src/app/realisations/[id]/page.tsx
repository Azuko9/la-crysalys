"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import Link from "next/link";
import { 
  ArrowLeft, Calendar, Briefcase, ExternalLink, 
  Info, Play, Monitor, Share2
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
        <div className="w-12 h-12 border border-green-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!project) return null;

  const videoId = getYouTubeID(project.youtube_url);
  const isShort = project.youtube_url.includes('/shorts/') || project.category?.includes('Short');

  return (
    <main className="min-h-screen bg-black text-white pb-24 pt-32 px-4 md:px-8">
      
      <div className="max-w-[1600px] mx-auto relative z-10">
        
        {/* BARRE DE NAVIGATION BRUTALISTE */}
        <div className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-4">
            <Link 
              href="/realisations" 
              className="inline-flex items-center text-zinc-500 hover:text-white transition group uppercase text-[10px] font-black tracking-[0.3em]"
            >
              <ArrowLeft className="mr-3 group-hover:-translate-x-2 transition-transform" size={16} />
              Back to Portfolio
            </Link>
            <div className="flex items-center gap-6">
                <span className="text-zinc-800 font-bold text-[10px] uppercase tracking-[0.3em]">REF_{project.id.slice(0,8).toUpperCase()}</span>
                <Share2 size={16} className="text-zinc-600 hover:text-green-500 cursor-pointer transition-colors" />
            </div>
        </div>

        {/* --- SECTION VIDÉO IMMERSIVE --- */}
        <div className={`w-full mb-20 ${isShort ? 'flex justify-center' : ''}`}>
            <div className={`relative rounded-none overflow-hidden border border-zinc-800 bg-zinc-950 w-full 
              ${isShort ? 'max-w-[600px] aspect-[9/16] shadow-2xl shadow-green-500/10' : 'aspect-video'}`}>
              
              {videoId ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1`}
                  title={project.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-800 font-black uppercase italic">No Signal</div>
              )}
            </div>
        </div>

        {/* --- SECTION INFORMATIONS --- */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          <div className="lg:col-span-8 space-y-12">
            <div>
              <h1 className="text-6xl md:text-[8rem] font-black italic uppercase tracking-tighter leading-[0.8] mb-8">
                {project.title}
              </h1>
              <div className="flex flex-wrap gap-3">
                  {project.category.split(',').map((cat, i) => (
                      <span key={i} className="text-[10px] font-black uppercase tracking-[0.2em] border border-zinc-800 px-4 py-2 text-zinc-400">
                          {cat.trim()}
                      </span>
                  ))}
              </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 text-zinc-700">
                    <Monitor size={14}/>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Technical_Notes</span>
                </div>
                <p className="text-zinc-400 text-2xl leading-tight whitespace-pre-line font-medium border-l-2 border-green-500 pl-8 italic">
                {project.description || "No technical specifications provided."}
                </p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900/10 p-8 border border-zinc-800">
                <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-10 tracking-[0.4em] flex items-center gap-2">
                  <Info size={14}/> Project_Data
                </h3>
                
                <div className="space-y-8">
                  <div className="flex flex-col gap-2">
                      <span className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">Release Date</span>
                      <span className="text-xl font-bold uppercase italic text-white flex items-center gap-4">
                          <Calendar size={18} className="text-green-500"/>
                          {project.project_date ? new Date(project.project_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : "--"}
                      </span>
                  </div>

                  {project.client_name && (
                    <div className="flex flex-col gap-2 border-t border-zinc-900 pt-6">
                        <span className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">Client / Partner</span>
                        <span className="text-xl font-bold uppercase italic text-white flex items-center gap-4">
                            <Briefcase size={18} className="text-green-500"/>
                            {project.client_name}
                        </span>
                    </div>
                  )}

                  {project.client_website && (
                      <a 
                          href={project.client_website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 w-full bg-white text-black font-black py-5 hover:bg-green-600 hover:text-white transition-all uppercase text-[10px] tracking-[0.3em] mt-8"
                      >
                          External Link <ExternalLink size={14} />
                      </a>
                  )}
                </div>
            </div>
          </div>
        </div>

        {/* CTA SECTION - STYLE BRUTALISTE */}
        <div className="mt-40 border border-zinc-800 p-12 flex flex-col md:flex-row justify-between items-center gap-12 bg-zinc-900/5">
            <div className="text-center md:text-left">
                <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.8]">
                    Ready to <br /> <span className="text-green-500">Produce?</span>
                </h2>
            </div>
            <Link href="/contact" className="group bg-green-600 text-black px-16 py-8 font-black uppercase text-sm tracking-[0.3em] hover:bg-white transition-all flex items-center gap-4">
                Start Project <Play size={18} className="fill-current" />
            </Link>
        </div>

      </div>
    </main>
  );
}