"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import { PlusCircle, Settings, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CategoryManager, type Category } from "@/components/CategoryManager";
import ProjectModal from "@/components/ProjectModal";

// 1. Export de l'interface pour qu'elle soit accessible par ProjectModal
export interface Project {
  id: string;
  title: string;
  youtube_url: string;
  category: string; // Stocké sous forme "Immobilier, Drone"
  description: string | null;
  project_date: string | null;
}

// 2. Interface pour les props de la Card
interface ProjectCardProps {
  projet: Project;
  user: any;
  onEdit: (p: Project) => void;
  fetchProjects: () => Promise<void>;
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

  // Filtrage
  const filtered = filtreActuel === "Tout" 
    ? projets 
    : projets.filter(p => p.category?.includes(filtreActuel));

  // Séparation Shorts / Productions
  const shorts = filtered.filter(p => p.youtube_url.includes('/shorts/') || p.category?.includes('Short'));
  const videosClassiques = filtered.filter(p => !p.youtube_url.includes('/shorts/') && !p.category?.includes('Short'));

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-green-500 font-bold tracking-widest uppercase font-mono">Chargement Crysalys...</div>;

  return (
    <main className="min-h-screen bg-black text-white px-8 pb-20 pt-28">
      <div className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter">Portfolio</h1>
          <p className="text-green-500 font-bold uppercase text-xs tracking-widest mt-2">Réalisations & Productions</p>
        </div>
        {user && (
          <button onClick={() => setIsManagingCats(!isManagingCats)} className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 text-zinc-400 hover:text-white transition">
            <Settings size={16}/> {isManagingCats ? "Fermer" : "Gérer Catégories"}
          </button>
        )}
      </div>

      {isManagingCats && user && <CategoryManager categories={categories} refreshCategories={fetchCategories} />}

      <div className="max-w-7xl mx-auto mb-16 flex flex-wrap gap-3">
        <button onClick={() => setFiltreActuel("Tout")} className={`px-6 py-2 rounded-full text-[10px] font-bold border transition-all ${filtreActuel === "Tout" ? "bg-white text-black" : "bg-zinc-900 text-gray-500 border-zinc-800"}`}>TOUT</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setFiltreActuel(cat.name)} className={`px-6 py-2 rounded-full text-[10px] font-bold border transition-all ${filtreActuel === cat.name ? "bg-green-600 text-white border-green-600" : "bg-zinc-900 text-gray-500 border-zinc-800"}`}>{cat.name.toUpperCase()}</button>
        ))}
      </div>

      {user && (
        <div className="max-w-7xl mx-auto mb-20">
          <button onClick={() => { setProjectToEdit(null); setIsFormOpen(true); }} className="w-full py-10 border-2 border-dashed border-zinc-800 hover:border-green-500 rounded-3xl text-zinc-500 hover:text-green-500 transition-all font-bold uppercase tracking-widest flex items-center justify-center gap-4">
            <PlusCircle size={24}/> Ajouter une réalisation
          </button>
        </div>
      )}

      {/* Rendu des Shorts avec typage explicite (p: Project) */}
      {shorts.length > 0 && (
        <section className="max-w-7xl mx-auto mb-24">
          <h2 className="text-xl font-black italic uppercase text-red-600 mb-8 border-l-4 border-red-600 pl-4 tracking-tighter">YouTube Shorts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {shorts.map((p: Project) => (
              <ProjectCard 
                key={p.id} 
                projet={p} 
                user={user} 
                onEdit={(proj: Project) => { setProjectToEdit(proj); setIsFormOpen(true); }} 
                fetchProjects={fetchProjects} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Rendu des Vidéos avec typage explicite (p: Project) */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-xl font-black italic uppercase text-green-500 mb-8 border-l-4 border-green-500 pl-4 tracking-tighter">Productions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videosClassiques.map((p: Project) => (
            <ProjectCard 
              key={p.id} 
              projet={p} 
              user={user} 
              onEdit={(proj: Project) => { setProjectToEdit(proj); setIsFormOpen(true); }} 
              fetchProjects={fetchProjects} 
            />
          ))}
        </div>
      </section>

      {/* Modal - On passe projectToEdit qui peut être Project ou null */}
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

// Sous-composant Card corrigé avec l'interface ProjectCardProps
function ProjectCard({ projet, user, onEdit, fetchProjects }: ProjectCardProps) {
  const videoId = getYouTubeID(projet.youtube_url);
  const router = useRouter();
  
  // Correction de l'erreur potentielle sur category null
  const categoriesList = projet.category ? projet.category.split(',').map((c) => c.trim()) : [];

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Supprimer cette vidéo ?")) {
      const { error } = await supabase.from('portfolio_items').delete().eq('id', projet.id);
      if (!error) fetchProjects();
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-green-500 transition-all cursor-pointer" onClick={() => router.push(`/realisations/${projet.id}`)}>
      <div className="relative aspect-video bg-black">
        {videoId && <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={projet.title} />}
        {user && (
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onEdit(projet); }} className="bg-blue-600 p-2 rounded-lg text-white"><Pencil size={14}/></button>
            <button onClick={handleDelete} className="bg-red-600 p-2 rounded-lg text-white"><Trash2 size={14}/></button>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold uppercase text-xs line-clamp-1 tracking-wider">{projet.title}</h3>
        <div className="flex flex-wrap gap-1 mt-2">
          {categoriesList.map((cat, i) => (
            <span key={i} className="text-[8px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md uppercase font-bold">{cat}</span>
          ))}
        </div>
      </div>
    </div>
  );
}