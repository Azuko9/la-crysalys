"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import { 
  ShieldCheck, Map, Camera, FastForward, 
  ArrowDownRight, ChevronRight, Globe, Info
} from "lucide-react";

export default function ExpertisePage() {
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrone = async () => {
      const { data } = await supabase
        .from('portfolio_items')
        .select('*')
        .ilike('category', '%Drone%')
        .order('project_date', { ascending: false });
      setProjets(data || []);
      setLoading(false);
    };
    fetchDrone();
  }, []);

  return (
    <main className="min-h-screen bg-background text-white pb-24">
      
      <section className="pt-32 pb-16 px-8 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col lg:flex-row gap-16 items-start mb-20">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] w-12 bg-primary"></div>
                <span className="text-primary font-black uppercase text-[10px] tracking-[0.4em]">Expertise Aérienne</span>
              </div>
              <h1 className="text-8xl md:text-[12rem] font-black italic uppercase tracking-tighter leading-[0.75] mb-12">
                Drone<span className="text-primary">.</span>
              </h1>
              <div className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-dynamic inline-flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest">Opérations certifiées DGAC</span>
              </div>
            </div>

            <div className="w-full lg:w-96 space-y-4">
               <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-dynamic backdrop-blur-md">
                  <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-6 tracking-widest flex items-center gap-2">
                    <Info size={14}/> Spécifications Flotte
                  </h3>
                  <div className="space-y-4 font-bold uppercase text-[11px]">
                    <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-zinc-400">Capteur</span>
                      <span>4K / 5.2K RAW</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-zinc-400">Transmission</span>
                      <span>O3+ 1080p</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-zinc-400">Stabilité</span>
                      <span>Nacelle 3 axes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Formats</span>
                      <span className="italic text-primary">Log / Prores</span>
                    </div>
                  </div>
               </div>
               <button className="group w-full bg-primary hover:bg-white text-black py-5 rounded-dynamic font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                 Demander un devis <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={<ShieldCheck size={28}/>} title="Homologué DGAC" text="Télépilotes déclarés à la Direction Générale de l'Aviation Civile." />
            <FeatureCard icon={<Map size={28}/>} title="Scénarios S1, S2, S3" text="Autorisations de vol en zone peuplée (ville) et hors agglomération." />
            <FeatureCard icon={<Camera size={28}/>} title="Qualité Cinéma" text="Capteurs 4K / 5.2K RAW pour une image exploitable en post-prod." />
            <FeatureCard icon={<FastForward size={28}/>} title="Vol FPV & Stabilisé" text="Du plan fluide et lent au vol dynamique et immersif en FPV." />
          </div>
        </div>
      </section>

      {/* GRILLE VIDÉOS */}
      <section className="px-8 max-w-7xl mx-auto mt-24">
        <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600 italic mb-16 flex items-center gap-4">
          <Globe size={14}/> Missions Récentes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {projets.map(p => (
            <ProjectItem key={p.id} project={p} />
          ))}
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, text }: any) {
  return (
    <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-dynamic hover:border-primary/50 transition-colors group">
      <div className="text-primary mb-6 group-hover:scale-110 transition-transform">{icon}</div>
      <h4 className="text-lg font-black italic uppercase mb-2">{title}</h4>
      <p className="text-xs text-zinc-500 leading-relaxed uppercase font-bold tracking-tighter">{text}</p>
    </div>
  );
}

function ProjectItem({ project }: any) {
  const videoId = getYouTubeID(project.youtube_url);
  return (
    <div className="group cursor-pointer">
      <div className="aspect-video bg-zinc-900 rounded-dynamic overflow-hidden border border-zinc-800 group-hover:border-primary transition-all relative shadow-2xl">
         <iframe className="absolute inset-0 w-full h-full p-0.5 rounded-dynamic" src={`https://www.youtube.com/embed/${videoId}?rel=0`} allowFullScreen />
      </div>
      <h3 className="mt-6 font-bold uppercase italic text-lg tracking-tighter group-hover:text-primary transition-colors">{project.title}</h3>
    </div>
  );
}