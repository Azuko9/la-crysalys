"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PlusCircle, Settings } from "lucide-react"; 
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ProjectCard } from "@/components/ProjectCard";
import dynamic from "next/dynamic";
import type { Project, Category } from "@/types";

const ProjectModal = dynamic(() => import("@/components/ProjectModal"));
const CategoryManager = dynamic(() => import("@/components/CategoryManager").then(mod => mod.CategoryManager));

interface RealisationsClientPageProps {
  initialProjects: Project[];
  initialCategories: Category[];
  defaultFilter?: string;
}

export default function RealisationsClientPage({ initialProjects, initialCategories, defaultFilter = "Tout" }: RealisationsClientPageProps) {
  const [user, setUser] = useState<User | null>(null);
  // Utilise le filtre par défaut ou "Tout"
  const [filtreActuel, setFiltreActuel] = useState(defaultFilter);
  const [isManagingCats, setIsManagingCats] = useState(false);

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('id, name').order('name');
    if (data) setCategories(data);
  }, []);

  const openModal = (project: Project | null) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProjectToEdit(null);
  };

  // Gère le succès de l'ajout/modification
  const handleModalSuccess = () => {
    closeModal();
    // La revalidation est maintenant gérée par le Server Action.
  };

  // Gère la suppression en rafraîchissant les données depuis la BDD
  const handleProjectDeleted = () => {
    // La revalidation est maintenant gérée par le Server Action.
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const filtered = useMemo(() => (filtreActuel === "Tout" 
    ? initialProjects 
    : initialProjects.filter(p => p.category?.includes(filtreActuel))), [initialProjects, filtreActuel]);

  const shorts = useMemo(() => filtered.filter(p => p.youtube_url.includes('/shorts/')), [filtered]);
  const videosClassiques = useMemo(() => filtered.filter(p => !p.youtube_url.includes('/shorts/')), [filtered]);

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
          <button onClick={() => openModal(null)} className="w-full py-10 border-2 border-dashed border-zinc-800 hover:border-primary rounded-dynamic text-zinc-500 hover:text-primary transition-all font-bold uppercase tracking-widest flex items-center justify-center gap-4 text-xs">
            <PlusCircle size={24}/> Ajouter une réalisation
          </button>
        </div>
      )}

      {shorts.length > 0 && (
        <section className="max-w-7xl mx-auto mb-24">
          <h2 className="text-xl font-black italic uppercase text-primary mb-8 border-l-4 border-primary pl-4 tracking-tighter">YouTube Shorts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {shorts.map((p: Project) => (
              <ProjectCard key={p.id} projet={p} user={user} onEdit={openModal} onDeleteSuccess={handleProjectDeleted} isVertical={true} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto">
        <h2 className="text-xl font-black italic uppercase text-primary mb-8 border-l-4 border-primary pl-4 tracking-tighter">Productions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videosClassiques.map((p: Project) => (
            <ProjectCard key={p.id} projet={p} user={user} onEdit={openModal} onDeleteSuccess={handleProjectDeleted} isVertical={false} />
          ))}
        </div>
      </section>

      {isModalOpen && (
        <ProjectModal isOpen={isModalOpen} project={projectToEdit} categories={categories} onClose={closeModal} onSuccess={handleModalSuccess} />
      )}
    </>
  );
}