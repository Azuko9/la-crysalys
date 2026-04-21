"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Paintbrush, Phone, Mail, MapPin, RotateCcw, Lock } from "lucide-react";

// 1. MAPPING IMPORTANT
const CSS_MAPPING: Record<string, string> = {
  primary_color: "--primary-color",
  bg_color: "--bg-color", 
  card_bg: "--card-bg",
  border_radius: "--radius",
  text_color: "--text-color",
};


export default function Footer() {
  const [profiles, setProfiles] = useState<{ id: string, label: string, config: Record<string, string> }[]>([]);

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

  useEffect(() => {
    fetchProfiles();
    
    const localTheme = localStorage.getItem("user_theme_preference");
    if (localTheme) {
      try {
        const config = JSON.parse(localTheme);
        setTimeout(() => applyVisualTheme(config), 100);
      } catch (e) { console.error(e); }
    }

    // Écoute de l'événement local pour une mise à jour instantanée des boutons de preset
    window.addEventListener("theme-presets-updated", fetchProfiles);

    const channel = supabase
      .channel('footer-theme-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, 
      (payload) => {
        if (payload.new && 'key' in payload.new && (payload.new as { key: string }).key.startsWith('profile_')) {
          fetchProfiles();
        }
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
      window.removeEventListener("theme-presets-updated", fetchProfiles);
    };
  }, [fetchProfiles]);

  const applyVisualTheme = (config: Record<string, string>) => {
    const root = document.documentElement;
    Object.entries(config).forEach(([key, value]) => {
      const cssVarName = CSS_MAPPING[key];
      if (cssVarName) {
        root.style.setProperty(cssVarName, value as string);
      }
    });
  };

  const handleThemeClick = (config: Record<string, string>) => {
    applyVisualTheme(config);
    localStorage.setItem("user_theme_preference", JSON.stringify(config));
  };

  const handleResetTheme = () => {
    localStorage.removeItem("user_theme_preference");
    window.location.reload();
  };

  return (
    <>
      <footer className="w-full bg-zinc-900/50 backdrop-blur-md border-t border-zinc-800 pt-12 pb-8 mt-20 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* GAUCHE : IDENTITÉ + CONTACT */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="text-center md:text-left">
              <span className="text-xl font-black italic uppercase tracking-tighter text-foreground">
                Crysalys<span className="text-primary">.</span>
              </span>
              <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest mt-1">
                Production Audiovisuelle
              </p>
            </div>
            <div className="hidden md:block w-[1px] h-8 bg-primary"></div>
            <div className="flex gap-3">
              <a href="tel:+33600000000" aria-label="Nous appeler par téléphone" className="w-9 h-9 rounded-dynamic bg-card border border-zinc-800 flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary transition-all group">
                <Phone size={14} className="group-hover:scale-110 transition-transform"/>
              </a>
              <a href="mailto:contact@crysalys.fr" aria-label="Nous envoyer un email" className="w-9 h-9 rounded-dynamic bg-card border border-zinc-800 flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary transition-all group">
                <Mail size={14} className="group-hover:scale-110 transition-transform"/>
              </a>

            </div>
          </div>

          {/* DROITE : SÉLECTEUR DE THÈMES */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-foreground/50 flex items-center gap-2">
              <Paintbrush size={12} /> Choix du thème
            </span>
            
            <div className="flex items-center gap-2">
              <button
                  onClick={handleResetTheme}
                  className="w-9 h-9 rounded-dynamic bg-card border border-zinc-800 flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary transition-all group"
                  title="Retour au thème original"
                  aria-label="Retour au thème original"
              >
                  <RotateCcw size={12} className="text-foreground group-hover:text-primary transition-colors"/>
              </button>

              <div className="flex gap-3 p-1.5 bg-black/20 rounded-dynamic border border-primary backdrop-blur-sm">
                {profiles.length > 0 ? (
                  profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleThemeClick(p.config)}
                      className="group relative w-8 h-8 rounded-dynamic border border-white/10 hover:border-white hover:scale-110 transition-all shadow-lg overflow-hidden"
                      title={p.label}
                      aria-label={`Appliquer le ${p.label}`}
                      style={{ backgroundColor: p.config.bg_color || '#000000' }}
                    >
                      <div 
                        className="absolute inset-1.5 rounded-[2px] shadow-sm group-hover:inset-1 transition-all"
                        style={{ backgroundColor: p.config.card_bg || '#222222' }}
                      />
                      <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full shadow-sm group-hover:w-3.5 group-hover:h-3.5 transition-all ring-1 ring-black/10" 
                        style={{ backgroundColor: p.config.primary_color || '#ffffff' }} 
                      />
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-foreground/30 italic px-2">...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION LÉGALE + BOUTON SECRET */}
        <div className="max-w-7xl mx-auto px-8 mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-foreground/40 font-medium uppercase tracking-widest">
             © {new Date().getFullYear()} La Crysalys. Tous droits réservés.
          </p>
          
          <nav className="flex items-center gap-6">
            <Link href="/mentions-legales" className="text-xs text-foreground/50 font-bold uppercase tracking-widest hover:text-primary transition-colors">
                Mentions Légales
            </Link>
            <span className="text-foreground/20">•</span>
            <Link href="/contact" className="text-xs text-foreground/50 font-bold uppercase tracking-widest hover:text-primary transition-colors">
                Contact
            </Link>
            <Link href="/login" className="opacity-20 hover:opacity-100 transition-opacity text-foreground/50"
                title="Accès Restreint"
            >
                <Lock size={12} />
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}