"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Paintbrush, Check } from "lucide-react";

export default function Footer() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [activeTheme, setActiveTheme] = useState("");

  // 1. Charger les profils disponibles
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .filter("key", "in", '("profile_1","profile_2","profile_3")');
      
      if (data) {
        const formatted = data.map(p => ({
          id: p.key,
          label: p.key.replace("profile_", "Thème "),
          config: JSON.parse(p.value)
        })).sort((a, b) => a.id.localeCompare(b.id));
        setProfiles(formatted);
      }
    };
    fetchProfiles();
  }, []);

  // 2. Appliquer un profil comme thème principal du site
  const applyTheme = async (config: any, profileId: string) => {
    const updates = Object.entries(config).map(([key, value]) => ({ key, value }));
    
    const { error } = await supabase
      .from("site_settings")
      .upsert(updates, { onConflict: 'key' });
    
    if (!error) {
      window.location.reload(); // Recharge pour appliquer le CSS du layout
    }
  };

  return (
    <footer className="w-full bg-zinc-900/50 backdrop-blur-md border-t border-zinc-800 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* INFOS SOCIÉTÉ */}
        <div className="flex flex-col gap-2">
          <span className="text-xl font-black italic uppercase tracking-tighter text-white">
            Crysalys<span className="text-primary">.</span>
          </span>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            © 2024 Production Audiovisuelle & Drone
          </p>
        </div>

        {/* SÉLECTEUR DE THÈMES */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
            <Paintbrush size={12} /> Changer l'ambiance
          </span>
          
          <div className="flex gap-3">
            {profiles.length > 0 ? (
              profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyTheme(p.config, p.id)}
                  className="group relative flex items-center gap-3 px-4 py-2 bg-black/40 border border-zinc-800 rounded-dynamic hover:border-primary transition-all"
                >
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.config.primary_color }} />
                    <div className="w-2 h-2 rounded-full opacity-50" style={{ backgroundColor: p.config.card_bg }} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-zinc-400 group-hover:text-white">
                    {p.label}
                  </span>
                </button>
              ))
            ) : (
              <span className="text-[9px] text-zinc-700 italic">Aucun profil enregistré dans l'admin</span>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}