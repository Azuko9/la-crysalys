"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Palette, Save, Box, Droplets, RotateCcw, Bookmark, Download } from "lucide-react";

export default function ThemeManager() {
  const [settings, setSettings] = useState({
    bg_color: "#090909ff",
    primary_color: "#22c55e",
    border_radius: "0px",
    card_bg: "#29292cff",
  });

  // État pour stocker les aperçus des 3 profils
  const [profilesPreview, setProfilesPreview] = useState<any>({
    profile_1: null,
    profile_2: null,
    profile_3: null,
  });

  // 1. Sauvegarde principale (Appliquer au site)
  const saveToDatabase = async (data: typeof settings) => {
    const updates = Object.entries(data).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("site_settings").upsert(updates, { onConflict: 'key' });
    if (!error) {
      alert("Design Système appliqué au site !");
      window.location.reload();
    }
  };

  // 2. Sauvegarder dans un profil + mettre à jour l'aperçu local
  const handleSaveProfile = async (slot: number) => {
    const profileKey = `profile_${slot}`;
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: profileKey, value: JSON.stringify(settings) }, { onConflict: 'key' });
    
    if (!error) {
      setProfilesPreview((prev: any) => ({ ...prev, [profileKey]: settings }));
      alert(`Configuration sauvée dans le Profil ${slot}`);
    }
  };

  // 3. Charger un profil
  const handleLoadProfile = (slot: number) => {
    const data = profilesPreview[`profile_${slot}`];
    if (data) {
      setSettings(data);
    } else {
      alert("Ce profil est vide.");
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      if (data) {
        const loadedSettings = { ...settings };
        const loadedProfiles: any = {};
        
        data.forEach(s => {
          if (s.key in loadedSettings) {
            loadedSettings[s.key as keyof typeof settings] = s.value;
          }
          if (s.key.startsWith('profile_')) {
            loadedProfiles[s.key] = JSON.parse(s.value);
          }
        });
        setSettings(loadedSettings);
        setProfilesPreview(loadedProfiles);
      }
    };
    fetchSettings();
  }, []);

  const handleReset = () => {
    if (!confirm("Restaurer les paramètres par défaut ?")) return;
    saveToDatabase({
      bg_color: "#212121ff",
      primary_color: "#5c5c5cff",
      border_radius: "5px",
      card_bg: "#323232ff",
    });
  };

  const ColorField = ({ label, value, id }: { label: string, value: string, id: keyof typeof settings }) => (
    <div className="flex justify-between items-center group">
      <label className="text-xs font-bold text-zinc-500 uppercase group-hover:text-white transition-colors">{label}</label>
      <input type="color" value={value} 
        onChange={(e) => setSettings({...settings, [id]: e.target.value})}
        className="w-10 h-10 bg-transparent cursor-pointer border border-zinc-800" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-zinc-900 border border-zinc-800 rounded-dynamic shadow-2xl">
      {/* ... HEADER identique ... */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <Palette className="text-primary" size={24} />
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Personnalisation</h2>
        </div>
        <button onClick={handleReset} className="flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-500 hover:text-red-500 transition-colors">
          <RotateCcw size={14} /> Réinitialiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2"><Droplets size={14}/> Couleurs</h3>
          <ColorField label="Fond du site" value={settings.bg_color} id="bg_color" />
          <ColorField label="Fond des cartes" value={settings.card_bg} id="card_bg" />
          <ColorField label="Couleur Accent" value={settings.primary_color} id="primary_color" />
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2"><Box size={14}/> Géométrie</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-zinc-500 font-bold uppercase">
              <span>Arrondis</span>
              <span className="text-white">{settings.border_radius}</span>
            </div>
            <input type="range" min="0" max="50" step="2" value={parseInt(settings.border_radius)}
              onChange={(e) => setSettings({...settings, border_radius: `${e.target.value}px`})}
              className="w-full accent-primary bg-zinc-800 h-1 cursor-pointer appearance-none" />
          </div>
        </div>
      </div>

      <button onClick={() => saveToDatabase(settings)} className="w-full bg-primary text-black font-black py-5 rounded-dynamic uppercase text-[10px] tracking-[0.4em] hover:bg-white transition-all flex items-center justify-center gap-3 active:scale-[0.98] mb-12">
        <Save size={16}/> Appliquer au site
      </button>

      {/* SECTION PROFILS AVEC APERÇU VISUEL */}
      <div className="pt-8 border-t border-zinc-800">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
          <Bookmark size={14}/> Profils de sauvegarde (Mémoire)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((num) => {
            const p = profilesPreview[`profile_${num}`];
            return (
              <div key={num} className="flex flex-col gap-4 p-5 bg-black/40 border border-zinc-800 rounded-dynamic relative group overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">P0{num}</span>
                  {p && (
                    <span className="text-[9px] font-bold text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded italic">
                      Radius: {p.border_radius}
                    </span>
                  )}
                </div>

                {/* TEMOINS DE COULEUR */}
                <div className="flex gap-1.5 h-8">
                  {p ? (
                    <>
                      <div className="flex-1 rounded-sm border border-white/10" style={{ backgroundColor: p.bg_color }} title="Fond" />
                      <div className="flex-1 rounded-sm border border-white/10" style={{ backgroundColor: p.card_bg }} title="Cartes" />
                      <div className="flex-1 rounded-sm border border-white/10" style={{ backgroundColor: p.primary_color }} title="Accent" />
                    </>
                  ) : (
                    <div className="flex-1 border border-dashed border-zinc-800 rounded-sm flex items-center justify-center text-[8px] text-zinc-700 uppercase">Vide</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleLoadProfile(num)} className="flex-1 bg-zinc-800 hover:bg-white hover:text-black py-2 text-[9px] font-black uppercase rounded transition flex items-center justify-center gap-2 disabled:opacity-30" disabled={!p}>
                    <Download size={10}/> Charger
                  </button>
                  <button onClick={() => handleSaveProfile(num)} className="px-3 bg-zinc-800 hover:bg-primary hover:text-black py-2 text-[9px] font-black uppercase rounded transition">
                    <Save size={10}/>
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