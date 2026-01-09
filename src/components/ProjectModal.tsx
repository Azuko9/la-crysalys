"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { XCircle, CloudUpload, Radio, Scissors } from "lucide-react";
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
  const [formData, setFormData] = useState({
    title: "",
    youtube_url: "",
    description: "",
    drone_details: "", // Zone spécifique Drone
    postprod_details: "", // Zone spécifique Post-Prod
    project_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        youtube_url: project.youtube_url || "",
        description: project.description || "",
        drone_details: "", // Tu pourras plus tard stocker ces détails séparément si besoin
        postprod_details: "",
        project_date: project.project_date || new Date().toISOString().split('T')[0]
      });
      // On filtre pour ne garder que les catégories métiers (pas les labels auto)
      const tags = project.category ? project.category.split(', ') : [];
      setSelectedCats(tags.filter(t => !["Drone", "Post-Prod", "Short"].includes(t)));
    } else {
      setFormData({
        title: "", youtube_url: "", description: "",
        drone_details: "", postprod_details: "",
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
    
    // --- LOGIQUE DE CLASSIFICATION AUTOMATIQUE ---
    let finalLabels = [...selectedCats];
    
    // Détection Short via URL
    if (formData.youtube_url.includes('/shorts/')) finalLabels.push('Short');
    
    // Détection Drone via sa zone de texte
    if (formData.drone_details.trim().length > 0) finalLabels.push('Drone');
    
    // Détection Post-Prod via sa zone de texte
    if (formData.postprod_details.trim().length > 0) finalLabels.push('Post-Prod');

    // Fusion des descriptions pour Supabase (optionnel)
    const fullDescription = `
      ${formData.description}
      ${formData.drone_details ? `\n[DRONE]: ${formData.drone_details}` : ''}
      ${formData.postprod_details ? `\n[POST-PROD]: ${formData.postprod_details}` : ''}
    `.trim();

    const payload = { 
      title: formData.title,
      youtube_url: formData.youtube_url,
      description: fullDescription,
      project_date: formData.project_date,
      category: Array.from(new Set(finalLabels)).join(', ') // Set pour éviter les doublons
    };

    const { error } = project 
      ? await supabase.from('portfolio_items').update(payload).eq('id', project.id)
      : await supabase.from('portfolio_items').insert([payload]);

    if (!error) onSuccess();
    else alert("Erreur: " + error.message);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-card border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto text-white no-scrollbar">
        
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-primary">
            {project ? 'Modifier' : 'Ajouter'} <span className="text-white">Réalisation</span>
          </h3>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
            <XCircle size={32}/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="text" placeholder="Titre" required 
            className="w-full bg-background border border-zinc-800 p-5 rounded-dynamic outline-none focus:border-primary font-bold"
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
          />
          <input 
            type="url" placeholder="Lien YouTube / Shorts" required 
            className="w-full bg-background border border-zinc-800 p-5 rounded-dynamic outline-none focus:border-primary"
            value={formData.youtube_url} onChange={e => setFormData({...formData, youtube_url: e.target.value})} 
          />

          {/* ZONE CLASSIFICATION METIER */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Catégorie Portfolio</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button 
                  key={cat.id} type="button" onClick={() => toggleCat(cat.name)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black border transition-all ${
                    selectedCats.includes(cat.name) ? 'bg-primary border-green-600 text-white' : 'bg-background border-zinc-800 text-zinc-600'
                  }`}
                >
                  {cat.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* ZONE DRONE */}
             <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-500 ml-2">
                  <Radio size={14}/> <span className="text-[10px] font-black uppercase tracking-widest">Prestation Drone</span>
                </div>
                <textarea 
                  placeholder="Détails vol, altitude... (Active le label Drone)" 
                  rows={2} 
                  className="w-full bg-background border border-zinc-800 p-4 rounded-dynamic outline-none focus:border-blue-500 text-sm italic"
                  value={formData.drone_details} onChange={e => setFormData({...formData, drone_details: e.target.value})} 
                />
             </div>

             {/* ZONE POST-PROD */}
             <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-500 ml-2">
                  <Scissors size={14}/> <span className="text-[10px] font-black uppercase tracking-widest">Post-Production</span>
                </div>
                <textarea 
                  placeholder="Montage, Colorimétrie... (Active le label Post-Prod)" 
                  rows={2} 
                  className="w-full bg-background border border-zinc-800 p-4 rounded-dynamic outline-none focus:border-purple-500 text-sm italic"
                  value={formData.postprod_details} onChange={e => setFormData({...formData, postprod_details: e.target.value})} 
                />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Description Générale & Date</label>
            <div className="flex flex-col md:flex-row gap-4">
              <textarea 
                placeholder="Description globale..." 
                className="flex-1 bg-background border border-zinc-800 p-5 rounded-dynamic outline-none focus:border-primary"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
              />
              <input 
                type="date" required
                className="bg-background border border-zinc-800 p-5 rounded-dynamic outline-none text-white h-fit"
                value={formData.project_date} onChange={e => setFormData({...formData, project_date: e.target.value})} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-green-500 text-black font-black py-6 rounded-dynamic uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98]"
          >
            <CloudUpload size={24}/>
            {project ? 'Mettre à jour' : 'Publier la réalisation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;