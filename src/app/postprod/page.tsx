"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import { 
  Scissors, Palette, Volume2, Layers, 
  ArrowDownRight, ChevronRight, Monitor, Cpu, Terminal
} from "lucide-react";

export default function PostProdPage() {
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostProd = async () => {
      const { data } = await supabase
        .from('portfolio_items')
        .select('*')
        .ilike('category', '%Post-Prod%')
        .order('project_date', { ascending: false });
      setProjets(data || []);
      setLoading(false);
    };
    fetchPostProd();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      
      {/* --- SECTION HERO : L'EXPERTISE STUDIO --- */}
      <section className="pt-32 pb-16 px-8 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col lg:flex-row gap-16 items-start mb-20">
            {/* Titre Massive */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] w-12 bg-indigo-500"></div>
                <span className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.4em]">Studio / Editing</span>
              </div>
              <h1 className="text-8xl md:text-[10rem] lg:text-[12rem] font-black italic uppercase tracking-tighter leading-[0.75] mb-12">
                Post<span className="text-indigo-500">.</span><br />Prod
              </h1>
              <div className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-2xl inline-flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest">Workstation : DaVinci Resolve Studio</span>
              </div>
            </div>

            {/* Fiche Technique Latérale */}
            <div className="w-full lg:w-96 space-y-4">
               <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl backdrop-blur-md">
                  <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-6 tracking-widest flex items-center gap-2">
                    <Terminal size={14}/> Pipeline Technique
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Étalonnage</span>
                      <span className="text-[11px] font-black">10-bit Rec.709 / Log</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Codecs</span>
                      <span className="text-[11px] font-black">ProRes 422 HQ / H.265</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Audio</span>
                      <span className="text-[11px] font-black">Mastering LUFS Standard</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">VFX</span>
                      <span className="text-[11px] font-black italic text-indigo-500">Tracking & Clean-up</span>
                    </div>
                  </div>
               </div>
               <button className="group w-full bg-indigo-600 hover:bg-indigo-500 text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                 Démarrer un projet <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
               </button>
            </div>
          </div>

          {/* --- LES 4 PILIERS DE LA POST-PROD --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-[2rem] hover:border-indigo-500/50 transition-colors group">
              <Scissors className="text-indigo-500 mb-6 group-hover:scale-110 transition-transform" size={28} />
              <h4 className="text-lg font-black italic uppercase mb-2">Montage Rythmé</h4>
              <p className="text-xs text-zinc-500 leading-relaxed uppercase font-bold tracking-tighter">
                Narration dynamique adaptée aux réseaux sociaux et aux formats longs.
              </p>
            </div>

            <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-[2rem] hover:border-indigo-500/50 transition-colors group">
              <Palette className="text-indigo-500 mb-6 group-hover:scale-110 transition-transform" size={28} />
              <h4 className="text-lg font-black italic uppercase mb-2">Color Grading</h4>
              <p className="text-xs text-zinc-500 leading-relaxed uppercase font-bold tracking-tighter">
                Sublimation de l'image, correction colorimétrique et création de "Looks".
              </p>
            </div>

            <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-[2rem] hover:border-indigo-500/50 transition-colors group">
              <Volume2 className="text-indigo-500 mb-6 group-hover:scale-110 transition-transform" size={28} />
              <h4 className="text-lg font-black italic uppercase mb-2">Sound Design</h4>
              <p className="text-xs text-zinc-500 leading-relaxed uppercase font-bold tracking-tighter">
                Immersion sonore, mixage voix et recherche de musiques libres de droits.
              </p>
            </div>

            <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-[2rem] hover:border-indigo-500/50 transition-colors group">
              <Layers className="text-indigo-500 mb-6 group-hover:scale-110 transition-transform" size={28} />
              <h4 className="text-lg font-black italic uppercase mb-2">Motion Design</h4>
              <p className="text-xs text-zinc-500 leading-relaxed uppercase font-bold tracking-tighter">
                Animation de titres, intégration de logos et effets visuels (VFX).
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- GRILLE DES VIDÉOS --- */}
      <section className="px-8 max-w-7xl mx-auto mt-24">
        <div className="flex items-center justify-between mb-16 border-b border-zinc-900 pb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600 italic flex items-center gap-4">
              <Monitor size={14}/> Studio Reels
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 font-mono">
              {projets.length} EDITS TERMINÉS
            </div>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {projets.map(p => {
              const videoId = getYouTubeID(p.youtube_url);
              return (
                <div key={p.id} className="group cursor-pointer">
                  <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 group-hover:border-indigo-500 transition-all relative shadow-2xl">
                     <iframe 
                        className="absolute inset-0 w-full h-full p-0.5 rounded-2xl" 
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1`} 
                        title={p.title}
                        allowFullScreen 
                     />
                  </div>
                  <div className="mt-6 flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold uppercase italic text-lg tracking-tighter group-hover:text-indigo-400 transition-colors">
                            {p.title}
                        </h3>
                        <ArrowDownRight className="text-zinc-800 group-hover:text-indigo-500 transition-colors" size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-indigo-600 transition-colors"></span>
                        <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.2em]">
                           {p.category.replace('Post-Prod', '').replace(', ,', ',').trim() || 'Creative Editing'}
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