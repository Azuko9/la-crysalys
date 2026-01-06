// src/components/ThemeManager.tsx
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Palette, Save } from "lucide-react";

export default function ThemeManager() {
  const [colors, setColors] = useState({
    bg_color: "#000000",
    primary_color: "#22c55e",
  });

  useEffect(() => {
    // Charger les couleurs actuelles depuis Supabase au montage
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        const newColors = { ...colors };
        data.forEach(s => {
          if (s.key in newColors) newColors[s.key as keyof typeof colors] = s.value;
        });
        setColors(newColors);
        applyColors(newColors); // Appliquer au chargement
      }
    };
    fetchSettings();
  }, []);

  const applyColors = (theme: typeof colors) => {
    document.documentElement.style.setProperty("--bg-color", theme.bg_color);
    document.documentElement.style.setProperty("--primary-color", theme.primary_color);
  };

  const handleSave = async () => {
    for (const [key, value] of Object.entries(colors)) {
      await supabase.from("site_settings").upsert({ key, value }, { onConflict: 'key' });
    }
    applyColors(colors);
    alert("Couleurs mises à jour !");
  };

  return (
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl mb-10">
      <h3 className="text-green-500 font-black uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2">
        <Palette size={16}/> Personnalisation du Thème
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-500 uppercase">Couleur de fond</label>
          <div className="flex gap-4 items-center">
            <input 
              type="color" 
              value={colors.bg_color} 
              onChange={(e) => setColors({...colors, bg_color: e.target.value})}
              className="w-12 h-12 bg-transparent cursor-pointer"
            />
            <span className="font-mono text-sm">{colors.bg_color}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-500 uppercase">Couleur Primaire (Accents)</label>
          <div className="flex gap-4 items-center">
            <input 
              type="color" 
              value={colors.primary_color} 
              onChange={(e) => setColors({...colors, primary_color: e.target.value})}
              className="w-12 h-12 bg-transparent cursor-pointer"
            />
            <span className="font-mono text-sm">{colors.primary_color}</span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-white text-black font-black py-4 rounded-xl uppercase text-[10px] tracking-widest hover:bg-green-500 transition-all flex items-center justify-center gap-2"
      >
        <Save size={16}/> Enregistrer les réglages
      </button>
    </div>
  );
}