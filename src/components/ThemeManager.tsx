"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Palette, Save, Box, Droplets } from "lucide-react";

export default function ThemeManager() {
  const [settings, setSettings] = useState({
    bg_color: "#000000",
    primary_color: "#22491fff",
    border_radius: "0px",
    border_opacity: "0.2",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      if (data) {
        const newSettings = { ...settings };
        data.forEach(s => {
          if (s.key in newSettings) {
             // @ts-ignore
             newSettings[s.key] = s.value;
          }
        });
        setSettings(newSettings);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    // Transformation pour le format d'insertion Supabase
    const updates = Object.entries(settings).map(([key, value]) => ({ key, value }));
    
    const { error } = await supabase
      .from("site_settings")
      .upsert(updates, { onConflict: 'key' });
    
    if (!error) {
      alert("Design Système mis à jour ! Rechargez la page pour voir les changements.");
      window.location.reload(); // Force le rafraîchissement pour l'injection CSS
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-zinc-900 border border-zinc-800 rounded-dynamic">
      <div className="flex items-center gap-3 mb-10 border-b border-zinc-800 pb-6">
        <Palette className="text-primary" size={24} />
        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Personnalisation du Thème</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        {/* COULEURS */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
            <Droplets size={14}/> Couleurs
          </h3>
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-zinc-500 uppercase">Fond (Background)</label>
            <input type="color" value={settings.bg_color} 
              onChange={(e) => setSettings({...settings, bg_color: e.target.value})}
              className="w-10 h-10 bg-transparent cursor-pointer border border-zinc-800" />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-zinc-500 uppercase">Accent (Primary)</label>
            <input type="color" value={settings.primary_color} 
              onChange={(e) => setSettings({...settings, primary_color: e.target.value})}
              className="w-10 h-10 bg-transparent cursor-pointer border border-zinc-800" />
          </div>
        </div>

        {/* STRUCTURE */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
            <Box size={14}/> Structure
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-zinc-500 font-bold uppercase">
              <span>Arrondis : {settings.border_radius}</span>
            </div>
            <input type="range" min="0" max="50" step="2"
              value={parseInt(settings.border_radius)}
              onChange={(e) => setSettings({...settings, border_radius: `${e.target.value}px`})}
              className="w-full accent-primary bg-zinc-800 h-1 cursor-pointer appearance-none" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-zinc-500 font-bold uppercase">
              <span>Opacité Bordures : {Math.round(parseFloat(settings.border_opacity) * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.05"
              value={settings.border_opacity}
              onChange={(e) => setSettings({...settings, border_opacity: e.target.value})}
              className="w-full accent-primary bg-zinc-800 h-1 cursor-pointer appearance-none" />
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="w-full bg-primary text-black font-black py-5 rounded-dynamic uppercase text-[10px] tracking-[0.4em] hover:bg-white transition-all">
        Appliquer les modifications
      </button>
    </div>
  );
}