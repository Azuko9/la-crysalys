"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import { 
  ShieldCheck, Map, Camera, FastForward, 
  ArrowDownRight, ChevronRight, Globe, Info
} from "lucide-react";

export default function DronePage() {
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
      
      {/* --- SECTION HERO : L'EXPERTISE TECHNIQUE --- */}
      <section className="pt-32 pb-16 px-8 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col lg:flex-row gap-16 items-start mb-20">
            {/* Titre Massive */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] w-12 bg-blue-600"></div>
                <span className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em]">Aéronautique / Captation</span>
              </div>
              <h1 className="text-8xl md:text-[12rem] font-black italic uppercase tracking-tighter leading-[0.75] mb-12">
                Drone<span className="text-blue-600">.</span>
              </h1>
              <div className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-dynamic inline-flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest">Opérations en cours : France / Europe</span>
              </div>
            </div>

            {/* Fiche Technique Latérale */}
            <div className="w-full lg:w-96 space-y-4">
               <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-dynamic backdrop-blur-md">
                  <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-6 tracking-widest flex items-center gap-2">
                    <Info size={14}/> Spécifications Flotte
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Capteur</span>
                      <span className="text-[11px] font-black">4K / 5.2K RAW</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Transmission</span>
                      <span className="text-[11px] font-black">O3+ 1080p 60fps</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Stabilité</span>
                      <span className="text-[11px] font-black">Nacelle 3 axes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Formats</span>
                      <span className="text-[11px] font-black italic text-blue-500">Log / Prores</span>
                    </div>
                  </div>
               </div>
               <button className="group w-full bg-blue-600 hover:bg-blue-500 text-black py-5 rounded-dynamic font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                 Demander un devis <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
               </button>
            </div>
          </div>

          {/* --- LES 4 PILIERS (Tes informations spécifiques) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-[2rem] hover:border-blue-500/50 transition-colors group">
              <ShieldCheck className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={28} />
              <h4 className="text-lg font-black italic uppercase mb-2">Homologué DGAC</h4>
              <p className="text-xs text-zinc-500 leading-relaxed uppercase font-bold tracking-tighter">
                Télépilotes déclarés à la Direction Générale de l'Aviation Civile.
              </p>
            </div>

            <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-[2rem] hover:border-blue-500/50 transition-colors group">
              <Map className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={28} />
              <h4 className="text-lg font-black italic uppercase mb-2">Scénarios S1, S2, S3</h4>
              <p className="text-xs text-zinc-500 leading-relaxed uppercase font-bold tracking-tighter">
                Autorisations de vol en zone peuplée (ville) et hors agglomération.
              </p>
            </div>

            <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-[2rem] hover:border-blue-500/50 transition-colors group">
              <Camera className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={28} />
              <h4 className="text-lg font-black italic uppercase mb-2">Qualité Cinéma</h4>
              <p className="text-xs text-zinc-500 leading-relaxed uppercase font-bold tracking-tighter">
                Capteurs 4K / 5.2K RAW pour une image exploitable en post-production lourde.
              </p>
            </div>

            <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-[2rem] hover:border-blue-500/50 transition-colors group">
              <FastForward className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={28} />
              <h4 className="text-lg font-black italic uppercase mb-2">Vol FPV & Stabilisé</h4>
              <p className="text-xs text-zinc-500 leading-relaxed uppercase font-bold tracking-tighter">
                Du plan fluide et lent au vol dynamique et immersif en First Person View.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- GRILLE DES VIDÉOS --- */}
      <section className="px-8 max-w-7xl mx-auto mt-24">
        <div className="flex items-center justify-between mb-16 border-b border-zinc-900 pb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600 italic flex items-center gap-4">
              <Globe size={14}/> Missions Récentes
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
              {projets.length} FILMS DISPONIBLES
            </div>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {projets.map(p => {
              const videoId = getYouTubeID(p.youtube_url);
              return (
                <div key={p.id} className="group cursor-pointer">
                  <div className="aspect-video bg-zinc-900 rounded-dynamic overflow-hidden border border-zinc-800 group-hover:border-blue-600 transition-all relative shadow-2xl">
                     <iframe 
                        className="absolute inset-0 w-full h-full p-0.5 rounded-dynamic" 
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1`} 
                        title={p.title}
                        allowFullScreen 
                     />
                  </div>
                  <div className="mt-6 flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold uppercase italic text-lg tracking-tighter group-hover:text-blue-500 transition-colors">
                            {p.title}
                        </h3>
                        <ArrowDownRight className="text-zinc-800 group-hover:text-blue-500 transition-colors" size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-blue-600 transition-colors"></span>
                        <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.2em]">
                           {p.category.replace('Drone', '').replace(', ,', ',').trim() || 'Prestation Aérienne'}
                        </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}