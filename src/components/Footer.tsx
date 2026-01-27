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
};


export default function Footer() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isSecretOpen, setIsSecretOpen] = useState(false);

  useEffect(() => {
    fetchProfiles();
    
    const localTheme = localStorage.getItem("user_theme_preference");
    if (localTheme) {
      try {
        const config = JSON.parse(localTheme);
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

  const applyVisualTheme = (config: any) => {
    const root = document.documentElement;
    Object.entries(config).forEach(([key, value]) => {
      const cssVarName = CSS_MAPPING[key];
      if (cssVarName) {
        root.style.setProperty(cssVarName, value as string);
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

  return (
    <>
      <footer className="w-full bg-zinc-900/50 backdrop-blur-md border-t border-zinc-800 pt-12 pb-8 mt-20 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* GAUCHE : IDENTITÉ + CONTACT */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="text-center md:text-left">
              <span className="text-xl font-black italic uppercase tracking-tighter text-white">
                Crysalys<span className="text-primary">.</span>
              </span>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                Production Audiovisuelle
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
              <button
                  onClick={handleResetTheme}
                  className="w-9 h-9 rounded-dynamic bg-card border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary transition-all group"
                  title="Retour au thème original"
              >
                  <RotateCcw size={12} className="text-white group-hover:text-primary transition-colors"/>
              </button>

              <div className="flex gap-3 p-1.5 bg-black/20 rounded-dynamic border border-primary backdrop-blur-sm">
                {profiles.length > 0 ? (
                  profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleThemeClick(p.config)}
                      className="group relative w-8 h-8 rounded-dynamic border border-white/10 hover:border-white hover:scale-110 transition-all shadow-lg overflow-hidden"
                      title={p.label}
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
                  <span className="text-[9px] text-zinc-700 italic px-2">...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION LÉGALE + BOUTON SECRET */}
        <div className="max-w-7xl mx-auto px-8 mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest">
             © {new Date().getFullYear()} La Crysalys. Tous droits réservés.
          </p>
          
          <nav className="flex items-center gap-6">
            <Link href="/mentions-legales" className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hover:text-primary transition-colors">
                Mentions Légales
            </Link>
            <span className="text-zinc-800">•</span>
            <Link href="/contact" className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hover:text-primary transition-colors">
                Contact
            </Link>
            <Link href="/login" className="opacity-20 hover:opacity-100 transition-opacity text-zinc-500"
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