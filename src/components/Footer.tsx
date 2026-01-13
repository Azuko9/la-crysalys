"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Paintbrush, Phone, Mail, MapPin, RotateCcw, Lock, KeyRound, X, Loader2 } from "lucide-react";
// Import de l'action sécurisée
import { verifyAdminCode } from "@/app/actions"; 

// 1. MAPPING IMPORTANT
const CSS_MAPPING: Record<string, string> = {
  primary_color: "--primary-color",
  bg_color: "--bg-color", 
  card_bg: "--card-bg",
  border_radius: "--radius",
};

// --- SOUS-COMPOSANT : MODALE SÉCURISÉE ---
// Isolé pour éviter que la frappe dans l'input ne fasse re-rendre tout le footer
function SecretGateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [secretCode, setSecretCode] = useState("");
  const [errorShake, setErrorShake] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    const result = await verifyAdminCode(secretCode);
    setIsVerifying(false);

    if (result.success) {
      onClose();
      router.push("/login");
    } else {
      setErrorShake(true);
      setSecretCode("");
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className={`relative bg-zinc-950 border border-zinc-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col items-center gap-6 ${errorShake ? 'animate-shake' : ''}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-600 hover:text-white"><X size={20} /></button>
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary"><KeyRound size={24} /></div>
        <div className="text-center">
          <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-1">Accès Sécurisé</h3>
          <p className="text-zinc-500 text-xs">Entrez le code à 6 chiffres.</p>
        </div>
        <form onSubmit={handleCodeSubmit} className="w-full flex flex-col gap-4">
          <input autoFocus type="password" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} placeholder="••••••" disabled={isVerifying} className="w-full bg-black border border-zinc-800 text-center text-2xl tracking-[0.5em] text-white p-4 rounded-xl focus:border-primary outline-none transition-colors disabled:opacity-50" maxLength={6} />
          <button type="submit" disabled={isVerifying} className="w-full bg-white text-black font-bold uppercase text-xs tracking-widest py-3 rounded-lg hover:bg-primary hover:text-white transition-colors flex justify-center items-center gap-2">
            {isVerifying ? <Loader2 className="animate-spin" size={16} /> : "Valider l'accès"}
          </button>
        </form>
      </div>
    </div>
  );
}

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
                         <button 
                onClick={() => setIsSecretOpen(true)}
                className="opacity-10 hover:opacity-100 transition-opacity text-zinc-500 ml-4"
                title="Accès Restreint"
              >
                  <Lock size={12} />
              </button> 
              <Link href="/mentions-legales" className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hover:text-primary transition-colors">
                  Mentions Légales
              </Link>
              <span className="text-zinc-800">•</span>
              <Link href="/contact" className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hover:text-primary transition-colors">
                  Contact
              </Link>
              
              {/* BOUTON SECRET */}

          </nav>
        </div>
      </footer>

      {/* --- MODAL SECRET GATE (6 CHIFFRES) --- */}
      <SecretGateModal isOpen={isSecretOpen} onClose={() => setIsSecretOpen(false)} />

      {/* STYLE SHAKE */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          border-color: #ef4444 !important;
        }
      `}</style>
    </>
  );
}