"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Palette, Save, Box, Droplets, RotateCcw, Bookmark, Download, CheckCircle } from "lucide-react";

type ThemeSettings = {
  bg_color: string;
  primary_color: string;
  border_radius: string;
  card_bg: string;
};

export default function ThemeManager() {
  const [settings, setSettings] = useState<ThemeSettings>({
    bg_color: "#090909ff",
    primary_color: "#22c55e",
    border_radius: "0px",
    card_bg: "#29292cff",
  });

  const [profilesPreview, setProfilesPreview] = useState<Record<string, ThemeSettings | null>>({
    profile_1: null,
    profile_2: null,
    profile_3: null,
  });

  // 1. Sauvegarde GLOBALE (Le thème par défaut du site)
  const saveToDatabase = async (data: typeof settings) => {
    // On transforme l'objet en tableau de lignes pour la BDD : { key: 'bg_color', value: '#...' }
    const updates = Object.entries(data).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("site_settings").upsert(updates, { onConflict: 'key' });
    
    if (!error) {
      // On force un reload pour que l'admin voie le résultat "réel"
      if(confirm("Thème appliqué globalement au site ! Recharger pour voir le résultat ?")) {
        window.location.reload();
      }
    }
  };

  // 2. Sauvegarde dans un SLOT (Preset)
  const handleSaveProfile = async (slot: number) => {
    const profileKey = `profile_${slot}`;
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: profileKey, value: JSON.stringify(settings) }, { onConflict: 'key' });
    
    if (!error) {
      setProfilesPreview((prev) => ({ ...prev, [profileKey]: settings }));
    }
  };

  // 3. Charger un SLOT dans l'éditeur
  const handleLoadProfile = (slot: number) => {
    const data = profilesPreview[`profile_${slot}`];
    if (data) setSettings(data);
    else alert("Ce profil est vide.");
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      if (data) {
        const loadedSettings: ThemeSettings = { ...settings };
        const loadedProfiles: Record<string, ThemeSettings | null> = {};
        
        data.forEach(s => {
          // Si c'est une clé de style simple (ex: primary_color), on l'hydrate
          if (s.key in loadedSettings) {
            loadedSettings[s.key as keyof typeof settings] = s.value;
          }
          // Si c'est un profil JSON, on le parse
          if (s.key.startsWith('profile_')) {
            try {
              loadedProfiles[s.key] = JSON.parse(s.value);
            } catch (e) {
              console.error(`Failed to parse theme profile ${s.key}:`, e);
              loadedProfiles[s.key] = null; // Sécurisation en cas d'échec
            }
          }
        });
        setSettings(loadedSettings);
        setProfilesPreview(loadedProfiles);
      }
    };
    fetchSettings();
  }, []);

  const handleReset = () => {
    if (!confirm("Remettre les valeurs par défaut de l'éditeur ? (Ne modifie pas le site)")) return;
    setSettings({
      bg_color: "#090909ff",
      primary_color: "#22c55e",
      border_radius: "0px",
      card_bg: "#29292cff",
    });
  };

  const ColorField = ({ label, value, id }: { label: string, value: string, id: keyof ThemeSettings }) => (
    <div className="flex justify-between items-center group bg-black/20 p-2 rounded-dynamic border border-transparent hover:border-zinc-700 transition-all">
      <label className="text-[10px] font-bold text-zinc-400 uppercase group-hover:text-white transition-colors">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-mono text-zinc-600 uppercase">{value}</span>
        <input type="color" value={value} 
          onChange={(e) => setSettings({...settings, [id]: e.target.value})}
          className="w-8 h-8 bg-transparent cursor-pointer rounded overflow-hidden border-none" />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-zinc-900/80 border border-zinc-800 rounded-dynamic shadow-2xl backdrop-blur-sm">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <Palette className="text-primary" size={24} />
          <div>
             <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Theme_Lab</h2>
             <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Constructeur d'identité visuelle</p>
          </div>
        </div>
        <button onClick={handleReset} className="flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-600 hover:text-white transition-colors">
          <RotateCcw size={12} /> Reset Editor
        </button>
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2"><Droplets size={14}/> Colorimétrie</h3>
          <div className="space-y-2">
             <ColorField label="Background (Fond)" value={settings.bg_color} id="bg_color" />
             <ColorField label="Cards (Cartes)" value={settings.card_bg} id="card_bg" />
             <ColorField label="Primary (Accent)" value={settings.primary_color} id="primary_color" />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2"><Box size={14}/> Structure</h3>
          <div className="bg-black/20 p-4 rounded-dynamic border border-transparent hover:border-zinc-700 transition-all">
            <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase mb-4">
              <span>Border Radius</span>
              <span className="text-white bg-zinc-800 px-2 py-0.5 rounded">{settings.border_radius}</span>
            </div>
            <input type="range" min="0" max="30" step="1" value={parseInt(settings.border_radius)}
              onChange={(e) => setSettings({...settings, border_radius: `${e.target.value}px`})}
              className="w-full accent-primary bg-zinc-800 h-1 cursor-pointer appearance-none rounded-full" />
          </div>
        </div>
      </div>

      {/* ACTION PRINCIPALE */}
      <div className="bg-zinc-800/30 p-6 rounded-dynamic border border-zinc-800 mb-12 text-center">
         <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">Cette action modifie l'apparence par défaut pour tous les visiteurs</p>
         <button onClick={() => saveToDatabase(settings)} className="w-full bg-primary hover:bg-white text-black font-black py-4 rounded-dynamic uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            <CheckCircle size={18}/> Appliquer au Site (Global)
         </button>
      </div>

      {/* SECTION PROFILS / PRESETS */}
      <div className="pt-8 border-t border-zinc-800">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-2">
          <Bookmark size={14}/> Presets (Mémoire Footer)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((num) => {
            const p = profilesPreview[`profile_${num}`];
            return (
              <div key={num} className="flex flex-col gap-4 p-5 bg-black/40 border border-zinc-800 rounded-dynamic relative group overflow-hidden hover:border-zinc-600 transition-all">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-500 group-hover:text-white uppercase tracking-widest transition-colors">Preset 0{num}</span>
                </div>

                {/* APERÇU VISUEL */}
                <div className="flex h-12 rounded overflow-hidden border border-white/5">
                  {p ? (
                    <>
                      <div className="w-1/3" style={{ backgroundColor: p.bg_color }} title="Fond" />
                      <div className="w-1/3" style={{ backgroundColor: p.card_bg }} title="Cartes" />
                      <div className="w-1/3" style={{ backgroundColor: p.primary_color }} title="Accent" />
                    </>
                  ) : (
                    <div className="w-full bg-zinc-900 flex items-center justify-center text-[8px] text-zinc-700 uppercase italic">Vide</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button onClick={() => handleLoadProfile(num)} className="bg-zinc-800 hover:bg-white hover:text-black py-2 text-[8px] font-black uppercase rounded transition flex items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed" disabled={!p}>
                    <Download size={10}/> Charger
                  </button>
                  <button onClick={() => handleSaveProfile(num)} className="bg-zinc-800 hover:bg-primary hover:text-black py-2 text-[8px] font-black uppercase rounded transition flex items-center justify-center gap-1" title="Écraser ce preset avec les réglages actuels">
                    <Save size={10}/> Sauver
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}