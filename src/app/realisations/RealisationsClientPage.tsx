"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import { PlusCircle, Settings, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CategoryManager, type Category } from "@/components/CategoryManager";
import ProjectModal from "@/components/ProjectModal";
import type { User } from "@supabase/supabase-js";

export interface Project {
  id: string;
  title: string;
  youtube_url: string;
  category: string;
  description: string | null;
  description_drone?: string | null;
  description_postprod?: string | null;
  client_name?: string | null;
  client_website?: string | null;
  project_date: string | null;
}

interface RealisationsClientPageProps {
  initialProjects: Project[];
  initialCategories: Category[];
}

interface ProjectCardProps {
  projet: Project;
  user: any;
  onEdit: (p: Project) => void;
  fetchProjects: () => Promise<void>;
  isVertical?: boolean;
}

export default function RealisationsClientPage({ initialProjects, initialCategories }: RealisationsClientPageProps) {
  const [projets, setProjets] = useState<Project[]>(initialProjects);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [user, setUser] = useState<User | null>(null);
  const [filtreActuel, setFiltreActuel] = useState("Tout");
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const fetchProjects = useCallback(async () => {
    const { data } = await supabase.from('portfolio_items').select('*').order('project_date', { ascending: false });
    setProjets((data as Project[]) || []);
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
    setCategories((data as Category[]) || []);
  }, []);

  const filtered = useMemo(() => (filtreActuel === "Tout" 
    ? projets 
    : projets.filter(p => p.category?.includes(filtreActuel))), [projets, filtreActuel]);

  const shorts = useMemo(() => filtered.filter(p => p.youtube_url.includes('/shorts/') || p.category?.includes('Short')), [filtered]);
  const videosClassiques = useMemo(() => filtered.filter(p => !p.youtube_url.includes('/shorts/') && !p.category?.includes('Short')), [filtered]);

  return (
    <>
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-outline-black">Portfolio</h1>
          <p className="text-primary font-bold uppercase text-xs tracking-widest mt-2">Réalisations & Productions</p>
        </div>
        {user && (
          <button onClick={() => setIsManagingCats(!isManagingCats)} className="flex items-center gap-2 px-4 py-2 rounded-dynamic border border-zinc-800 text-zinc-400 hover:text-white transition text-xs font-bold uppercase">
            <Settings size={14}/> {isManagingCats ? "Fermer" : "Gérer Catégories"}
          </button>
        )}
      </div>

      {isManagingCats && user && <CategoryManager categories={categories} refreshCategories={fetchCategories} />}

      <div className="max-w-7xl mx-auto mb-16 flex flex-wrap gap-3">
        <button onClick={() => setFiltreActuel("Tout")} className={`px-6 py-2 rounded-dynamic text-[10px] font-bold border transition-all uppercase ${filtreActuel === "Tout" ? "bg-white text-black" : "bg-card text-gray-500 border-zinc-800"}`}>TOUT</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setFiltreActuel(cat.name)} className={`px-6 py-2 rounded-dynamic text-[10px] font-bold border transition-all uppercase ${filtreActuel === cat.name ? "bg-primary text-white border-primary" : "bg-card text-gray-500 border-zinc-800"}`}>{cat.name}</button>
        ))}
      </div>

      {user && (
        <div className="max-w-7xl mx-auto mb-20">
          <button onClick={() => { setProjectToEdit(null); setIsFormOpen(true); }} className="w-full py-10 border-2 border-dashed border-zinc-800 hover:border-primary rounded-dynamic text-zinc-500 hover:text-primary transition-all font-bold uppercase tracking-widest flex items-center justify-center gap-4 text-xs">
            <PlusCircle size={24}/> Ajouter une réalisation
          </button>
        </div>
      )}

      {shorts.length > 0 && (
        <section className="max-w-7xl mx-auto mb-24">
          <h2 className="text-xl font-black italic uppercase text-primary mb-8 border-l-4 border-primary pl-4 tracking-tighter">YouTube Shorts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {shorts.map((p: Project) => (
              <ProjectCard key={p.id} projet={p} user={user} onEdit={(proj: Project) => { setProjectToEdit(proj); setIsFormOpen(true); }} fetchProjects={fetchProjects} isVertical={true} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto">
        <h2 className="text-xl font-black italic uppercase text-primary mb-8 border-l-4 border-primary pl-4 tracking-tighter">Productions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videosClassiques.map((p: Project) => (
            <ProjectCard key={p.id} projet={p} user={user} onEdit={(proj: Project) => { setProjectToEdit(proj); setIsFormOpen(true); }} fetchProjects={fetchProjects} isVertical={false} />
          ))}
        </div>
      </section>

      {isFormOpen && (
        <ProjectModal isOpen={isFormOpen} project={projectToEdit} categories={categories} onClose={() => setIsFormOpen(false)} onSuccess={() => { setIsFormOpen(false); fetchProjects(); }} />
      )}
    </>
  );
}

function ProjectCard({ projet, user, onEdit, fetchProjects, isVertical = false }: ProjectCardProps) {
  const videoId = getYouTubeID(projet.youtube_url);
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  
  const categoriesList = projet.category ? projet.category.split(',').map((c) => c.trim()) : [];

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Supprimer cette vidéo ?")) {
      const { error } = await supabase.from('portfolio_items').delete().eq('id', projet.id);
      if (!error) fetchProjects();
    }
  };

  return (
    <div className="bg-card border border-zinc-800 rounded-dynamic overflow-hidden group hover:border-primary transition-all cursor-pointer relative flex flex-col h-full" onClick={() => router.push(`/realisations/${projet.id}`)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className={`relative ${isVertical ? 'aspect-[9/16]' : 'aspect-video'} bg-black overflow-hidden`}>
        {isHovered && videoId ? (
          <iframe className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${videoId}`} title={projet.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style={{ border: 0 }} />
        ) : (
          videoId && (<img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} className="w-full h-full object-cover opacity-90 group-hover:opacity-0 transition-opacity duration-300" alt={projet.title} />)
        )}
        {user && (
          <div className="absolute top-2 right-2 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onEdit(projet); }} className="bg-blue-600/90 hover:bg-blue-500 p-2 rounded text-white backdrop-blur-sm"><Pencil size={14}/></button>
            <button onClick={handleDelete} className="bg-red-600/90 hover:bg-red-500 p-2 rounded text-white backdrop-blur-sm"><Trash2 size={14}/></button>
          </div>
        )}
      </div>
      <div className="p-4 bg-card flex-1 flex flex-col justify-between relative z-10">
        <h3 className="font-black uppercase text-xs line-clamp-1 tracking-wider text-white group-hover:text-primary transition-colors">{projet.title}</h3>
        <div className="flex flex-wrap gap-1 mt-3">
          {categoriesList.map((cat, i) => (
            <span key={i} className="text-[8px] bg-transparent border border-primary text-primary px-2 py-0.5 rounded uppercase font-bold tracking-wide">{cat}</span>
          ))}
        </div>
      </div>
    </div>
  );
}