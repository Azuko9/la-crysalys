"use client";

import React, { useState, useEffect } from "react";
import { 
  XCircle, UserCheck, Instagram, Linkedin, 
  AlignLeft, Users, Handshake, UploadCloud, Loader2, Trash2, 
  Building2, Globe, Mail 
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { saveTeamMemberAction } from "@/app/actions";
import type { TeamMember } from "@/types";

interface TeamModalProps {
  isOpen: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: 'team' | 'partner';
}

const TeamModal: React.FC<TeamModalProps> = ({ isOpen, member, onClose, onSuccess, defaultType = 'team' }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  
  const emptyFormData = {
    name: "",
    role: "",
    company: "", // NOUVEAU
    bio: "",
    photo_url: "",
    instagram: "",
    linkedin: "",
    email: "",   // NOUVEAU
    website: "", // NOUVEAU
    member_type: 'team' as 'team' | 'partner'
  };

  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setImageToDelete(null); // Réinitialise l'image à supprimer
      if (member) {
        setFormData({
          name: member.name || "",
          role: member.role || "",
          company: member.company || "",
          bio: member.bio || "",
          photo_url: member.photo_url || "",
          instagram: member.instagram || "",
          linkedin: member.linkedin || "",
          email: member.email || "",
          website: member.website || "",
          member_type: member.member_type || 'team'
        });
      } else {
        setFormData({ ...emptyFormData, member_type: defaultType });
      }
    }
  }, [member, isOpen, defaultType]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    setUploading(true);
    setError(null);

    // Marquer l'ancienne image pour suppression si elle existe
    if (formData.photo_url) {
      setImageToDelete(formData.photo_url);
    }

    const { error: uploadError } = await supabase.storage.from('team-photos').upload(filePath, file);
    if (uploadError) { 
      setError("Erreur upload: " + uploadError.message); 
      setUploading(false); 
      return; 
    }

    const { data: { publicUrl } } = supabase.storage.from('team-photos').getPublicUrl(filePath);
    setFormData({ ...formData, photo_url: publicUrl });
    setUploading(false);
  };

  const handleRemoveImage = () => {
    if (formData.photo_url) {
      setImageToDelete(prev => prev ? prev : formData.photo_url); // Marque pour suppression
    }
    setFormData({ ...formData, photo_url: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await saveTeamMemberAction(formData, member ? member.id : null, imageToDelete);

    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || "Une erreur est survenue lors de la sauvegarde.");
      if (imageToDelete) {
        setImageToDelete(null); // Annule la suppression si la sauvegarde échoue
      }
    }
  };

  if (!isOpen) return null;
  const isPartner = formData.member_type === 'partner';

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
                <input type="text" required placeholder="ex: Jean Dupont" className="w-full bg-background border border-zinc-800 p-4 rounded-dynamic outline-none focus:border-primary font-bold text-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">{isPartner ? 'Service / Spécialité' : 'Rôle'}</label>
                <input type="text" required placeholder="ex: Location Caméra" className="w-full bg-background border border-zinc-800 p-4 rounded-dynamic outline-none focus:border-primary text-primary" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
            </div>
          </div>

          {/* NOUVEAU : NOM SOCIÉTÉ (Visible surtout pour les partenaires) */}
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 flex items-center gap-2"><Building2 size={14}/> Nom de la Société (Optionnel)</label>
             <input type="text" placeholder="ex: Studio Alpha" className="w-full bg-background border border-zinc-800 p-4 rounded-dynamic outline-none focus:border-primary text-white" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
          </div>

          {/* UPLOAD IMAGE */}
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Photo Portrait (Format Image)</label>
             {formData.photo_url ? (
                <div className="relative w-full h-64 rounded-dynamic overflow-hidden border border-zinc-700 group">
                   <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={handleRemoveImage} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Trash2 size={16}/> Changer</button>
                   </div>
                </div>
             ) : (
                <div className="relative w-full h-40 border-2 border-dashed border-zinc-700 hover:border-primary rounded-dynamic transition-colors bg-zinc-900/30">
                   <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 pointer-events-none">
                      {uploading ? <Loader2 size={32} className="animate-spin text-primary mb-2"/> : <UploadCloud size={32} className="mb-2 group-hover:text-primary transition-colors"/>}
                      <span className="text-xs font-bold uppercase tracking-widest">{uploading ? 'Envoi...' : 'Glisser une image ici'}</span>
                   </div>
                </div>
             )}
          </div>

          {/* BIO */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 flex items-center gap-2"><AlignLeft size={14}/> Biographie / Description</label>
            <textarea rows={4} className="w-full bg-background border border-zinc-800 p-5 rounded-dynamic outline-none focus:border-white text-zinc-300 resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
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
                 <input type="email" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-xs focus:border-primary outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-zinc-600 uppercase ml-1 flex items-center gap-1"><Globe size={10}/> Site Web</label>
                 <input type="url" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-xs focus:border-primary outline-none" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-zinc-600 uppercase ml-1 flex items-center gap-1"><Instagram size={10}/> Instagram</label>
                 <input type="url" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-xs focus:border-primary outline-none" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-zinc-600 uppercase ml-1 flex items-center gap-1"><Linkedin size={10}/> LinkedIn</label>
                 <input type="url" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-xs focus:border-primary outline-none" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} />
              </div>
          </div>

          <button type="submit" disabled={loading || uploading} className="w-full bg-primary hover:bg-white hover:text-black text-black font-black py-6 rounded-dynamic uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.2)] active:scale-[0.98] mt-4 disabled:opacity-50">
            {loading ? "Sauvegarde..." : <>{isPartner ? <Handshake size={24}/> : <UserCheck size={24}/>} {member ? 'Mettre à jour' : 'Enregistrer'}</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;