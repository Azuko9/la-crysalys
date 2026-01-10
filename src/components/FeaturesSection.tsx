"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  // Icônes générales / Admin
  PlusCircle, Pencil, Trash2, X, Save,
  // Icônes Expertise (Drone)
  ShieldCheck, Map, Camera, FastForward, Zap, Heart, Star, CheckCircle, 
  // Icônes Post-Prod (Nouveaux ajouts)
  Scissors, Volume2, Layers, Palette, Monitor, Cpu
} from "lucide-react";

// 1. MAPPING COMPLET DES ICÔNES
const ICON_MAP: any = {
  // Expertise
  ShieldCheck: <ShieldCheck size={28}/>,
  Map: <Map size={28}/>,
  Camera: <Camera size={28}/>,
  FastForward: <FastForward size={28}/>,
  
  // Post-Prod
  Scissors: <Scissors size={28}/>,
  Volume2: <Volume2 size={28}/>,
  Layers: <Layers size={28}/>,
  Palette: <Palette size={28}/>,
  
  // Extras / Autres
  Zap: <Zap size={28}/>,
  Heart: <Heart size={28}/>,
  Star: <Star size={28}/>,
  CheckCircle: <CheckCircle size={28}/>,
  Monitor: <Monitor size={28}/>,
  Cpu: <Cpu size={28}/>
};

interface FeaturesSectionProps {
  pageContext: string; // "expertise" ou "postprod"
}

export default function FeaturesSection({ pageContext }: FeaturesSectionProps) {
  const [features, setFeatures] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  // États de la Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featureToEdit, setFeatureToEdit] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      fetchFeatures();
    };
    init();
  }, [pageContext]);

  const fetchFeatures = async () => {
    const { data } = await supabase
      .from('expertise_features')
      .select('*')
      .eq('page_context', pageContext) // Filtre selon la page
      .order('created_at', { ascending: true });
    setFeatures(data || []);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 1. Affichage des cartes */}
      {features.map((f) => (
        <FeatureCard 
          key={f.id} 
          feature={f} 
          user={user}
          onEdit={() => { setFeatureToEdit(f); setIsModalOpen(true); }}
          refresh={fetchFeatures}
        />
      ))}

      {/* 2. Bouton Ajouter (Admin) */}
      {user && (
        <button 
          onClick={() => { setFeatureToEdit(null); setIsModalOpen(true); }}
          className="min-h-[200px] border-2 border-dashed border-zinc-800 hover:border-primary rounded-dynamic flex flex-col items-center justify-center gap-4 text-zinc-500 hover:text-primary transition-colors group"
        >
          <PlusCircle size={32} className="group-hover:scale-110 transition-transform"/>
          <span className="text-xs font-black uppercase tracking-widest">Ajouter Feature</span>
        </button>
      )}

      {/* 3. La Modal */}
      {isModalOpen && (
        <FeatureModal 
          isOpen={isModalOpen}
          feature={featureToEdit}
          pageContext={pageContext}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchFeatures(); }}
        />
      )}
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function FeatureCard({ feature, user, onEdit, refresh }: any) {
  const handleDelete = async () => {
    if(confirm("Supprimer cet avantage ?")) {
      const { error } = await supabase.from('expertise_features').delete().eq('id', feature.id);
      if(!error) refresh();
    }
  };

  return (
    <div className="p-8 bg-card border border-zinc-800 rounded-dynamic hover:border-primary/50 transition-colors group relative shadow-2xl">
      <div className="text-primary mb-6 group-hover:scale-110 transition-transform">
        {/* Si l'icône existe dans la map on l'affiche, sinon icône par défaut */}
        {ICON_MAP[feature.icon_name] || <ShieldCheck size={28}/>}
      </div>
      <h4 className="text-lg font-black italic uppercase mb-2">{feature.title}</h4>
      <p className="text-xs text-zinc-500 leading-relaxed uppercase font-bold tracking-tighter">{feature.description}</p>
      
      {user && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="bg-blue-600 p-1.5 rounded text-white"><Pencil size={12}/></button>
          <button onClick={handleDelete} className="bg-red-600 p-1.5 rounded text-white"><Trash2 size={12}/></button>
        </div>
      )}
    </div>
  );
}

function FeatureModal({ isOpen, feature, pageContext, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    title: feature?.title || "",
    description: feature?.description || "",
    icon_name: feature?.icon_name || "ShieldCheck"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, page_context: pageContext };

    if (feature?.id) {
      await supabase.from('expertise_features').update(payload).eq('id', feature.id);
    } else {
      await supabase.from('expertise_features').insert([payload]);
    }
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md p-6 rounded-dynamic shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black uppercase italic text-white">{feature ? "Modifier" : "Ajouter"} Feature</h2>
          <button onClick={onClose}><X size={24} className="text-zinc-500 hover:text-white"/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Titre</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-zinc-800 p-3 rounded text-sm text-white focus:border-primary outline-none mt-1"/>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-zinc-800 p-3 rounded text-sm text-white focus:border-primary outline-none mt-1 h-24"/>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Icône</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2">
              {Object.keys(ICON_MAP).map((iconKey) => (
                <button 
                  key={iconKey}
                  type="button"
                  onClick={() => setFormData({...formData, icon_name: iconKey})}
                  className={`p-3 rounded border transition-all ${formData.icon_name === iconKey ? "bg-primary text-black border-primary" : "bg-black border-zinc-800 text-zinc-500 hover:text-white"}`}
                  title={iconKey}
                >
                  {ICON_MAP[iconKey]}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full bg-white text-black font-black uppercase py-4 rounded hover:bg-primary transition-colors mt-4 flex justify-center gap-2">
            <Save size={18}/> Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}