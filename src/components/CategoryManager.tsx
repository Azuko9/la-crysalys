"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Tag, Layers, Plus, Trash2, Pencil, Check, X, AlertTriangle } from "lucide-react";

export interface Category {
  id: string;
  name: string;
}

interface CategoryManagerProps {
  categories: Category[];
  refreshCategories: () => Promise<void>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, refreshCategories }) => {
  const [newCatName, setNewCatName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = async () => {
    if (!newCatName.trim()) return;
    const { error } = await supabase.from('categories').insert([{ name: newCatName.trim() }]);
    if (!error) {
      setNewCatName("");
      await refreshCategories();
    }
  };

  const handleUpdateName = async (id: string) => {
    if (!editValue.trim()) return;
    const { error } = await supabase
      .from('categories')
      .update({ name: editValue.trim() })
      .eq('id', id);

    if (!error) {
      setEditingId(null);
      await refreshCategories();
    }
  };

  // --- SÉCURITÉ DE SUPPRESSION ---
  const deleteCategory = async (cat: Category) => {
    // 1. On vérifie si des vidéos utilisent cette catégorie
    // On utilise .ilike car tes catégories sont stockées dans une string séparée par des virgules
    const { count, error: checkError } = await supabase
      .from('portfolio_items')
      .select('*', { count: 'exact', head: true })
      .ilike('category', `%${cat.name}%`);

    if (checkError) {
      console.error("Erreur de vérification:", checkError);
      return;
    }

    // 2. Si des vidéos sont trouvées, on bloque
    if (count && count > 0) {
      alert(`Action impossible : Il y a encore ${count} vidéo(s) liées à la catégorie "${cat.name.toUpperCase()}". \n\nModifiez d'abord ces vidéos avant de supprimer la catégorie.`);
      return;
    }

    // 3. Sinon, on demande confirmation et on supprime
    if (confirm(`Confirmez-vous la suppression définitive de "${cat.name.toUpperCase()}" ?`)) {
      await supabase.from('categories').delete().eq('id', cat.id);
      await refreshCategories();
    }
  };

  return (
    <div className="max-w-7xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
      
      <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl">
        <h3 className="font-bold mb-6 flex items-center gap-2 text-green-500 uppercase text-[10px] tracking-[0.2em]">
          <Tag size={16}/> Gestion des Métiers
        </h3>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-xl border border-zinc-800 transition-all hover:border-zinc-700">
              
              {editingId === cat.id ? (
                <div className="flex items-center gap-2">
                  <input 
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="bg-zinc-800 text-[10px] uppercase font-black px-2 py-1 rounded outline-none border border-green-500 w-24 text-white"
                  />
                  <button onClick={() => handleUpdateName(cat.id)} className="text-green-500"><Check size={14}/></button>
                  <button onClick={() => setEditingId(null)} className="text-zinc-500"><X size={14}/></button>
                </div>
              ) : (
                <>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-1 ml-2 border-l border-zinc-800 pl-2">
                    <button 
                      onClick={() => { setEditingId(cat.id); setEditValue(cat.name); }}
                      className="text-zinc-600 hover:text-blue-500 transition-colors"
                      title="Modifier le nom"
                    >
                      <Pencil size={12}/>
                    </button>
                    <button 
                      onClick={() => deleteCategory(cat)}
                      className="text-zinc-600 hover:text-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            value={newCatName} onChange={e => setNewCatName(e.target.value)}
            className="bg-black border border-zinc-800 p-4 rounded-xl flex-1 text-sm outline-none focus:border-green-500 transition-all text-white" 
            placeholder="Nouveau métier..."
          />
          <button onClick={handleAdd} className="bg-green-600 hover:bg-green-500 px-6 rounded-xl font-bold text-black transition-all">
            <Plus size={24}/>
          </button>
        </div>
      </div>

      <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl opacity-60">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-500 uppercase text-[10px] tracking-[0.2em]">
          <Layers size={16}/> Labels Systèmes
        </h3>
        <div className="flex gap-2 mb-6">
          {["Drone", "Post-Prod", "Short"].map(label => (
            <div key={label} className="bg-blue-500/5 text-blue-400/50 border border-blue-500/10 px-3 py-2 rounded-xl text-[10px] font-black uppercase">
              {label}
            </div>
          ))}
        </div>
        <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-amber-500/70">
            <AlertTriangle size={18} className="shrink-0" />
            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-tighter">
                Sécurité active : La suppression d'une catégorie est bloquée tant que des vidéos y sont rattachées pour éviter les erreurs d'affichage sur le portfolio.
            </p>
        </div>
      </div>
    </div>
  );
};