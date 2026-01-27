"use client";

import React, { useState, useEffect, useCallback } from "react";
import { XCircle, UserCheck, Instagram, Linkedin, AlignLeft, Users, Handshake, UploadCloud, Loader2, Trash2, Save, Building2, Globe, Mail } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { saveTeamMemberAction } from "@/lib/actions";
import type { TeamMember } from "@/types";
import { uploadFileAndGetPath } from "@/lib/clientUploadHelpers"; // Import de la fonction d'upload

interface TeamModalProps {
  isOpen: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: 'team' | 'partner';
}

type TeamMemberFormDataType = Omit<TeamMember, 'id' | 'created_at'>;

const TeamModal: React.FC<TeamModalProps> = ({ isOpen, member, onClose, onSuccess, defaultType = 'team' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null); // Fichier sélectionné pour upload
  const [initialPhotoPath, setInitialPhotoPath] = useState<string | null>(null); // Chemin initial pour suppression
  const [isUploading, setIsUploading] = useState(false); // État d'upload
  
  const emptyFormData: TeamMemberFormDataType = {
    name: "",
    role: "",
    company: null,
    bio: null,
    photo_path: null, // Changé en photo_path
    instagram: null,
    linkedin: null,
    email: null,
    website: null,
    member_type: 'team' as 'team' | 'partner'
  };

  const [formData, setFormData] = useState<TeamMemberFormDataType>(emptyFormData);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setPhotoFile(null); // Réinitialise le fichier sélectionné
      setInitialPhotoPath(null); // Réinitialise le chemin initial
      if (member) {
        setFormData({
          name: member.name || "",
          role: member.role || "",
          company: member.company || null,
          bio: member.bio || null,
          photo_path: member.photo_path || null, // Utilise photo_path
          instagram: member.instagram || null,
          linkedin: member.linkedin || null,
          email: member.email || null,
          website: member.website || null,
          member_type: member.member_type || 'team'
        });
        setInitialPhotoPath(member.photo_path || null); // Stocke le chemin initial
      } else {
        setFormData({ ...emptyFormData, member_type: defaultType });
      }
    }
  }, [member, isOpen, defaultType]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  }, []);

  const handleRemoveImage = () => {
    if (formData.photo_path) {
      // No need to set initialPhotoPath here, the logic in handleSubmit handles it
    }
    setFormData({ ...formData, photo_path: null });
    setPhotoFile(null); // Efface le fichier sélectionné
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsUploading(false); // S'assurer que l'état d'upload est faux avant de commencer la sauvegarde

    let finalPhotoPath = formData.photo_path;
    let imageToDeleteFromStorage: { bucket: string; path: string } | null = null;

    // 1. Upload de la nouvelle image si un fichier est sélectionné
    if (photoFile) {
      setIsUploading(true);
      const path = await uploadFileAndGetPath(photoFile, 'team_images', 'team_members/'); // Assurez-vous que 'team_images' est le bon bucket
      setIsUploading(false);
      if (!path) {
        setError("Échec de l'upload de la photo.");
        setLoading(false);
        return;
      }
      finalPhotoPath = path;
      // Si une ancienne photo existait et qu'une nouvelle a été uploadée, l'ancienne est à supprimer
      if (initialPhotoPath && initialPhotoPath !== finalPhotoPath) {
        imageToDeleteFromStorage = { bucket: 'team_images', path: initialPhotoPath };
      }
    } else if (initialPhotoPath && !formData.photo_path) {
      // Si l'utilisateur a supprimé une photo existante sans en uploader une nouvelle
      imageToDeleteFromStorage = { bucket: 'team_images', path: initialPhotoPath };
    }

    // 2. Préparer le payload avec le chemin final de la photo
    const payload = { ...formData, photo_path: finalPhotoPath }; // Utilise le chemin final

    // 3. Appeler la Server Action
    const result = await saveTeamMemberAction(payload, member ? member.id : null, imageToDeleteFromStorage);

    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setError(('error' in result && result.error) || "Une erreur est survenue lors de la sauvegarde.");
    }
  };

  if (!isOpen) return null;
  const isPartner = formData.member_type === 'partner';

  // Générer l'URL publique pour l'affichage de la photo actuelle
  const currentPhotoPublicUrl = formData.photo_path
    ? supabase.storage.from('team_images').getPublicUrl(formData.photo_path).data.publicUrl
    : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-background/95 p-4 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-card border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl my-8 text-white relative">
        
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-primary">
            {member ? 'Modifier' : 'Ajouter'} <span className="text-white">{isPartner ? 'Partenaire' : 'Talent'}</span>
          </h3>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors"><XCircle size={32}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SÉLECTEUR TYPE */}
          <div className="flex bg-zinc-900 p-1 rounded-dynamic border border-zinc-800">
            <button type="button" onClick={() => setFormData({...formData, member_type: 'team'})} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-dynamic flex items-center justify-center gap-2 transition-all ${!isPartner ? 'bg-primary text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}><Users size={14}/> Équipe</button>
            <button type="button" onClick={() => setFormData({...formData, member_type: 'partner'})} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-dynamic flex items-center justify-center gap-2 transition-all ${isPartner ? 'bg-primary text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}><Handshake size={14}/> Partenaire</button>
          </div>

          {/* LIGNE 1 : NOM & RÔLE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Nom Complet</label>
                <input type="text" name="name" required placeholder="ex: Jean Dupont" className="w-full bg-background border border-zinc-800 p-4 rounded-dynamic outline-none focus:border-primary font-bold text-lg" value={formData.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">{isPartner ? 'Service / Spécialité' : 'Rôle'}</label>
                <input type="text" name="role" required placeholder="ex: Location Caméra" className="w-full bg-background border border-zinc-800 p-4 rounded-dynamic outline-none focus:border-primary text-primary" value={formData.role} onChange={handleChange} />
            </div>
          </div>

          {/* NOUVEAU : NOM SOCIÉTÉ (Visible surtout pour les partenaires) */}
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 flex items-center gap-2"><Building2 size={14}/> Nom de la Société (Optionnel)</label>
             <input type="text" name="company" placeholder="ex: Studio Alpha" className="w-full bg-background border border-zinc-800 p-4 rounded-dynamic outline-none focus:border-primary text-white" value={formData.company || ""} onChange={handleChange} />
          </div>

          {/* UPLOAD IMAGE */}
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Photo Portrait (Format Image)</label>
             {currentPhotoPublicUrl ? (
                <div className="relative w-full h-64 rounded-dynamic overflow-hidden border border-zinc-700 group">
                   <img src={currentPhotoPublicUrl} alt="Preview" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={handleRemoveImage} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Trash2 size={16}/> Changer</button>
                   </div>
                </div>
             ) : (
                <div className="relative w-full h-40 border-2 border-dashed border-zinc-700 hover:border-primary rounded-dynamic transition-colors bg-zinc-900/30">
                   <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 pointer-events-none">
                      {isUploading ? <Loader2 size={32} className="animate-spin text-primary mb-2"/> : <UploadCloud size={32} className="mb-2 group-hover:text-primary transition-colors"/>}
                      <span className="text-xs font-bold uppercase tracking-widest">{isUploading ? 'Envoi...' : 'Glisser une image ici'}</span>
                   </div>
                </div>
             )}
          </div>

          {/* BIO */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 flex items-center gap-2"><AlignLeft size={14}/> Biographie / Description</label>
            <textarea name="bio" rows={4} className="w-full bg-background border border-zinc-800 p-5 rounded-dynamic outline-none focus:border-white text-zinc-300 resize-none" value={formData.bio || ""} onChange={handleChange} />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500 p-3 rounded-lg text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          {/* CONTACTS & RÉSEAUX */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-zinc-600 uppercase ml-1 flex items-center gap-1"><Mail size={10}/> Email Pro</label>
                 <input type="email" name="email" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-xs focus:border-primary outline-none" value={formData.email || ""} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-zinc-600 uppercase ml-1 flex items-center gap-1"><Globe size={10}/> Site Web</label>
                 <input type="url" name="website" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-xs focus:border-primary outline-none" value={formData.website || ""} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-zinc-600 uppercase ml-1 flex items-center gap-1"><Instagram size={10}/> Instagram</label>
                 <input type="url" name="instagram" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-xs focus:border-primary outline-none" value={formData.instagram || ""} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-zinc-600 uppercase ml-1 flex items-center gap-1"><Linkedin size={10}/> LinkedIn</label>
                 <input type="url" name="linkedin" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-xs focus:border-primary outline-none" value={formData.linkedin || ""} onChange={handleChange} />
              </div>
          </div>

          <button type="submit" disabled={loading || isUploading} className="w-full bg-primary hover:bg-white hover:text-black text-black font-black py-6 rounded-dynamic uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.2)] active:scale-[0.98] mt-4 disabled:opacity-50">
            {loading || isUploading ? "Sauvegarde..." : <><Save size={24}/> {member ? 'Mettre à jour' : 'Enregistrer'}</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;