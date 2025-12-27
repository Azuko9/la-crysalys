"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import Link from "next/link";
import { 
  ArrowLeft, Pencil, Trash2, ShieldAlert, PlusCircle, 
  XCircle, Save, Settings, Check, Globe, Briefcase 
} from "lucide-react";

// --- TYPES ---
interface Category {
  id: string;
  name: string;
}

interface Project {
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

export default function Realisations() {
  const [projets, setProjets] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // FILTRES & ÉTATS
  const [filtreActuel, setFiltreActuel] = useState("Tout");
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  // FORMULAIRE
  const [formData, setFormData] = useState({
    title: "",
    youtube_url: "",
    category: "",
    description: "",
    client_name: "",
    client_website: "",
    project_date: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // CHARGEMENT
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      await Promise.all([fetchProjects(), fetchCategories()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from('portfolio_items').select('*').order('created_at', { ascending: false });
    setProjets((data as Project[]) || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
    setCategories((data as Category[]) || []);
  };

  // LOGIQUE CATÉGORIES
  const startEditingCategory = (cat: Category) => {
    if (cat.name === "Drone") { alert("🔒 La catégorie 'Drone' est protégée."); return; }
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
  };

  const saveCategoryName = async (id: string, oldName: string) => {
    if (!editingCatName.trim() || editingCatName === oldName) { setEditingCatId(null); return; }
    const newName = editingCatName.trim();
    const { error: catError } = await supabase.from('categories').update({ name: newName }).eq('id', id);
    if (catError) { alert("Erreur : " + catError.message); return; }
    await supabase.from('portfolio_items').update({ category: newName }).eq('category', oldName);
    setEditingCatId(null);
    await Promise.all([fetchCategories(), fetchProjects()]);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (name === "Drone") { alert("🔒 Impossible de supprimer 'Drone'."); return; }
    const videosUsingCat = projets.filter(p => p.category === name).length;
    if (videosUsingCat > 0) { alert(`⛔ Cette catégorie contient ${videosUsingCat} vidéo(s).`); return; }
    if (!confirm(`Supprimer la catégorie "${name}" ?`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) fetchCategories();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const { error } = await supabase.from('categories').insert([{ name: newCatName.trim() }]);
    if (!error) { setNewCatName(""); fetchCategories(); }
  };

  // LOGIQUE PROJETS
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    setFormMessage(null);
    const catToSave = formData.category || (categories.length > 0 ? categories[0].name : "Autre");
    
    const payload = { 
        title: formData.title, 
        youtube_url: formData.youtube_url, 
        category: catToSave, 
        description: formData.description || null,
        client_name: formData.client_name || null,
        client_website: formData.client_website || null,
        project_date: formData.project_date || new Date().toISOString().split('T')[0]
    };

    let error = null;
    if (editingId) {
      const { error: u } = await supabase.from('portfolio_items').update(payload).eq('id', editingId);
      error = u;
    } else {
      const { error: i } = await supabase.from('portfolio_items').insert([payload]);
      error = i;
    }

    if (error) setFormMessage("❌ Erreur : " + error.message);
    else {
      setFormMessage(editingId ? "✅ Modifié !" : "✅ Ajouté !");
      handleCancelEdit();
      fetchProjects();
    }
    setLoadingForm(false);
  };

  const handleEditProject = (projet: Project) => {
    setIsFormOpen(true);
    setEditingId(projet.id);
    setFormData({ 
        title: projet.title, 
        youtube_url: projet.youtube_url, 
        category: projet.category, 
        description: projet.description || "",
        client_name: projet.client_name || "",
        client_website: projet.client_website || "",
        project_date: projet.project_date || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("⚠️ Supprimer ce projet ?")) return;
    const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
    if (!error) { setProjets(prev => prev.filter(p => p.id !== id)); if (editingId === id) handleCancelEdit(); }
  };

  const handleCancelEdit = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ title: "", youtube_url: "", category: "", description: "", client_name: "", client_website: "", project_date: "" });
    setFormMessage(null);
  };

  const projetsAffiches = filtreActuel === "Tout" ? projets : projets.filter(p => p.category === filtreActuel);

  return (
    <main className="min-h-screen bg-black text-white px-8 pb-8 pt-28">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-wrap justify-between items-end gap-4">
            <h1 className="text-4xl font-bold text-green-500">Nos Réalisations</h1>
            {user && (
                <span className="text-xs font-bold text-green-500 bg-green-900/20 border border-green-900 px-3 py-1 rounded-full flex items-center gap-2">
                    <ShieldAlert size={14}/> Mode Admin
                </span>
            )}
        </div>
      </div>

      {/* FILTRES */}
      <div className="max-w-6xl mx-auto mb-12">
        {user && (
            <div className="mb-4 flex items-center gap-4">
                 <button onClick={() => setIsManagingCats(!isManagingCats)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition ${isManagingCats ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                    <Settings size={16} /> {isManagingCats ? "Terminer la gestion" : "Gérer les catégories"}
                </button>
            </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setFiltreActuel("Tout")} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${filtreActuel === "Tout" ? "bg-white text-black border-white" : "bg-gray-900 border-gray-800 text-gray-400"}`}>Tout</button>
            {categories.map((cat) => {
                const isDrone = cat.name === "Drone";
                return (
                <div key={cat.id} className="relative group">
                    {isManagingCats && editingCatId === cat.id ? (
                        <div className="flex items-center bg-gray-800 rounded-full px-2 border border-green-500">
                            <input autoFocus type="text" value={editingCatName} onChange={(e) => setEditingCatName(e.target.value)} className="bg-transparent text-white text-sm px-2 py-2 outline-none w-24" onKeyDown={(e) => { if (e.key === 'Enter') saveCategoryName(cat.id, cat.name); }} />
                            <button onClick={() => saveCategoryName(cat.id, cat.name)} className="text-green-500 hover:text-green-400 p-1"><Check size={14}/></button>
                        </div>
                    ) : (
                        <button onClick={() => isManagingCats ? startEditingCategory(cat) : setFiltreActuel(cat.name)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all border relative flex items-center gap-2 ${filtreActuel === cat.name ? (isDrone ? "bg-cyan-600 border-cyan-600 text-white shadow-lg shadow-cyan-900/50" : "bg-green-600 border-green-600 text-white") : (isDrone ? "bg-gray-900 border-cyan-900/50 text-cyan-500 hover:border-cyan-500" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600")}`}>
                            {cat.name}
                            {isManagingCats && !isDrone && <Pencil size={10} className="absolute top-1 right-1 text-green-500 opacity-50" />}
                        </button>
                    )}
                    {isManagingCats && editingCatId !== cat.id && !isDrone && (
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id, cat.name); }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:scale-110 transition z-10"><XCircle size={12} /></button>
                    )}
                </div>
            )})}
            {isManagingCats && (
                <form onSubmit={handleAddCategory} className="flex items-center gap-2">
                    <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Nouv..." className="bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm focus:border-green-500 outline-none w-24" />
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"><PlusCircle size={18} /></button>
                </form>
            )}
        </div>
      </div>

      {/* FORMULAIRE */}
      {user && (
        <div className="max-w-4xl mx-auto mb-16">
            {!isFormOpen ? (
                <button onClick={() => setIsFormOpen(true)} className="w-full bg-gray-900 border border-gray-800 hover:border-green-500 text-gray-300 hover:text-white p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group shadow-lg">
                    <div className="bg-gray-800 group-hover:bg-green-600 p-3 rounded-full transition duration-300"><PlusCircle size={32} className="text-white" /></div>
                    <span className="font-bold text-lg">Ajouter une nouvelle réalisation</span>
                </button>
            ) : (
                <div className={`p-8 rounded-2xl border shadow-2xl transition-all duration-500 ${editingId ? 'bg-gray-800 border-green-500' : 'bg-gray-900 border-gray-800'}`}>
                    <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">{editingId ? (<> <Pencil className="text-green-500" /> Modifier le projet </>) : (<> <PlusCircle className="text-green-500" /> Ajouter une réalisation </>)}</h2>
                        <button onClick={handleCancelEdit} className="text-gray-500 hover:text-white transition"><XCircle size={24} /></button>
                    </div>
                    <form onSubmit={handleSubmitProject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2"><label className="text-sm text-gray-400 block mb-1">Titre</label><input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 focus:border-green-500 outline-none" /></div>
                        <div><label className="text-sm text-gray-400 block mb-1">Lien YouTube</label><input type="url" required value={formData.youtube_url} onChange={(e) => setFormData({...formData, youtube_url: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 focus:border-green-500 outline-none" /></div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Catégorie</label>
                            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 focus:border-green-500 outline-none">
                                <option value="" disabled>Choisir une catégorie...</option>
                                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div><label className="text-sm text-gray-400 block mb-1">Nom du Client</label><input type="text" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 focus:border-green-500 outline-none" placeholder="Ex: Nike..." /></div>
                        <div><label className="text-sm text-gray-400 block mb-1">Site Web du Client</label><input type="url" value={formData.client_website} onChange={(e) => setFormData({...formData, client_website: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 focus:border-green-500 outline-none" placeholder="https://..." /></div>
                        <div className="md:col-span-2"><label className="text-sm text-gray-400 block mb-1">Description</label><textarea rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 focus:border-green-500 outline-none" /></div>
                        <div className="md:col-span-2 flex items-center gap-4 pt-4"><button type="submit" disabled={loadingForm} className="flex-1 bg-white text-black font-bold py-3 rounded hover:bg-green-500 hover:text-white transition flex justify-center gap-2">{loadingForm ? "..." : (editingId ? <><Save size={18}/> Enregistrer</> : <><PlusCircle size={18}/> Publier</>)}</button><button type="button" onClick={handleCancelEdit} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold">Annuler</button></div>
                        {formMessage && <div className={`md:col-span-2 p-3 rounded text-center font-bold ${formMessage.includes('Erreur') ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>{formMessage}</div>}
                    </form>
                </div>
            )}
        </div>
      )}

      {/* --- GRID PROJETS --- */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {!loading && projetsAffiches.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
                <p className="text-gray-500">Aucun projet dans cette catégorie.</p>
            </div>
        )}
        
        {projetsAffiches.map((projet) => {
          const videoId = getYouTubeID(projet.youtube_url);
          const isBeingEdited = editingId === projet.id;
          
          return (
            <div key={projet.id} className={`bg-gray-900 border rounded-xl flex flex-col relative group transition-colors ${isBeingEdited ? 'border-green-500 ring-2 ring-green-500' : 'border-gray-800 hover:border-green-500 shadow-lg'}`}>
              
              {user && (
                <div className="absolute top-2 right-2 z-20 flex gap-2">
                    <button onClick={() => handleEditProject(projet)} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded shadow-lg transition hover:scale-110"><Pencil size={16} /></button>
                    <button onClick={() => handleDeleteProject(projet.id)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded shadow-lg transition hover:scale-110"><Trash2 size={16} /></button>
                </div>
              )}

              {/* ✅ ZONE VIDÉO - LA MÉTHODE NATIVE */}
              <div className="relative w-full aspect-video z-10">
                {videoId ? (
                  <iframe
                    className="w-full h-full rounded-t-xl" // L'arrondi est appliqué ICI
                    src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                    title={projet.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen={true} // Syntaxe React correcte
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600 bg-black rounded-t-xl">
                    Pas de vidéo
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between rounded-b-xl z-20 bg-gray-900">
                <div>
                    <h3 className="text-xl font-bold mb-2 text-white">{projet.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{projet.description}</p>
                    
                    {(projet.client_name || projet.client_website) && (
                        <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col gap-2">
                            {projet.client_name && (
                                <div className="flex items-center text-sm text-gray-300 gap-2">
                                    <Briefcase size={14} className="text-green-500"/>
                                    <span className="font-semibold">{projet.client_name}</span>
                                </div>
                            )}
                            {projet.client_website && (
                                <a href={projet.client_website} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-green-400 hover:text-white gap-2 transition w-fit">
                                    <Globe size={14}/>
                                    Visiter le site web
                                </a>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="flex justify-between items-center text-xs text-green-400 font-bold uppercase tracking-wider mt-4">
                    <span>{projet.category}</span>
                    {isBeingEdited && <span className="animate-pulse text-white">En cours...</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}