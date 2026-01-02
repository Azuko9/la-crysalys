"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Pencil, Trash2, ShieldAlert, PlusCircle, 
  XCircle, Settings, Check, Globe, Briefcase, Calendar, ArrowUpDown
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

// --- SOUS-COMPOSANT CARTE (Pour gérer le hover localement) ---
const ProjectCard = ({ 
    projet, 
    user, 
    onEdit, 
    onDelete, 
    formaterDateFr 
}: { 
    projet: Project; 
    user: any; 
    onEdit: (p: Project) => void; 
    onDelete: (id: string) => void;
    formaterDateFr: (d: string | null) => string;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const videoId = getYouTubeID(projet.youtube_url);
    const router = useRouter();

    return (
        <div 
            className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col relative group hover:border-green-500 transition-all shadow-lg overflow-hidden cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => router.push(`/realisations/${projet.id}`)}
        >
            {/* BOUTONS ADMIN */}
            {user && (
                <div className="absolute top-2 right-2 z-30 flex gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(projet); }} 
                        className="bg-blue-600 text-white p-2 rounded hover:scale-110 transition shadow-xl"
                    >
                        <Pencil size={14} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(projet.id); }} 
                        className="bg-red-600 text-white p-2 rounded hover:scale-110 transition shadow-xl"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}

            {/* ZONE VIDEO / THUMBNAIL */}
            <div className="relative aspect-video bg-black overflow-hidden">
                {videoId ? (
                    <>
                        {/* Image de couverture (Thumbnail) */}
                        <img 
                            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                            alt={projet.title}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-60'}`}
                        />
                        
                        {/* Iframe chargée uniquement au survol */}
                        {isHovered && (
                            <iframe 
                                className="absolute inset-0 w-full h-full pointer-events-none scale-105" 
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0&modestbranding=1&iv_load_policy=3`} 
                                title={projet.title} 
                                allow="autoplay"
                            />
                        )}

                        {/* Overlay invisible pour bloquer les clics sur l'iframe YouTube */}
                        <div className="absolute inset-0 z-10" />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-700 italic">Vidéo indisponible</div>
                )}
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-green-500 transition-colors">
                        {projet.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
                        <Calendar size={14} className="text-green-500" />
                        <span>{formaterDateFr(projet.project_date)}</span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed italic">
                        {projet.description || "Aucune description."}
                    </p>
                    
                    {projet.client_name && (
                        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center text-xs text-gray-300 gap-2">
                            <Briefcase size={14} className="text-green-500"/>
                            <span className="font-semibold">{projet.client_name}</span>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-green-400 font-bold uppercase tracking-widest mt-6">
                    <span className="bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                        {projet.category}
                    </span>
                    <span className="text-gray-600 group-hover:text-green-500 transition-colors flex items-center gap-1">
                        Voir détail <ArrowLeft size={10} className="rotate-180" />
                    </span>
                </div>
            </div>
        </div>
    );
};

// --- COMPOSANT PRINCIPAL ---
export default function Realisations() {
  const [projets, setProjets] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [filtreActuel, setFiltreActuel] = useState("Tout");
  const [ordreTri, setOrdreTri] = useState<"desc" | "asc">("desc");
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  const [formData, setFormData] = useState({
    title: "", youtube_url: "", category: "Divers", description: "",
    client_name: "", client_website: "", project_date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const formaterDateFr = (dateString: string | null) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      await fetchCategories();
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => { fetchProjects(); }, [ordreTri]);

  const fetchProjects = async () => {
    const { data } = await supabase.from('portfolio_items').select('*').order('project_date', { ascending: ordreTri === "asc" });
    setProjets((data as Project[]) || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
    setCategories((data as Category[]) || []);
  };

  // LOGIQUE CATÉGORIES
  const startEditingCategory = (cat: Category) => {
    if (cat.name === "Drone" || cat.name === "Divers") return;
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
  };

  const saveCategoryName = async (id: string, oldName: string) => {
    if (!editingCatName.trim() || editingCatName === oldName) { setEditingCatId(null); return; }
    const { error } = await supabase.from('categories').update({ name: editingCatName.trim() }).eq('id', id);
    if (!error) {
        await supabase.from('portfolio_items').update({ category: editingCatName.trim() }).eq('category', oldName);
        setEditingCatId(null);
        await Promise.all([fetchCategories(), fetchProjects()]);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (name === "Drone" || name === "Divers") return;
    if (projets.some(p => p.category === name)) { alert("Catégorie utilisée !"); return; }
    if (confirm("Supprimer ?")) {
        await supabase.from('categories').delete().eq('id', id);
        fetchCategories();
    }
  };

  // LOGIQUE PROJETS
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    const payload = { ...formData, project_date: formData.project_date || new Date().toISOString().split('T')[0] };
    const { error } = editingId 
        ? await supabase.from('portfolio_items').update(payload).eq('id', editingId)
        : await supabase.from('portfolio_items').insert([payload]);

    if (!error) {
      setFormMessage("Succès !");
      handleCancelEdit();
      fetchProjects();
    }
    setLoadingForm(false);
  };

  const handleEditProject = (projet: Project) => {
    setEditingId(projet.id);
    setFormData({ ...projet, description: projet.description || "", client_name: projet.client_name || "", client_website: projet.client_website || "", project_date: projet.project_date || "" });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Supprimer ?")) {
        await supabase.from('portfolio_items').delete().eq('id', id);
        fetchProjects();
    }
  };

  const handleCancelEdit = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ title: "", youtube_url: "", category: "Divers", description: "", client_name: "", client_website: "", project_date: new Date().toISOString().split('T')[0] });
  };

  const projetsAffiches = filtreActuel === "Tout" ? projets : projets.filter(p => p.category === filtreActuel);

  return (
    <main className="min-h-screen bg-black text-white px-8 pb-8 pt-28">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition mb-6">
          <ArrowLeft className="mr-2" size={20} /> Retour
        </Link>
        <div className="flex justify-between items-end">
            <h1 className="text-4xl font-bold text-green-500">Réalisations Vidéo</h1>
            {user && <span className="text-[10px] bg-green-900/30 text-green-500 border border-green-500/50 px-3 py-1 rounded-full flex items-center gap-2 uppercase tracking-tighter"><ShieldAlert size={12}/> Admin</span>}
        </div>
      </div>

      {/* FILTRES */}
      <div className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex flex-wrap items-center gap-3">
            {user && (
                <button onClick={() => setIsManagingCats(!isManagingCats)} className={`p-2 rounded-full transition ${isManagingCats ? 'bg-green-600' : 'bg-gray-800'}`}>
                    <Settings size={20} />
                </button>
            )}
            <button onClick={() => setFiltreActuel("Tout")} className={`px-4 py-2 rounded-full text-sm font-bold border ${filtreActuel === "Tout" ? "bg-white text-black" : "bg-gray-900 text-gray-400 border-gray-800"}`}>Tout</button>
            {categories.map((cat) => (
                <div key={cat.id} className="relative group">
                    <button 
                        onClick={() => isManagingCats ? startEditingCategory(cat) : setFiltreActuel(cat.name)} 
                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${filtreActuel === cat.name ? "bg-green-600 border-green-600 text-white" : "bg-gray-900 border-gray-800 text-gray-400"}`}
                    >
                        {isManagingCats && editingCatId === cat.id ? (
                             <input autoFocus value={editingCatName} onChange={(e) => setEditingCatName(e.target.value)} onBlur={() => saveCategoryName(cat.id, cat.name)} className="bg-transparent outline-none w-20" />
                        ) : cat.name}
                    </button>
                    {isManagingCats && cat.name !== "Drone" && cat.name !== "Divers" && (
                        <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"><XCircle size={10}/></button>
                    )}
                </div>
            ))}
        </div>
        <button onClick={() => setOrdreTri(ordreTri === "desc" ? "asc" : "desc")} className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full text-sm text-gray-400 border border-gray-800">
            <ArrowUpDown size={16} className="text-green-500" /> {ordreTri === "desc" ? "Récents" : "Anciens"}
        </button>
      </div>

      {/* ADMIN FORM */}
      {user && (
        <div className="max-w-4xl mx-auto mb-16">
            {!isFormOpen ? (
                <button onClick={() => setIsFormOpen(true)} className="w-full border-2 border-dashed border-gray-800 hover:border-green-500 p-8 rounded-2xl text-gray-500 hover:text-green-500 transition-all flex flex-col items-center gap-2">
                    <PlusCircle size={40} /> <span className="font-bold">Ajouter un projet</span>
                </button>
            ) : (
                <div className="p-8 bg-gray-900 rounded-2xl border border-gray-800">
                    <form onSubmit={handleSubmitProject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="text" placeholder="Titre" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="md:col-span-2 bg-black border border-gray-700 p-3 rounded" />
                        <input type="url" placeholder="Lien YouTube" required value={formData.youtube_url} onChange={(e) => setFormData({...formData, youtube_url: e.target.value})} className="bg-black border border-gray-700 p-3 rounded" />
                        <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="bg-black border border-gray-700 p-3 rounded">
                            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                        <input type="date" value={formData.project_date} onChange={(e) => setFormData({...formData, project_date: e.target.value})} className="bg-black border border-gray-700 p-3 rounded" />
                        <input type="text" placeholder="Client" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} className="bg-black border border-gray-700 p-3 rounded" />
                        <textarea placeholder="Description" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="md:col-span-2 bg-black border border-gray-700 p-3 rounded" />
                        <div className="md:col-span-2 flex gap-4">
                            <button type="submit" className="flex-1 bg-green-600 py-3 rounded font-bold">{loadingForm ? "..." : "Enregistrer"}</button>
                            <button type="button" onClick={handleCancelEdit} className="px-8 bg-gray-800 rounded">Annuler</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
      )}

      {/* GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {!loading && projetsAffiches.map((projet) => (
          <ProjectCard 
            key={projet.id} 
            projet={projet} 
            user={user} 
            onEdit={handleEditProject} 
            onDelete={handleDeleteProject}
            formaterDateFr={formaterDateFr}
          />
        ))}
      </div>
    </main>
  );
}