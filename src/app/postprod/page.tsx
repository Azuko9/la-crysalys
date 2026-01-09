"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import { 
  Scissors, Palette, Volume2, Layers, 
  ArrowDownRight, ChevronRight, Monitor, Terminal
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
    <main className="min-h-screen bg-background text-white pb-24">
      
      <section className="pt-32 pb-16 px-8 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col lg:flex-row gap-16 items-start mb-20">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] w-12 bg-primary"></div>
                <span className="text-primary font-black uppercase text-[10px] tracking-[0.4em]">Studio / Editing</span>
              </div>
              <h1 className="text-8xl md:text-[12rem] font-black italic uppercase tracking-tighter leading-[0.75] mb-12 text-outline-black">
                Post<span className="text-primary">.</span><br />Prod
              </h1>

            </div>

            <div className="w-full lg:w-96 space-y-4">
               <div className="p-6 bg-card/40 border border-zinc-800 rounded-dynamic backdrop-blur-md">
                  <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-6 tracking-widest flex items-center gap-2">
                    <Terminal size={14}/> Technical Specs
                  </h3>
                  <div className="space-y-4 font-bold uppercase text-[11px]">
                    <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-zinc-400">Étalonnage</span>
                      <span>10-bit Rec.709</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-zinc-400">Audio</span>
                      <span>Mixage LUFS Std</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">VFX</span>
                      <span className="italic text-primary">Tracking & Clean-up</span>
                    </div>
                  </div>
               </div>
               <button className="group w-full bg-primary hover:bg-white text-black py-5 rounded-dynamic font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                 Demander un devis <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={<Scissors size={28}/>} title="Montage Rythmé" text="Narration dynamique adaptée à tous vos formats." />
            <FeatureCard icon={<Palette size={28}/>} title="Color Grading" text="Sublimation de l'image et création de looks cinématographiques." />
            <FeatureCard icon={<Volume2 size={28}/>} title="Sound Design" text="Immersion sonore et mixage audio haute fidélité." />
            <FeatureCard icon={<Layers size={28}/>} title="Motion Design" text="Animation de titres et intégration d'effets visuels." />
          </div>
        </div>
      </section>

      <section className="px-8 max-w-7xl mx-auto mt-24">
        <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600 italic mb-16 flex items-center gap-4">
          <Monitor size={14}/> Studio Reels
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

// Réutiliser les mêmes composants FeatureCard et ProjectItem que ci-dessus
function FeatureCard({ icon, title, text }: any) {
  return (
    <div className="p-8 bg-card border border-zinc-800 rounded-dynamic hover:border-primary/50 transition-colors group">
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
      <div className="aspect-video bg-card rounded-dynamic overflow-hidden border border-zinc-800 group-hover:border-primary transition-all relative shadow-2xl">
         <iframe className="absolute inset-0 w-full h-full p-0.5 rounded-dynamic" src={`https://www.youtube.com/embed/${videoId}?rel=0`} allowFullScreen />
      </div>
      <h3 className="mt-6 font-bold uppercase italic text-lg tracking-tighter group-hover:text-primary transition-colors">{project.title}</h3>
    </div>
  );
}