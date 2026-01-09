"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Palette, Save, Box, Droplets, RotateCcw } from "lucide-react"; // Ajout de RotateCcw

export default function ThemeManager() {
  const [settings, setSettings] = useState({
    bg_color: "#090909ff",
    primary_color: "#22c55e", // Vert classique par défaut
    border_radius: "0px",
    card_bg: "#29292cff",
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

  // --- NOUVELLE FONCTION DE RÉINITIALISATION ---
  const handleReset = async () => {
    if (!confirm("Voulez-vous restaurer les paramètres par défaut (Noir & Vert) ?")) return;

    const defaultSettings = {
      bg_color: "#212121ff",
      primary_color: "#5c5c5cff", // Retour au vert d'origine
      border_radius: "5px",
      card_bg: "#323232ff",
    };

    const updates = Object.entries(defaultSettings).map(([key, value]) => ({ key, value }));
    
    const { error } = await supabase
      .from("site_settings")
      .upsert(updates, { onConflict: 'key' });
    
    if (!error) {
      setSettings(defaultSettings);
      alert("Paramètres par défaut restaurés !");
      window.location.reload(); 
    }
  };

  const handleSave = async () => {
    const updates = Object.entries(settings).map(([key, value]) => ({ key, value }));
    const { error } = await supabase
      .from("site_settings")
      .upsert(updates, { onConflict: 'key' });
    
    if (!error) {
      alert("Design Système mis à jour !");
      window.location.reload(); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-zinc-900 border border-zinc-800 rounded-dynamic shadow-2xl">
      
      {/* HEADER AVEC BOUTON RESET */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <Palette className="text-primary" size={24} />
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Personnalisation du Thème</h2>
        </div>
        
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-red-500 transition-colors"
        >
          <RotateCcw size={14} /> Réinitialiser par défaut
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        
        {/* SECTION COULEURS */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
            <Droplets size={14}/> Palette de Couleurs
          </h3>
          
          <div className="flex justify-between items-center group">
            <label className="text-xs font-bold text-zinc-500 uppercase group-hover:text-white transition-colors">Fond du site</label>
            <input type="color" value={settings.bg_color} 
              onChange={(e) => setSettings({...settings, bg_color: e.target.value})}
              className="w-10 h-10 bg-transparent cursor-pointer border border-zinc-800" />
          </div>

          <div className="flex justify-between items-center group">
            <label className="text-xs font-bold text-zinc-500 uppercase group-hover:text-white transition-colors">Fond des cartes</label>
            <input type="color" value={settings.card_bg} 
              onChange={(e) => setSettings({...settings, card_bg: e.target.value})}
              className="w-10 h-10 bg-transparent cursor-pointer border border-zinc-800" />
          </div>

          <div className="flex justify-between items-center group">
            <label className="text-xs font-bold text-zinc-500 uppercase group-hover:text-white transition-colors">Couleur Accent</label>
            <input type="color" value={settings.primary_color} 
              onChange={(e) => setSettings({...settings, primary_color: e.target.value})}
              className="w-10 h-10 bg-transparent cursor-pointer border border-zinc-800" />
          </div>
        </div>

        {/* SECTION STRUCTURE */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
            <Box size={14}/> Géométrie
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-zinc-500 font-bold uppercase">
              <span>Arrondis (Radius)</span>
              <span className="text-white">{settings.border_radius}</span>
            </div>
            <input type="range" min="0" max="50" step="2"
              value={parseInt(settings.border_radius)}
              onChange={(e) => setSettings({...settings, border_radius: `${e.target.value}px`})}
              className="w-full accent-primary bg-zinc-800 h-1 cursor-pointer appearance-none" />
          </div>

          <div className="p-4 bg-black/20 border border-zinc-800 rounded-lg">
             <p className="text-[9px] text-zinc-500 uppercase leading-relaxed font-bold tracking-tight">
               Note : Les arrondis s'appliquent à tous les éléments possédant la classe <code className="text-primary italic">rounded-dynamic</code>.
             </p>
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="w-full bg-primary text-black font-black py-5 rounded-dynamic uppercase text-[10px] tracking-[0.4em] hover:bg-white transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
        <Save size={16}/> Enregistrer les modifications
      </button>
    </div>
  );
}