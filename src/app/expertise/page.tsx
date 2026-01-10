"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, Globe, Info, Pencil, Trash2, ArrowUpRight
} from "lucide-react";
import ProjectModal from "@/components/ProjectModal";
import FeaturesSection from "@/components/FeaturesSection";

export default function ExpertisePage() {
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]); 
  
  // États Admin
  const [user, setUser] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // CORRECTION ICI : J'ai retiré "fetchFeatures()" de la liste car le composant s'en occupe tout seul
      await Promise.all([fetchDroneProjects(), fetchCategories()]);
      
      setLoading(false);
    };
    init();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
    setCategories(data || []);
  };

  const fetchDroneProjects = async () => {
    const { data } = await supabase
      .from('portfolio_items')
      .select('*')
      .ilike('category', '%Drone%')
      .order('project_date', { ascending: false });
    setProjets(data || []);
  };

  return (
    <main className="min-h-screen bg-background text-white pb-24">
      
      {/* --- HEADER --- */}
      <section className="pt-32 pb-16 px-4 md:px-8 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-start mb-20">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] w-12 bg-primary"></div>
                <span className="text-primary font-black uppercase text-[10px] tracking-[0.4em]">Expertise Aérienne</span>
              </div>
              <h1 className="text-7xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.75] mb-12 text-outline-black">
                Drone<span className="text-primary">.</span>
              </h1>
              <div className="bg-card border border-zinc-800 p-6 rounded-dynamic inline-flex items-center gap-4">
                <div className="w-3 h-3 rounded-dynamic bg-primary animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest">Opérations certifiées DGAC</span>
              </div>
            </div>

            <div className="w-full lg:w-96 space-y-4">
               <div className="p-6 bg-card/40 border border-zinc-800 rounded-dynamic backdrop-blur-md">
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
                  </div>
               </div>
               <button onClick={() => window.location.href='/contact'} className="group w-full bg-primary hover:bg-white text-black py-5 rounded-dynamic font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                 Demander un devis <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
               </button>
            </div>
          </div>

          {/* --- C'EST ICI QUE TU AVAIS BIEN FAIT LA PARTIE 2 --- */}
          <div className="mt-16">
            <FeaturesSection pageContext="expertise" />
          </div>

        </div>
      </section>

      {/* --- LISTE VERTICALE --- */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mt-24">
        <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600 italic mb-16 flex items-center gap-4">
          <Globe size={14}/> Portfolio Drone
        </h2>
        
        {/* Container en colonne */}
        <div className="flex flex-col gap-24">
          {projets.map((p, index) => (
            <DroneProjectRow 
              key={p.id} 
              project={p}
              user={user}
              onEdit={(proj) => { setProjectToEdit(proj); setIsFormOpen(true); }}
              fetchProjects={fetchDroneProjects}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* MODAL EDIT */}
      {isFormOpen && (
        <ProjectModal 
          isOpen={isFormOpen} 
          project={projectToEdit} 
          categories={categories}
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => { setIsFormOpen(false); fetchDroneProjects(); }} 
        />
      )}
    </main>
  );
}

// --------------------------------------------------------
// SOUS-COMPOSANTS
// --------------------------------------------------------

function DroneProjectRow({ project, user, onEdit, fetchProjects, index }: { project: any, user: any, onEdit: (p: any) => void, fetchProjects: () => void, index: number }) {
  const videoId = getYouTubeID(project.youtube_url);
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Supprimer ce projet ?")) {
      const { error } = await supabase.from('portfolio_items').delete().eq('id', project.id);
      if (!error) fetchProjects();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 items-center group bg-card border border-zinc-800 p-6 rounded-dynamic shadow-2xl">
      
      {/* 1. COLONNE GAUCHE : LE TEXTE / COMMENTAIRE */}
      <div className="w-full lg:w-5/12 flex flex-col gap-6 order-2 lg:order-1">
        <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">0{index + 1}</span>
            <div className="h-[1px] flex-1 bg-primary"></div>
            {project.category && (
              <div className="flex flex-wrap gap-2"> 
                {project.category.split(',').map((cat: string, i: number) => ( 
                  <span 
                    key={i} 
                    className="text-[9px] font-bold text-primary uppercase tracking-widest border border-primary px-2 py-1 rounded bg-primary/10"
                  >
                    {cat.trim()} 
                  </span>
                ))}
              </div>
            )}
        </div>

        <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-[0.9] text-white group-hover:text-outline-white transition-all cursor-pointer" onClick={() => router.push(`/realisations/${project.id}`)}>
            {project.title}
        </h3>

        <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-primary pl-6 line-clamp-4">
            {project.description_drone || project.description || "Aucune spécificité drone renseignée."}
        </p>

        <button 
            onClick={() => router.push(`/realisations/${project.id}`)}
            className="self-start mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white border-b border-primary pb-1 hover:text-primary transition-colors"
        >
            Voir le détail <ArrowUpRight size={14}/>
        </button>
      </div>

      {/* 2. COLONNE DROITE : LA VIDÉO INTERACTIVE */}
      <div 
        className="w-full lg:w-7/12 order-1 lg:order-2 relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
         <div 
            className="aspect-video bg-black rounded-dynamic overflow-hidden border border-zinc-800 group-hover:border-primary transition-all relative shadow-2xl cursor-pointer"
            onClick={() => router.push(`/realisations/${project.id}`)}
         >
            {isHovered && videoId ? (
            <iframe
                className="absolute inset-0 w-full h-full object-cover pointer-events-none "
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${videoId}`}
                title={project.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ border: 0 }}
            />
            ) : (
            videoId && (
                <img 
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                className="w-full h-full object-cover opacity-90 transition-opacity duration-300" 
                alt={project.title} 
                />
            )
            )}

            {/* Boutons Admin */}
            {user && (
            <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                onClick={(e) => { e.stopPropagation(); onEdit(project); }} 
                className="bg-blue-600 hover:bg-blue-500 p-3 rounded-lg text-white shadow-lg"
                >
                <Pencil size={16}/>
                </button>
                <button 
                onClick={handleDelete} 
                className="bg-red-600 hover:bg-red-500 p-3 rounded-lg text-white shadow-lg"
                >
                <Trash2 size={16}/>
                </button>
            </div>
            )}
         </div>
      </div>

    </div>
  );
}

// J'ai bien supprimé la fonction "throw new Error" qui était ici.

