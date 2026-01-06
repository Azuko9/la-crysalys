"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Pencil, Trash2, ShieldAlert, PlusCircle, 
  XCircle, Settings, Check, Calendar, ArrowUpDown, Play, Tag
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
  category: string; // Stocké sous forme "Cat1, Cat2"
  description: string | null;
  client_name: string | null;
  client_website: string | null;
  project_date: string | null;
  created_at?: string;
}

const ProjectCard = ({ projet, user, onEdit, onDelete, formaterDateFr }: any) => {
    const [isHovered, setIsHovered] = useState(false);
    const videoId = getYouTubeID(projet.youtube_url);
    const isShort = projet.youtube_url.includes('/shorts/');
    const router = useRouter();
    const categories = projet.category.split(',').map((c: string) => c.trim());

    return (
        <div 
            className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col relative group hover:border-green-500 transition-all shadow-lg overflow-hidden cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => router.push(`/realisations/${projet.id}`)}
        >
            {user && (
                <div className="absolute top-2 right-2 z-30 flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(projet); }} className="bg-blue-600 text-white p-2 rounded hover:scale-110 transition"><Pencil size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(projet.id); }} className="bg-red-600 text-white p-2 rounded hover:scale-110 transition"><Trash2 size={14} /></button>
                </div>
            )}

            <div className={`relative bg-black overflow-hidden ${isShort ? 'aspect-[9/16]' : 'aspect-video'}`}>
                {videoId ? (
                    <>
                        <img 
                            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                            alt={projet.title}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-60'}`}
                        />
                        {isHovered && (
                            <iframe 
                                className="absolute inset-0 w-full h-full pointer-events-none scale-105" 
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0`} 
                                allow="autoplay"
                            />
                        )}
                    </>
                ) : <div className="flex items-center justify-center h-full text-gray-700 italic">Vidéo indisponible</div>}
            </div>
            
            <div className="p-5 flex-1 flex flex-col justify-between border-t border-gray-800">
                <div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 uppercase tracking-wider">{projet.title}</h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                        {categories.map((cat: string, i: number) => (
                            <span key={i} className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase font-bold">
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase mt-2">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {formaterDateFr(projet.project_date)}</span>
                    <span className="flex items-center gap-1 group-hover:text-green-500 transition-colors">Détails <ArrowLeft size={10} className="rotate-180" /></span>
                </div>
            </div>
        </div>
    );
};

export default function Realisations() {
  const [projets, setProjets] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filtreActuel, setFiltreActuel] = useState("Tout");
  
  // États Gestion Catégories
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  // État Formulaire Projet
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCats, setSelectedCats] = useState<string[]>(["Divers"]);
  const [formData, setFormData] = useState({
    title: "", youtube_url: "", description: "",
    client_name: "", client_website: "", project_date: new Date().toISOString().split('T')[0]
  });

  const formaterDateFr = (d: string | null) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "N/A";

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      await fetchCategories();
      await fetchProjects();
      setLoading(false);
    };
    init();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from('portfolio_items').select('*').order('project_date', { ascending: false });
    setProjets((data as Project[]) || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
    setCategories((data as Category[]) || []);
  };

  // --- LOGIQUE CATÉGORIES ---
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await supabase.from('categories').insert([{ name: newCatName.trim() }]);
    setNewCatName("");
    fetchCategories();
  };

  const deleteCategory = async (cat: Category) => {
    if (cat.name === "Divers" || cat.name === "Drone") return;
    if (confirm(`Supprimer la catégorie ${cat.name} ?`)) {
        await supabase.from('categories').delete().eq('id', cat.id);
        fetchCategories();
    }
  };

  // --- LOGIQUE PROJET ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Automatisation Drone
    let finalCats = [...selectedCats];
    if (formData.description.toLowerCase().includes("drone") && !finalCats.includes("Drone")) {
        finalCats.push("Drone");
    }
    
    const payload = { 
        ...formData, 
        category: finalCats.join(', ') // On stocke en string séparé par virgule
    };

    const { error } = editingId 
        ? await supabase.from('portfolio_items').update(payload).eq('id', editingId)
        : await supabase.from('portfolio_items').insert([payload]);

    if (!error) { 
        setIsFormOpen(false); 
        setEditingId(null); 
        setSelectedCats(["Divers"]);
        fetchProjects(); 
    }
  };

  const toggleCatSelection = (name: string) => {
    setSelectedCats(prev => 
        prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const filtered = filtreActuel === "Tout" 
    ? projets 
    : projets.filter(p => p.category.includes(filtreActuel));

  const shorts = filtered.filter(p => p.youtube_url.includes('/shorts/'));
  const videosClassiques = filtered.filter(p => !p.youtube_url.includes('/shorts/'));

  return (
    <main className="min-h-screen bg-black text-white px-8 pb-20 pt-28">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-2">Portfolio</h1>
        <div className="flex justify-between items-center">
            <p className="text-green-500 font-bold uppercase text-xs tracking-widest">Productions Vidéos & Drone</p>
            {user && (
                <button onClick={() => setIsManagingCats(!isManagingCats)} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${isManagingCats ? 'bg-green-600 border-green-600' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                    <Settings size={16}/> {isManagingCats ? "Fermer Gestion" : "Gérer les catégories"}
                </button>
            )}
        </div>
      </div>

      {/* GESTION CATÉGORIES (ADMIN) */}
      {isManagingCats && user && (
          <div className="max-w-7xl mx-auto mb-10 p-6 bg-zinc-900 rounded-2xl border border-zinc-800">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Tag size={18} className="text-green-500"/> Liste des catégories</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map(cat => (
                      <div key={cat.id} className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-lg border border-zinc-800">
                          <span className="text-sm font-bold uppercase">{cat.name}</span>
                          {cat.name !== "Divers" && cat.name !== "Drone" && (
                              <button onClick={() => deleteCategory(cat)} className="text-red-500 hover:text-white transition"><XCircle size={14}/></button>
                          )}
                      </div>
                  ))}
              </div>
              <div className="flex gap-2">
                  <input type="text" placeholder="Nouvelle catégorie..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="bg-black border border-zinc-800 px-4 py-2 rounded-lg flex-1 outline-none focus:border-green-500" />
                  <button onClick={handleAddCategory} className="bg-green-600 px-6 py-2 rounded-lg font-bold">Ajouter</button>
              </div>
          </div>
      )}

      {/* FILTRES D'AFFICHAGE */}
      <div className="max-w-7xl mx-auto mb-16 flex flex-wrap gap-3">
        <button onClick={() => setFiltreActuel("Tout")} className={`px-6 py-2 rounded-full text-[10px] font-bold border transition-all ${filtreActuel === "Tout" ? "bg-white text-black" : "bg-zinc-900 text-gray-500 border-zinc-800"}`}>TOUT</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setFiltreActuel(cat.name)} className={`px-6 py-2 rounded-full text-[10px] font-bold border transition-all ${filtreActuel === cat.name ? "bg-green-600 text-white border-green-600" : "bg-zinc-900 text-gray-500 border-zinc-800"}`}>{cat.name.toUpperCase()}</button>
        ))}
      </div>

      {/* BOUTON AJOUT PROJET (ADMIN) */}
      {user && (
        <div className="max-w-7xl mx-auto mb-20 text-center">
            <button onClick={() => {setEditingId(null); setIsFormOpen(true);}} className="px-10 py-5 border-2 border-dashed border-zinc-800 hover:border-green-500 rounded-3xl text-zinc-500 hover:text-green-500 transition-all font-bold uppercase tracking-widest flex items-center gap-4 mx-auto">
                <PlusCircle size={24}/> Ajouter une vidéo
            </button>
        </div>
      )}

      {/* SHORTS */}
      {shorts.length > 0 && (
        <section className="max-w-7xl mx-auto mb-24">
            <h2 className="text-xl font-black italic uppercase text-red-600 mb-8 border-l-4 border-red-600 pl-4 tracking-tighter">YouTube Shorts</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {shorts.map(p => (
                    <ProjectCard key={p.id} projet={p} user={user} formaterDateFr={formaterDateFr} onEdit={(p:any) => {setFormData(p); setEditingId(p.id); setSelectedCats(p.category.split(', ')); setIsFormOpen(true);}} onDelete={async (id:string) => {if(confirm("Supprimer?")){await supabase.from('portfolio_items').delete().eq('id', id); fetchProjects();}}} />
                ))}
            </div>
        </section>
      )}

      {/* VIDÉOS CLASSIQUES */}
      {videosClassiques.length > 0 && (
        <section className="max-w-7xl mx-auto">
            <h2 className="text-xl font-black italic uppercase text-green-500 mb-8 border-l-4 border-green-500 pl-4 tracking-tighter">Productions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videosClassiques.map(p => (
                    <ProjectCard key={p.id} projet={p} user={user} formaterDateFr={formaterDateFr} onEdit={(p:any) => {setFormData(p); setEditingId(p.id); setSelectedCats(p.category.split(', ')); setIsFormOpen(true);}} onDelete={async (id:string) => {if(confirm("Supprimer?")){await supabase.from('portfolio_items').delete().eq('id', id); fetchProjects();}}} />
                ))}
            </div>
        </section>
      )}

      {/* MODAL FORMULAIRE PROJET */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 backdrop-blur-md">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-green-500">{editingId ? 'Modifier la vidéo' : 'Ajouter une vidéo'}</h3>
                    <button onClick={() => setIsFormOpen(false)} className="text-zinc-500 hover:text-white"><XCircle size={32}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Titre" required className="bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-green-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        <input type="url" placeholder="Lien YouTube (ou Shorts)" required className="bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-green-500" value={formData.youtube_url} onChange={e => setFormData({...formData, youtube_url: e.target.value})} />
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-bold text-zinc-500 uppercase">Choisir les catégories :</p>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button key={cat.id} type="button" onClick={() => toggleCatSelection(cat.name)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${selectedCats.includes(cat.name) ? 'bg-green-600 border-green-600 text-white' : 'bg-black border-zinc-800 text-zinc-500'}`}>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-zinc-600 italic">Astuce : Si vous écrivez "drone" dans la description, la catégorie Drone sera ajoutée seule.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Client (optionnel)" className="bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-green-500" value={formData.client_name || ""} onChange={e => setFormData({...formData, client_name: e.target.value})} />
                        <input type="date" className="bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-green-500" value={formData.project_date || ""} onChange={e => setFormData({...formData, project_date: e.target.value})} />
                    </div>

                    <textarea placeholder="Description (mentionnez 'drone' ici pour le tag auto...)" rows={4} className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-green-500" value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} />

                    <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] transition-all">
                        {editingId ? 'Mettre à jour' : 'Publier le contenu'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </main>
  );
}