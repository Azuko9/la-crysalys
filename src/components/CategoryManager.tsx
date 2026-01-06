"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Tag, XCircle, PlusCircle } from "lucide-react";

// Définition de l'interface pour TypeScript
export interface Category {
  id: string;
  name: string;
}

interface CategoryManagerProps {
  categories: Category[];
  refreshCategories: () => Promise<void>; // Fonction pour recharger la liste après action
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, refreshCategories }) => {
  const [newCatName, setNewCatName] = useState("");

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const { error } = await supabase.from('categories').insert([{ name: newCatName.trim() }]);
    if (!error) {
      setNewCatName("");
      await refreshCategories();
    }
  };

  const deleteCategory = async (cat: Category) => {
    // Sécurité pour ne pas supprimer les catégories vitales
    if (cat.name === "Divers" || cat.name === "Drone") return;
    
    if (confirm(`Supprimer la catégorie ${cat.name} ?`)) {
      const { error } = await supabase.from('categories').delete().eq('id', cat.id);
      if (!error) await refreshCategories();
    }
  };

  return (
    <div className="max-w-7xl mx-auto mb-10 p-6 bg-zinc-900 rounded-2xl border border-zinc-800">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <Tag size={18} className="text-green-500"/> Liste des catégories
      </h3>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-sm font-bold uppercase">{cat.name}</span>
            {cat.name !== "Divers" && cat.name !== "Drone" && (
              <button 
                onClick={() => deleteCategory(cat)} 
                className="text-red-500 hover:text-white transition"
              >
                <XCircle size={14}/>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Nouvelle catégorie..." 
          value={newCatName} 
          onChange={(e) => setNewCatName(e.target.value)} 
          className="bg-black border border-zinc-800 px-4 py-2 rounded-lg flex-1 outline-none focus:border-green-500" 
        />
        <button 
          onClick={handleAddCategory} 
          className="bg-green-600 px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-500 transition"
        >
          <PlusCircle size={18}/> Ajouter
        </button>
      </div>
    </div>
  );
};