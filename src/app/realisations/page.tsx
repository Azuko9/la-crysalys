"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import Link from "next/link";
import { 
  ArrowLeft, Pencil, Trash2, ShieldAlert, PlusCircle, 
  XCircle, Save, Settings, Check, Globe, Briefcase, Calendar, ArrowUpDown
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

  // FILTRES & TRI
  const [filtreActuel, setFiltreActuel] = useState("Tout");
  const [ordreTri, setOrdreTri] = useState<"desc" | "asc">("desc");
  
  // GESTION CATÉGORIES
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  // FORMULAIRE PROJETS
  const [formData, setFormData] = useState({
    title: "",
    youtube_url: "",
    category: "Divers",
    description: "",
    client_name: "",
    client_website: "",
    project_date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // --- FONCTION FORMATAGE DATE FR ---
  const formaterDateFr = (dateString: string | null) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // CHARGEMENT INITIAL
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      await fetchCategories();
      setLoading(false);
    };
    fetchData();
  }, []);

  // RECHARGER PROJETS QUAND LE TRI CHANGE
  useEffect(() => {
    fetchProjects();
  }, [ordreTri]);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('project_date', { ascending: ordreTri === "asc" });
    setProjets((data as Project[]) || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
    setCategories((data as Category[]) || []);
  };

  // --- LOGIQUE CATÉGORIES ---
  const startEditingCategory = (cat: Category) => {
    if (cat.name === "Drone"|| cat.name === "Divers") { alert("🔒 La catégorie 'Drone' est protégée."); return; }
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
    if (name === "Divers") { alert("🔒 Impossible de supprimer 'Divers'."); return; }
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

  // --- LOGIQUE PROJETS ---
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
        project_date: projet.project_date || new Date().toISOString().split('T')[0]
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
    setFormData({ 
      title: "", 
      youtube_url: "", 
      category: "", 
      description: "", 
      client_name: "", 
      client_website: "", 
      project_date: new Date().toISOString().split('T')[0] 
    });
    setFormMessage(null);
  };

  const projetsAffiches = filtreActuel === "Tout" ? projets : projets.filter(p => p.category === filtreActuel);

  return (
    <main className="min-h-screen bg-black text-white px-8 pb-8 pt-28">
      
      {/* HEADER PAGE */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition mb-6">
          <ArrowLeft className="mr-2" size={20} />
          Retour à l&apos;accueil
        </Link>
        <div className="flex flex-wrap justify-between items-end gap-4">
            <h1 className="text-4xl font-bold text-green-500">Nos Réalisations</h1>
            {user && (
                <span className="text-xs font-bold text-green-500 bg-green-900/20 border border-green-900 px-3 py-1 rounded-full flex items-center gap-2">
                    <ShieldAlert size={14}/> Mode Admin
                </span>
            )}
        </div>
      </div>

      {/* FILTRES & TRI */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-3">
              {user && (
                  <button onClick={() => setIsManagingCats(!isManagingCats)} className={`p-2 rounded-full transition ${isManagingCats ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                      <Settings size={20} />
                  </button>
              )}
              <button onClick={() => setFiltreActuel("Tout")} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${filtreActuel === "Tout" ? "bg-white text-black border-white" : "bg-gray-900 border-gray-800 text-gray-400"}`}>Tout</button>
              {categories.map((cat) => (
                  <div key={cat.id} className="relative group">
                      {isManagingCats && editingCatId === cat.id ? (
                          <div className="flex items-center bg-gray-800 rounded-full px-2 border border-green-500">
                              <input autoFocus type="text" value={editingCatName} onChange={(e) => setEditingCatName(e.target.value)} className="bg-transparent text-white text-sm px-2 py-2 outline-none w-24" onKeyDown={(e) => { if (e.key === 'Enter') saveCategoryName(cat.id, cat.name); }} />
                              <button onClick={() => saveCategoryName(cat.id, cat.name)} className="text-green-500 hover:text-green-400 p-1"><Check size={14}/></button>
                          </div>
                      ) : (
                          <button onClick={() => isManagingCats ? startEditingCategory(cat) : setFiltreActuel(cat.name)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all border relative flex items-center gap-2 ${filtreActuel === cat.name ? "bg-green-600 border-green-600 text-white" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600"}`}>
                              {cat.name}
                              {isManagingCats && cat.name !== "Drone" && cat.name !== "Divers"&& (<Pencil size={10} className="text-green-500 opacity-50" />)}
                          </button>
                      )}
                      {isManagingCats && editingCatId !== cat.id && cat.name !== "Drone" && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id, cat.name); }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:scale-110 transition z-10"><XCircle size={12} /></button>
                      )}
                  </div>
              ))}
          </div>

          {/* SÉLECTEUR DE TRI */}
          <button 
            onClick={() => setOrdreTri(ordreTri === "desc" ? "asc" : "desc")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-full text-sm font-bold text-gray-400 hover:text-white hover:border-green-500 transition-all"
          >
            <ArrowUpDown size={16} className="text-green-500" />
            {ordreTri === "desc" ? "Plus récents" : "Plus anciens"}
          </button>
        </div>
      </div>

      {/* FORMULAIRE D'AJOUT (ADMIN) */}
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
                        <h2 className="text-xl font-bold flex items-center gap-2">{editingId ? (<> <Pencil className="text-green-500" /> Modifier </>) : (<> <PlusCircle className="text-green-500" /> Publier </>)}</h2>
                        <button onClick={handleCancelEdit} className="text-gray-500 hover:text-white transition"><XCircle size={24} /></button>
                    </div>
                    <form onSubmit={handleSubmitProject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2"><label className="text-sm text-gray-400 block mb-1">Titre</label><input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 focus:border-green-500 outline-none" /></div>
                        <div><label className="text-sm text-gray-400 block mb-1">Lien YouTube</label><input type="url" required value={formData.youtube_url} onChange={(e) => setFormData({...formData, youtube_url: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 focus:border-green-500 outline-none" /></div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Catégorie</label>
                            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 focus:border-green-500 outline-none">
                                <option value="" disabled>Choisir...</option>
                                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Date du projet</label>
                            <input type="date" required value={formData.project_date} onChange={(e) => setFormData({...formData, project_date: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 focus:border-green-500 outline-none" />
                        </div>
                        <div><label className="text-sm text-gray-400 block mb-1">Nom du Client</label><input type="text" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 focus:border-green-500 outline-none" placeholder="Nike, Mairie..." /></div>
                        <div className="md:col-span-2"><label className="text-sm text-gray-400 block mb-1">Description</label><textarea rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 focus:border-green-500 outline-none" /></div>
                        <div className="md:col-span-2 flex items-center gap-4 pt-4"><button type="submit" disabled={loadingForm} className="flex-1 bg-white text-black font-bold py-3 rounded hover:bg-green-500 hover:text-white transition flex justify-center gap-2">{loadingForm ? "chargement..." : (editingId ? "Enregistrer" : "Publier")}</button><button type="button" onClick={handleCancelEdit} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold">Annuler</button></div>
                        {formMessage && <div className="md:col-span-2 p-3 rounded text-center font-bold bg-gray-800 text-green-400">{formMessage}</div>}
                    </form>
                </div>
            )}
        </div>
      )}

      {/* GRID DES PROJETS */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {!loading && projetsAffiches.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
                <p className="text-gray-500">Aucun projet trouvé.</p>
            </div>
        )}
        
        {projetsAffiches.map((projet) => {
          const videoId = getYouTubeID(projet.youtube_url);
          return (
            <div key={projet.id} className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col relative group hover:border-green-500 transition-all shadow-lg overflow-hidden">
              {user && (
                <div className="absolute top-2 right-2 z-20 flex gap-2">
                    <button onClick={() => handleEditProject(projet)} className="bg-blue-600 text-white p-2 rounded hover:scale-110 transition"><Pencil size={14} /></button>
                    <button onClick={() => handleDeleteProject(projet.id)} className="bg-red-600 text-white p-2 rounded hover:scale-110 transition"><Trash2 size={14} /></button>
                </div>
              )}

              <div className="relative aspect-video bg-black">
                {videoId ? (
                  <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}?rel=0`} title={projet.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                ) : <div className="flex items-center justify-center h-full text-gray-700 italic">Vidéo indisponible</div>}
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white line-clamp-1">{projet.title}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
                      <Calendar size={14} className="text-green-500" />
                      <span>{formaterDateFr(projet.project_date)}</span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">{projet.description}</p>
                    
                    {projet.client_name && (
                        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center text-xs text-gray-300 gap-2">
                            <Briefcase size={14} className="text-green-500"/>
                            <span className="font-semibold">{projet.client_name}</span>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-green-400 font-bold uppercase tracking-widest mt-6">
                    <span className="bg-green-500/10 px-2 py-1 rounded">{projet.category}</span>
                    {projet.client_website && (
                      <a href={projet.client_website} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition flex items-center gap-1">
                        Site <Globe size={10} />
                      </a>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}