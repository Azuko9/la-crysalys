"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import { 
  PlusCircle, Settings, Tag, Calendar, ArrowLeft, Pencil, Trash2 
} from "lucide-react";
import { useRouter } from "next/navigation";

// Imports des composants isolés
import { CategoryManager, Category } from "@/components/CategoryManager";
import ProjectModal from "@/components/ProjectModal";

// --- TYPES ---
export interface Project {
  id: string;
  title: string;
  youtube_url: string;
  category: string; 
  description: string | null;
  client_name: string | null;
  client_website: string | null;
  project_date: string | null;
  created_at?: string;
}

// 1. Correction du typage des Props de la Card
interface ProjectCardProps {
  projet: Project;
  user: any;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
}

export default function Realisations() {
  const [projets, setProjets] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filtreActuel, setFiltreActuel] = useState("Tout");
  
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      await Promise.all([fetchCategories(), fetchProjects()]);
      setLoading(false);
    };
    init();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from('portfolio_items').select('*').order('project_date', { ascending: false });
    setProjets((data as Project[]) || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
    setCategories((data as Category[]) || []);
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Supprimer définitivement cette vidéo ?")) {
      const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
      if (!error) fetchProjects();
    }
  };

  const filtered = filtreActuel === "Tout" 
    ? projets 
    : projets.filter(p => p.category.includes(filtreActuel));

  const shorts = filtered.filter(p => p.youtube_url.includes('/shorts/'));
  const videosClassiques = filtered.filter(p => !p.youtube_url.includes('/shorts/'));

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-green-500 font-bold tracking-widest">CHARGEMENT...</div>;

  return (
    <main className="min-h-screen bg-black text-white px-8 pb-20 pt-28">
      
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-2">Portfolio</h1>
        <div className="flex justify-between items-center">
            <p className="text-green-500 font-bold uppercase text-xs tracking-widest">Productions Vidéos & Drone</p>
            {user && (
                <button 
                  onClick={() => setIsManagingCats(!isManagingCats)} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${isManagingCats ? 'bg-green-600 border-green-600' : 'bg-zinc-900 border-zinc-800'}`}
                >
                    <Settings size={16}/> {isManagingCats ? "Fermer Gestion" : "Gérer les catégories"}
                </button>
            )}
        </div>
      </div>

      {isManagingCats && user && (
          <CategoryManager categories={categories} refreshCategories={fetchCategories} />
      )}

      <div className="max-w-7xl mx-auto mb-16 flex flex-wrap gap-3">
        <button onClick={() => setFiltreActuel("Tout")} className={`px-6 py-2 rounded-full text-[10px] font-bold border transition-all ${filtreActuel === "Tout" ? "bg-white text-black" : "bg-zinc-900 text-gray-500 border-zinc-800"}`}>TOUT</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setFiltreActuel(cat.name)} className={`px-6 py-2 rounded-full text-[10px] font-bold border transition-all ${filtreActuel === cat.name ? "bg-green-600 text-white border-green-600" : "bg-zinc-900 text-gray-500 border-zinc-800"}`}>{cat.name.toUpperCase()}</button>
        ))}
      </div>

      {user && (
        <div className="max-w-7xl mx-auto mb-20 text-center">
            <button 
              onClick={() => { setProjectToEdit(null); setIsFormOpen(true); }} 
              className="px-10 py-5 border-2 border-dashed border-zinc-800 hover:border-green-500 rounded-3xl text-zinc-500 hover:text-green-500 transition-all font-bold uppercase tracking-widest flex items-center gap-4 mx-auto"
            >
                <PlusCircle size={24}/> Ajouter une vidéo
            </button>
        </div>
      )}

      {shorts.length > 0 && (
        <section className="max-w-7xl mx-auto mb-24">
            <h2 className="text-xl font-black italic uppercase text-red-600 mb-8 border-l-4 border-red-600 pl-4 tracking-tighter">YouTube Shorts</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {shorts.map(p => (
                    <ProjectCard 
                        key={p.id} 
                        projet={p} 
                        user={user} 
                        onEdit={(proj) => { setProjectToEdit(proj); setIsFormOpen(true); }} 
                        onDelete={handleDeleteProject} 
                    />
                ))}
            </div>
        </section>
      )}

      {videosClassiques.length > 0 && (
        <section className="max-w-7xl mx-auto">
            <h2 className="text-xl font-black italic uppercase text-green-500 mb-8 border-l-4 border-green-500 pl-4 tracking-tighter">Productions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videosClassiques.map(p => (
                    <ProjectCard 
                        key={p.id} 
                        projet={p} 
                        user={user} 
                        onEdit={(proj) => { setProjectToEdit(proj); setIsFormOpen(true); }} 
                        onDelete={handleDeleteProject} 
                    />
                ))}
            </div>
        </section>
      )}

      {isFormOpen && (
        <ProjectModal 
          isOpen={isFormOpen}
          project={projectToEdit}
          categories={categories}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => { setIsFormOpen(false); fetchProjects(); }}
        />
      )}
    </main>
  );
}

// 2. Correction du sous-composant avec les types définis plus haut
const ProjectCard = ({ projet, user, onEdit, onDelete }: ProjectCardProps) => {
    const videoId = getYouTubeID(projet.youtube_url);
    const isShort = projet.youtube_url.includes('/shorts/');
    const router = useRouter();
    // Ajout d'une sécurité si category est null
    const categoriesList = projet.category ? projet.category.split(',').map((c: string) => c.trim()) : [];

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col relative group hover:border-green-500 transition-all overflow-hidden cursor-pointer" onClick={() => router.push(`/realisations/${projet.id}`)}>
            {user && (
                <div className="absolute top-2 right-2 z-30 flex gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(projet); }} 
                        className="bg-blue-600 p-2 rounded hover:scale-110 transition"
                    >
                        <Pencil size={14} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(projet.id); }} 
                        className="bg-red-600 p-2 rounded hover:scale-110 transition"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}
            <div className={`relative bg-black ${isShort ? 'aspect-[9/16]' : 'aspect-video'}`}>
                {videoId && (
                    <img 
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                        className="w-full h-full object-cover opacity-60" 
                        alt={projet.title} 
                    />
                )}
            </div>
            <div className="p-5 border-t border-gray-800">
                <h3 className="text-lg font-bold uppercase mb-2 line-clamp-1">{projet.title}</h3>
                <div className="flex flex-wrap gap-1">
                    {categoriesList.map((cat, i) => (
                        <span key={i} className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase font-bold">
                            {cat}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};