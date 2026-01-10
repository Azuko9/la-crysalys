"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Paintbrush, Phone, Mail, MapPin, RotateCcw } from "lucide-react";

// 1. MAPPING IMPORTANT
// Clé (Base de données) : Nom de la variable CSS (globals.css)
const CSS_MAPPING: Record<string, string> = {
  primary_color: "--primary-color",
  bg_color: "--bg-color", 
  card_bg: "--card-bg",
  border_radius: "--radius",
};

export default function Footer() {
  const [profiles, setProfiles] = useState<any[]>([]);
  // Petite astuce pour forcer le rafraîchissement si besoin
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProfiles();
    
    // Charger le thème local au démarrage
    const localTheme = localStorage.getItem("user_theme_preference");
    if (localTheme) {
      try {
        const config = JSON.parse(localTheme);
        // Petit délai pour s'assurer que le DOM est prêt
        setTimeout(() => applyVisualTheme(config), 100);
      } catch (e) { console.error(e); }
    }

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
  }, []);

  const fetchProfiles = useCallback(async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .filter("key", "in", '("profile_1","profile_2","profile_3")');
    
    if (data) {
      const formatted = data.map(p => ({
        id: p.key,
        label: p.key.replace("profile_", "Preset "),
        config: JSON.parse(p.value)
      })).sort((a, b) => a.id.localeCompare(b.id));
      setProfiles(formatted);
    }
  }, []);

  // --- CŒUR DU SYSTÈME : APPLICATION CSS ---
  const applyVisualTheme = (config: any) => {
    const root = document.documentElement;
    
    Object.entries(config).forEach(([key, value]) => {
      // On récupère le nom de la variable CSS (--primary, etc.)
      const cssVarName = CSS_MAPPING[key];
      
      if (cssVarName) {
        // IMPORTANT : Si c'est une couleur HEX (#...), Tailwind avec Shadcn peut bloquer
        // si ton globals.css attend du HSL.
        // Cette ligne force la couleur brute.
        root.style.setProperty(cssVarName, value as string);
        
        // ASTUCE SUPPRÉMENTAIRE :
        // Parfois il faut aussi mettre à jour la variable "foreground" (texte) si nécessaire
        // Mais ici on se concentre sur les couleurs principales.
      }
    });
  };

  const handleThemeClick = (config: any) => {
    applyVisualTheme(config);
    localStorage.setItem("user_theme_preference", JSON.stringify(config));
  };

  const handleResetTheme = () => {
    localStorage.removeItem("user_theme_preference");
    window.location.reload();
  };

  // Si pas monté côté client, on évite le flash
  if (!mounted) return null;

  return (
    <footer className="w-full bg-zinc-900/50 backdrop-blur-md border-t border-zinc-800 py-12 mt-20 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* GAUCHE : IDENTITÉ + CONTACT */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="text-center md:text-left">
            <span className="text-xl font-black italic uppercase tracking-tighter text-white">
              Crysalys<span className="text-primary">.</span>
            </span>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
              © 2024 Production Audiovisuelle
            </p>
          </div>
          <div className="hidden md:block w-[1px] h-8 bg-primary"></div>
          <div className="flex gap-3">
            <a href="tel:+33600000000" className="w-9 h-9 rounded-dynamic bg-card border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary transition-all group">
              <Phone size={14} className="group-hover:scale-110 transition-transform"/>
            </a>
            <a href="mailto:contact@crysalys.fr" className="w-9 h-9 rounded-dynamic bg-card border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary transition-all group">
              <Mail size={14} className="group-hover:scale-110 transition-transform"/>
            </a>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-dynamic bg-card border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary transition-all group">
              <MapPin size={14} className="group-hover:scale-110 transition-transform"/>
            </a>
          </div>
        </div>

        {/* DROITE : SÉLECTEUR DE THÈMES */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
            <Paintbrush size={12} /> Choix du thème
          </span>
          
          <div className="flex items-center gap-2">
            {/* BOUTON RESET */}
            <button
                onClick={handleResetTheme}
                className="w-9 h-9 rounded-dynamic bg-card border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary transition-all group"
                title="Retour au thème original"
            >
                <RotateCcw size={12} className="text-white group-hover:text-primary transition-colors"/>
            </button>

            {/* LISTE DES PRESETS AVEC APERÇU RÉEL */}
<div className="flex gap-3 p-1.5 bg-black/20 rounded-dynamic border border-primary backdrop-blur-sm">
  {profiles.length > 0 ? (
    profiles.map((p) => (
      <button
        key={p.id}
        onClick={() => handleThemeClick(p.config)}
        className="group relative w-8 h-8 rounded-dynamic border border-white/10 hover:border-white hover:scale-110 transition-all shadow-lg overflow-hidden"
        title={p.label}
        // 1. COULEUR DE FOND DU SITE (L'arrière-plan du bouton)
        style={{ 
          backgroundColor: p.config.bg_color || '#000000' 
        }}
      >
        {/* 2. COULEUR DES CARTES (Un carré à l'intérieur) */}
        <div 
          className="absolute inset-1.5 rounded-[2px] shadow-sm group-hover:inset-1 transition-all"
          style={{ 
            backgroundColor: p.config.card_bg || '#222222' 
          }}
        />

        {/* 3. COULEUR PRIMAIRE (Le point d'accent au centre) */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full shadow-sm group-hover:w-3.5 group-hover:h-3.5 transition-all ring-1 ring-black/10" 
          style={{ 
            backgroundColor: p.config.primary_color || '#ffffff' 
          }} 
        />
      </button>
    ))
  ) : (
    <span className="text-[9px] text-zinc-700 italic px-2">...</span>
  )}
</div>
          </div>
        </div>

      </div>
    </footer>
  );
}