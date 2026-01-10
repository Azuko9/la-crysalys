"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Paintbrush, Phone, Mail, MapPin } from "lucide-react";

// 1. TABLE DE CORRESPONDANCE (Important pour l'effet immédiat)
// Associe le nom de ta clé en Base de Données -> au nom de la variable CSS
const CSS_MAPPING: Record<string, string> = {
  primary_color: "--primary",
  background_color: "--background", // Ajuste selon tes clés réelles
  card_bg: "--card",
  text_color: "--foreground",
  // Ajoute ici d'autres correspondances si nécessaire
};

export default function Footer() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Vérifier si l'utilisateur est admin au chargement
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(!!user); // true si connecté, false sinon
    };
    checkUser();
  }, []);

  const fetchProfiles = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchProfiles();
    
    // Si l'utilisateur a déjà choisi un thème localement, on l'applique
    const localTheme = localStorage.getItem("user_theme_preference");
    if (localTheme) {
      try {
        const config = JSON.parse(localTheme);
        applyVisualTheme(config);
      } catch (e) {
        console.error("Erreur lecture thème local");
      }
    }

    // Écouteur temps réel (Seulement utile pour voir les modifs des autres admins)
    const channel = supabase
      .channel('footer-theme-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, 
      (payload) => {
        if (payload.new && 'key' in payload.new && (payload.new as any).key.startsWith('profile_')) {
          fetchProfiles();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchProfiles]);


  // --- FONCTION QUI APPLIQUE VISUELLEMENT (Sans toucher à la BDD) ---
  const applyVisualTheme = (config: any) => {
    const root = document.documentElement;
    
    Object.entries(config).forEach(([key, value]) => {
      // 1. On cherche le nom de variable CSS correspondant
      const cssVarName = CSS_MAPPING[key] || `--${key.replace('_', '-')}`;
      
      // 2. On applique la couleur au DOM
      // Note: Si c'est du HSL, assure-toi que la value est bonne. 
      // Si tu stockes du HEX (#fff), ça marche direct pour des variables classiques.
      root.style.setProperty(cssVarName, value as string);
    });
  };


  // --- FONCTION PRINCIPALE ---
  const handleThemeClick = async (config: any, profileId: string) => {
    // 1. Application immédiate (Feedback instantané)
    applyVisualTheme(config);
    
    // 2. Sauvegarde de la préférence locale (Pour le visiteur)
    localStorage.setItem("user_theme_preference", JSON.stringify(config));

    // 3. Si ADMIN : Sauvegarde Globale sur le serveur
    if (isAdmin) {
      // On demande confirmation pour éviter de changer le site par erreur
      if(confirm("Vous êtes Admin : voulez-vous appliquer ce thème à TOUT LE SITE (Global) ?\nAnnuler appliquera le thème juste pour vous.")) {
        const updates = Object.entries(config).map(([key, value]) => ({ key, value }));
        await supabase.from("site_settings").upsert(updates, { onConflict: 'key' });
        // Pas besoin de reload, l'application visuelle est déjà faite en étape 1
      }
    }
  };

  return (
    <footer className="w-full bg-zinc-900/50 backdrop-blur-md border-t border-zinc-800 py-12 mt-20 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* IDENTITÉ + CONTACT */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="text-center md:text-left">
            <span className="text-xl font-black italic uppercase tracking-tighter text-white">
              Crysalys<span className="text-primary">.</span>
            </span>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
              © 2024 Production Audiovisuelle & Drone
            </p>
          </div>
          <div className="hidden md:block w-[1px] h-8 bg-zinc-800"></div>
          <div className="flex gap-3">
            <a href="tel:+33600000000" className="w-9 h-9 rounded-dynamic bg-black/40 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary transition-all group">
              <Phone size={14} className="group-hover:scale-110 transition-transform"/>
            </a>
            <a href="mailto:contact@crysalys.fr" className="w-9 h-9 rounded-dynamic bg-black/40 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary transition-all group">
              <Mail size={14} className="group-hover:scale-110 transition-transform"/>
            </a>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-dynamic bg-black/40 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary transition-all group">
              <MapPin size={14} className="group-hover:scale-110 transition-transform"/>
            </a>
          </div>
        </div>

        {/* SÉLECTEUR DE THÈMES */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
            <Paintbrush size={12} /> Ambiance {isAdmin && "(Admin Mode)"}
          </span>
          
          <div className="flex gap-3">
            {profiles.length > 0 ? (
              profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleThemeClick(p.config, p.id)}
                  className="group relative flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-zinc-800 rounded-dynamic hover:border-primary transition-all active:scale-95"
                >
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full transition-colors duration-300" style={{ backgroundColor: p.config.primary_color }} />
                    <div className="w-1.5 h-1.5 rounded-full opacity-50 transition-colors duration-300" style={{ backgroundColor: p.config.card_bg }} />
                  </div>
                  <span className="text-[9px] font-black uppercase text-zinc-400 group-hover:text-white transition-colors">
                    {p.label.replace("Thème ", "T")}
                  </span>
                </button>
              ))
            ) : (
              <span className="text-[9px] text-zinc-700 italic">...</span>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}