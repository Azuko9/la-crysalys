"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { XCircle, CloudUpload, Wind, Layers, AlignLeft, Globe, User } from "lucide-react";
import { Project } from "@/app/realisations/page";
import { Category } from "./CategoryManager";

interface ProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, project, categories, onClose, onSuccess }) => {
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    youtube_url: "",
    description: "",
    description_drone: "",    // Correspond à la colonne BDD
    description_postprod: "", // Correspond à la colonne BDD
    client_name: "",          // Correspond à la colonne BDD
    client_website: "",       // Correspond à la colonne BDD
    project_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        youtube_url: project.youtube_url || "",
        description: project.description || "",
        // On récupère les vraies données séparées
        description_drone: project.description_drone || "",       
        description_postprod: project.description_postprod || "", 
        client_name: project.client_name || "",
        client_website: project.client_website || "",
        project_date: project.project_date || new Date().toISOString().split('T')[0]
      });

      // On nettoie les tags pour ne pas cocher "Drone" ou "Short" manuellement
      // car ils sont gérés automatiquement par le contenu
      const tags = project.category ? project.category.split(',').map(t => t.trim()) : [];
      setSelectedCats(tags.filter(t => !["Drone", "Post-Prod", "Short"].includes(t)));
    } else {
      // Reset pour nouveau projet
      setFormData({
        title: "", youtube_url: "", description: "",
        description_drone: "", description_postprod: "",
        client_name: "", client_website: "",
        project_date: new Date().toISOString().split('T')[0]
      });
      setSelectedCats([]);
    }
  }, [project, isOpen]);

  const toggleCat = (name: string) => {
    setSelectedCats(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // --- LOGIQUE AUTOMATIQUE ---
    let finalLabels = [...selectedCats];
    
    // 1. Détection Short via URL
    if (formData.youtube_url.includes('/shorts/')) finalLabels.push('Short');
    
    // 2. Détection Drone via le champ rempli
    if (formData.description_drone.trim().length > 0) finalLabels.push('Drone');
    
    // 3. Détection Post-Prod via le champ rempli
    if (formData.description_postprod.trim().length > 0) finalLabels.push('Post-Prod');

    const payload = { 
      title: formData.title,
      youtube_url: formData.youtube_url,
      category: Array.from(new Set(finalLabels)).join(', '), // Évite les doublons
      
      // Envoi dans les colonnes séparées
      description: formData.description,
      description_drone: formData.description_drone,
      description_postprod: formData.description_postprod,
      
      client_name: formData.client_name,
      client_website: formData.client_website,
      project_date: formData.project_date,
    };

    const { error } = project 
      ? await supabase.from('portfolio_items').update(payload).eq('id', project.id)
      : await supabase.from('portfolio_items').insert([payload]);

    setLoading(false);
    if (!error) onSuccess();
    else alert("Erreur: " + error.message);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-card border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl my-8 text-white">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-primary">
            {project ? 'Modifier' : 'Ajouter'} <span className="text-white">Projet</span>
          </h3>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
            <XCircle size={32}/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* TITRE & URL */}
          <div className="space-y-4">
            <input 
              type="text" placeholder="Titre du projet" required 
              className="w-full bg-background border border-zinc-800 p-5 rounded-dynamic outline-none focus:border-primary font-bold text-lg"
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
            />
            <input 
              type="url" placeholder="Lien YouTube (ou Shorts)" required 
              className="w-full bg-background border border-zinc-800 p-5 rounded-dynamic outline-none focus:border-primary text-blue-400"
              value={formData.youtube_url} onChange={e => setFormData({...formData, youtube_url: e.target.value})} 
            />
          </div>

          {/* CATÉGORIES */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Tags Métier</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button 
                  key={cat.id} type="button" onClick={() => toggleCat(cat.name)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black border transition-all ${
                    selectedCats.includes(cat.name) ? 'bg-primary border-primary text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                  }`}
                >
                  {cat.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* DESCRIPTIONS SPÉCIFIQUES (DRONE & POST-PROD) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* ZONE DRONE */}
             <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-500 ml-2">
                  <Wind size={14}/> <span className="text-[10px] font-black uppercase tracking-widest">Spécificités Drone</span>
                </div>
                <textarea 
                  placeholder="Détails vol, altitude, autorisations..." 
                  rows={3} 
                  className="w-full bg-blue-950/10 border border-blue-900/30 p-4 rounded-dynamic outline-none focus:border-blue-500 text-sm text-blue-100 placeholder-blue-900/50"
                  value={formData.description_drone} onChange={e => setFormData({...formData, description_drone: e.target.value})} 
                />
             </div>

             {/* ZONE POST-PROD */}
             <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-500 ml-2">
                  <Layers size={14}/> <span className="text-[10px] font-black uppercase tracking-widest">Post-Production</span>
                </div>
                <textarea 
                  placeholder="Montage, Colorimétrie, VFX..." 
                  rows={3} 
                  className="w-full bg-purple-950/10 border border-purple-900/30 p-4 rounded-dynamic outline-none focus:border-purple-500 text-sm text-purple-100 placeholder-purple-900/50"
                  value={formData.description_postprod} onChange={e => setFormData({...formData, description_postprod: e.target.value})} 
                />
             </div>
          </div>

          {/* DESCRIPTION GÉNÉRALE */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-500 ml-2">
               <AlignLeft size={14}/> <span className="text-[10px] font-black uppercase tracking-widest">Contexte Général</span>
            </div>
            <textarea 
              placeholder="Description globale du projet, objectifs..." 
              rows={4}
              className="w-full bg-background border border-zinc-800 p-5 rounded-dynamic outline-none focus:border-white text-zinc-300"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          {/* INFO CLIENT & DATE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-800 pt-6">
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-zinc-600 uppercase ml-1 flex items-center gap-1"><User size={10}/> Client</label>
                 <input type="text" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-xs focus:border-zinc-500"
                   value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} placeholder="Nom du client" />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-zinc-600 uppercase ml-1 flex items-center gap-1"><Globe size={10}/> Site Web</label>
                 <input type="text" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-xs focus:border-zinc-500"
                   value={formData.client_website} onChange={e => setFormData({...formData, client_website: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-zinc-600 uppercase ml-1">Date Sortie</label>
                 <input type="date" required className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-xs focus:border-zinc-500 text-white"
                   value={formData.project_date} onChange={e => setFormData({...formData, project_date: e.target.value})} />
              </div>
          </div>

          {/* BOUTON ACTION */}
          <button 
            type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-white hover:text-black text-black font-black py-6 rounded-dynamic uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.2)] active:scale-[0.98] mt-4"
          >
            {loading ? "Enregistrement..." : (
              <>
                <CloudUpload size={24}/>
                {project ? 'Mettre à jour' : 'Publier le projet'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;