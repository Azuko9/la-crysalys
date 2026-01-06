"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { XCircle } from "lucide-react";
import { Project } from "@/app/realisations/page"; // On importe l'interface
import { Category } from "./CategoryManager";

interface ProjectModalProps {
  isOpen: boolean;
  project: Project | null; // Si null = Ajout, si projet = Edition
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ 
  isOpen, project, categories, onClose, onSuccess 
}) => {
  const [selectedCats, setSelectedCats] = useState<string[]>(["Divers"]);
  const [formData, setFormData] = useState({
    title: "",
    youtube_url: "",
    description: "",
    client_name: "",
    client_website: "",
    project_date: new Date().toISOString().split('T')[0]
  });

  // Initialisation du formulaire (Ajout vs Edition)
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        youtube_url: project.youtube_url || "",
        description: project.description || "",
        client_name: project.client_name || "",
        client_website: project.client_website || "",
        project_date: project.project_date || new Date().toISOString().split('T')[0]
      });
      setSelectedCats(project.category.split(', '));
    } else {
      setFormData({
        title: "",
        youtube_url: "",
        description: "",
        client_name: "",
        client_website: "",
        project_date: new Date().toISOString().split('T')[0]
      });
      setSelectedCats(["Divers"]);
    }
  }, [project, isOpen]);

  const toggleCatSelection = (name: string) => {
    setSelectedCats(prev => 
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Automatisation du tag "Drone"
    let finalCats = [...selectedCats];
    if (formData.description.toLowerCase().includes("drone") && !finalCats.includes("Drone")) {
      finalCats.push("Drone");
    }
    
    const payload = { 
      ...formData, 
      category: finalCats.join(', ') 
    };

    const { error } = project 
      ? await supabase.from('portfolio_items').update(payload).eq('id', project.id)
      : await supabase.from('portfolio_items').insert([payload]);

    if (!error) {
      onSuccess();
    } else {
      alert("Erreur lors de l'enregistrement : " + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto text-white">
        
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-green-500">
            {project ? 'Modifier la vidéo' : 'Ajouter une vidéo'}
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition">
            <XCircle size={32}/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" placeholder="Titre" required 
              className="bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-green-500"
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
            <input 
              type="url" placeholder="Lien YouTube (ou Shorts)" required 
              className="bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-green-500"
              value={formData.youtube_url} 
              onChange={e => setFormData({...formData, youtube_url: e.target.value})} 
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-zinc-500 uppercase">Choisir les catégories :</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button 
                  key={cat.id} type="button" 
                  onClick={() => toggleCatSelection(cat.name)} 
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    selectedCats.includes(cat.name) 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" placeholder="Client (optionnel)" 
              className="bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-green-500"
              value={formData.client_name} 
              onChange={e => setFormData({...formData, client_name: e.target.value})} 
            />
            <input 
              type="date" 
              className="bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-green-500 text-white"
              value={formData.project_date} 
              onChange={e => setFormData({...formData, project_date: e.target.value})} 
            />
          </div>

          <textarea 
            placeholder="Description (mentionnez 'drone' ici pour le tag auto...)" 
            rows={4} 
            className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-green-500"
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
          />

          <button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-500 text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] transition-all"
          >
            {project ? 'Mettre à jour' : 'Publier le contenu'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;