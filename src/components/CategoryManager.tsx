"use client";

import React, { useState, useRef, useEffect } from "react";
import { Tag, Layers, Plus, Trash2, Pencil, Check, X, AlertTriangle, Loader2 } from "lucide-react";
import { saveCategoryAction, deleteCategoryAction } from "@/lib/actions";
import type { Category } from "@/types";

interface CategoryManagerProps {
  categories: Category[];
  refreshCategories: () => Promise<void>;
}

type LoadingState = {
  type: 'add' | 'update' | 'delete';
  id?: string;
} | null;

type MessageState = {
  type: 'success' | 'error';
  text: string;
} | null;

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, refreshCategories }) => {
  const [newCatName, setNewCatName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState<LoadingState>(null);
  const [message, setMessage] = useState<MessageState>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Efface le message après un délai
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Met le focus sur le champ d'édition
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleAdd = async () => {
    if (!newCatName.trim()) return;
    setLoading({ type: 'add' });
    setMessage(null);

    const result = await saveCategoryAction({ name: newCatName }, null);

    if (result.success) {
      setMessage({ type: 'success', text: `Catégorie "${newCatName}" ajoutée.` });
      setNewCatName("");
      await refreshCategories();
    } else {
      setMessage({ type: 'error', text: ('error' in result && result.error) || "Une erreur est survenue." });
    }
    setLoading(null);
  };

  const handleUpdate = async (id: string) => {
    if (!editValue.trim()) return;
    setLoading({ type: 'update', id });
    setMessage(null);

    const result = await saveCategoryAction({ name: editValue }, id);

    if (result.success) {
      setMessage({ type: 'success', text: 'Catégorie mise à jour.' });
      setEditingId(null);
      await refreshCategories();
    } else {
      setMessage({ type: 'error', text: ('error' in result && result.error) || "Une erreur est survenue." });
    }
    setLoading(null);
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Confirmez-vous la suppression définitive de "${cat.name.toUpperCase()}" ?`)) return;
    
    setLoading({ type: 'delete', id: cat.id });
    setMessage(null);

    const result = await deleteCategoryAction(cat.id, cat.name);

    if (result.success) {
      setMessage({ type: 'success', text: `Catégorie "${cat.name}" supprimée.` });
      await refreshCategories();
    } else {
      setMessage({ type: 'error', text: ('error' in result && result.error) || "Une erreur est survenue." });
    }
    setLoading(null);
  };

  return (
    <div className="max-w-7xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
      
      <div className="p-6 bg-card rounded-dynamic border border-zinc-800 shadow-2xl">
        <h3 className="font-bold mb-6 flex items-center gap-2 text-primary uppercase text-[10px] tracking-[0.2em]">
          <Tag size={16}/> Gestion des Métiers
        </h3>

        {/* --- Zone de Messages --- */}
        {message && (
          <div className={`p-3 rounded-lg mb-4 text-xs font-bold text-center ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6 min-h-[60px]">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-xl border border-zinc-800 transition-all hover:border-zinc-700">
              
              {editingId === cat.id ? (
                <div className="flex items-center gap-2">
                  <input 
                    ref={editInputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                    className="bg-zinc-800 text-[10px] uppercase font-black px-2 py-1 rounded outline-none border border-primary w-24 text-white"
                    disabled={loading?.type === 'update'}
                  />
                  {loading?.type === 'update' && loading.id === cat.id ? (
                    <Loader2 size={14} className="animate-spin text-primary"/>
                  ) : (
                    <>
                      <button onClick={() => handleUpdate(cat.id)} className="text-primary hover:text-white"><Check size={14}/></button>
                      <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-white"><X size={14}/></button>
                    </>
                  )}
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
                      disabled={!!loading}
                    >
                      <Pencil size={12}/>
                    </button>
                    {loading?.type === 'delete' && loading.id === cat.id ? (
                      <Loader2 size={12} className="animate-spin text-red-500"/>
                    ) : (
                      <button 
                        onClick={() => handleDelete(cat)}
                        className="text-zinc-600 hover:text-red-500 transition-colors"
                        title="Supprimer"
                        disabled={!!loading}
                      >
                        <Trash2 size={12}/>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            value={newCatName} 
            onChange={e => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="bg-background border border-zinc-800 p-4 rounded-xl flex-1 text-sm outline-none focus:border-primary transition-all text-white" 
            placeholder="Nouveau métier..."
            disabled={!!loading}
          />
          <button onClick={handleAdd} className="bg-primary hover:bg-green-500 px-6 rounded-xl font-bold text-black transition-all flex items-center justify-center disabled:opacity-50" disabled={!!loading}>
            {loading?.type === 'add' ? <Loader2 size={24} className="animate-spin"/> : <Plus size={24}/>}
          </button>
        </div>
      </div>

      <div className="p-6 bg-card rounded-dynamic border border-zinc-800 shadow-2xl opacity-60">
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
        <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-dynamic text-amber-500/70">
            <AlertTriangle size={18} className="shrink-0" />
            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-tighter">
                Sécurité active : La suppression d'une catégorie est bloquée tant que des vidéos y sont rattachées pour éviter les erreurs d'affichage sur le portfolio.
            </p>
        </div>
      </div>
    </div>
  );
};