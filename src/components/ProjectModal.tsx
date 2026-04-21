"use client";

import React from "react";
import {
  AlignLeft, Calendar, Globe, Layers, Loader2, Trash2, UploadCloud, User, Wind, XCircle, Save
} from "lucide-react";
import toast from 'react-hot-toast';
import { supabase } from "@/lib/supabaseClient";
import type { Project, Category, PostProdDetail } from "@/types";
import { useProjectForm } from "@/hooks/useProjectForm";



interface ProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

// --- SOUS-COMPOSANT POUR L'UPLOAD D'IMAGE ---
interface ImageUploaderProps {
  label: string;
  currentPath: string | null;     // Chemin de l'image existante sur Supabase
  currentFile: File | null;       // Nouveau fichier sélectionné localement
  onFileSelect: (file: File | null) => void;
  onClearPath: () => void;        // Action pour effacer le chemin existant (Supabase)
  storageBucket: string;
  colorClass: string;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, currentPath, currentFile, onFileSelect, onClearPath, storageBucket, colorClass, disabled = false }) => {
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Sécurité : Blocage des fichiers trop lourds (> 5 Mo)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Le fichier ${file.name} est trop lourd (Maximum 5 Mo).`);
        return;
      }
      onFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    onFileSelect(null);
    if (currentPath) {
      onClearPath();
    }
  };

  // L'URL d'aperçu est soit le nouveau fichier (URL locale très rapide), soit l'image Supabase existante
  const previewUrl = currentFile 
    ? URL.createObjectURL(currentFile) 
    : currentPath 
      ? supabase.storage.from(storageBucket).getPublicUrl(currentPath).data.publicUrl 
      : null;

  return (
    <div className="space-y-2">
      <label className={`text-[10px] font-bold uppercase ml-1 ${colorClass}`}>{label}</label>
      {previewUrl ? ( 
        <div className="relative w-full h-32 rounded-dynamic overflow-hidden border border-zinc-700 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button type="button" onClick={handleRemoveImage} disabled={disabled} className="bg-red-600 hover:bg-red-500 text-foreground px-3 py-1.5 rounded-full font-bold text-xs uppercase flex items-center gap-1 disabled:opacity-50"><Trash2 size={14} /> Changer</button>
          </div>
        </div>
      ) : (
        <div className={`relative w-full h-32 border-2 border-dashed border-zinc-700 hover:border-primary rounded-dynamic transition-colors bg-zinc-900/30 group`}>
          <input type="file" accept="image/*" onChange={handleImageSelect} disabled={disabled} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/50 pointer-events-none">
            <UploadCloud size={28} className="mb-2 group-hover:text-primary transition-colors" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Glisser une image</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, project, categories, onClose, onSuccess }) => {
  const {
    formData, setFormData, selectedCats, toggleCat, handleChange, addPostProdDetail, removePostProdDetail,
    handleDetailFileChange, handlePostprodChange, handleSubmit, clientLogoFile, setClientLogoFile,
    postprodBeforeFile, setPostprodBeforeFile, postprodAfterFile, setPostprodAfterFile,
    postprodDetailFiles, isSubmitting, formErrors, serverError, isPostProdDetailsDisabled
  } = useProjectForm(project, isOpen, onSuccess);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-background/95 p-4 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-card border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-3xl shadow-2xl my-8 text-foreground">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-primary">
            {project ? 'Modifier' : 'Ajouter'} <span className="text-foreground">Projet</span>
          </h3>
          <button onClick={onClose} disabled={isSubmitting} className="text-foreground/40 hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <XCircle size={32} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8"> {/* Utiliser handleSubmit du useCallback */}

          {/* SECTION INFOS GÉNÉRALES */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-foreground/50 uppercase tracking-widest ml-2">Informations Générales</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text" name="title" placeholder="Titre du projet" required
                  className="w-full bg-background border border-zinc-800 p-4 rounded-dynamic outline-none focus:border-primary font-bold text-lg h-full"
                  value={formData.title} onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-foreground/40 uppercase ml-1 flex items-center gap-1 mb-1"><Calendar size={10} /> Date de sortie</label>
                <input
                  type="date" name="project_date" required
                  className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-sm focus:border-zinc-500 text-foreground"
                  value={formData.project_date} onChange={handleChange}
                />
              </div>
            </div>
            <input
              type="url" name="youtube_url" placeholder="Lien YouTube (ou Shorts)" required
              className="w-full bg-background border border-zinc-800 p-4 rounded-dynamic outline-none focus:border-primary text-blue-400"
              value={formData.youtube_url} onChange={handleChange}
            />
          </div>

          {/* CATÉGORIES */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-foreground/50 uppercase tracking-widest ml-2">Tags Métiers</p>
            <div className="flex flex-wrap gap-2 p-4 bg-background/50 border border-zinc-800 rounded-dynamic">
              {categories.map(cat => (
                <button
                  key={cat.id} type="button" onClick={() => toggleCat(cat.name)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black border transition-all ${selectedCats.includes(cat.name) ? 'bg-primary border-primary text-black' : 'bg-card border-zinc-700 text-foreground/70 hover:border-zinc-500 hover:text-foreground'
                    }`}
                >
                  {cat.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION CONTENU DÉTAILLÉ */}
          <div className="space-y-6">
            <p className="text-[10px] font-black text-foreground/50 uppercase tracking-widest ml-2">Contenu Détaillé</p>

            {/* DESCRIPTION GÉNÉRALE */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground/70 ml-2">
                <AlignLeft size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Contexte Général</span>
              </div>
              <textarea
                name="description"
                placeholder="Description globale du projet, objectifs..."
                rows={4}
                className="w-full bg-background border border-zinc-800 p-4 rounded-dynamic outline-none focus:border-white text-foreground/80"
                value={formData.description || ""} onChange={handleChange}
              />
            </div>

            {/* ZONE DRONE */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-400 ml-2">
                <Wind size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Spécificités Drone</span>
              </div>
              <textarea
                name="description_drone"
                placeholder="Détails du vol, altitude, autorisations, matériel utilisé..."
                rows={3}
                className="w-full bg-blue-950/20 border border-blue-900/40 p-4 rounded-dynamic outline-none focus:border-blue-500 text-sm text-blue-200 placeholder-blue-900/60"
                value={formData.description_drone || ""} onChange={handleChange}
              />
            </div>

            {/* ZONE POST-PROD */}
            <div className="space-y-4 bg-purple-950/20 border border-purple-900/40 p-4 rounded-dynamic">
              <div className="flex items-center gap-2 text-purple-400 ml-2">
                <Layers size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Détails Post-Production</span>
              </div>
              <textarea
                name="postprod_main_description"
                placeholder="Description générale de la post-production (logiciels, techniques...)"
                rows={3}
                className="w-full bg-purple-950/50 border border-purple-900/50 p-3 rounded-lg outline-none focus:border-purple-500 text-sm text-purple-200 placeholder-purple-900/60"
                value={formData.postprod_main_description || ""}
                onChange={handleChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <ImageUploader
                  label="Image Principale AVANT Post-Prod"
                  currentPath={formData.postprod_before_path}
                  currentFile={postprodBeforeFile}
                  onFileSelect={setPostprodBeforeFile}
                  onClearPath={() => setFormData(prev => ({ ...prev, postprod_before_path: null }))}
                  storageBucket="postprod-images"
                  colorClass="text-purple-400"
                />
                <ImageUploader
                  label="Image Principale APRÈS Post-Prod"
                  currentPath={formData.postprod_after_path}
                  currentFile={postprodAfterFile}
                  onFileSelect={setPostprodAfterFile}
                  onClearPath={() => setFormData(prev => ({ ...prev, postprod_after_path: null }))}
                  storageBucket="postprod-images"
                  colorClass="text-purple-400"
                />
              </div>

              <p className="text-[10px] font-bold text-purple-400/70 uppercase tracking-widest ml-2 pt-2 border-t border-purple-900/40">Étapes individuelles (optionnel)</p>

              {/* Logo Client */}
              <ImageUploader
                label="Logo Client"
                currentPath={formData.client_logo_path}
                currentFile={clientLogoFile}
                onFileSelect={setClientLogoFile}
                onClearPath={() => setFormData(prev => ({ ...prev, client_logo_path: null }))}
                storageBucket="logos"
                colorClass="text-foreground/70"
              />
              {isPostProdDetailsDisabled && (
                <div className="p-3 bg-purple-950/70 border border-purple-800/50 rounded-lg text-center text-xs text-purple-300/80">
                  Veuillez remplir la description générale de la post-production pour pouvoir ajouter des étapes détaillées.
                </div>
              )}

              {(formData.description_postprod || []).map((item: PostProdDetail, index: number) => ( // Spécifier le type de 'item'
                <div key={index} className="p-3 border border-purple-900/50 rounded-xl space-y-3 bg-background/30 group relative">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold text-xs">#{index + 1}</span>
                    <input
                      type="text"
                      placeholder={`Description (ex: Étalonnage colorimétrique)`}
                      value={item.detail}
                      onChange={e => {
                        handlePostprodChange(index, 'detail', e.target.value);
                      }}
                      className="w-full bg-background border border-purple-900/40 p-2 rounded-lg outline-none focus:border-purple-500 text-xs text-purple-200 placeholder-purple-900/60 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isPostProdDetailsDisabled}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ImageUploader
                      label="Avant" 
                      currentPath={item.before_path || null}
                      currentFile={postprodDetailFiles.find(f => f.index === index && f.type === 'before')?.file || null}
                      onFileSelect={(file) => handleDetailFileChange(index, 'before', file)}
                      onClearPath={() => handlePostprodChange(index, 'before_path', null)}
                      storageBucket="postprod-images"
                      disabled={isPostProdDetailsDisabled}
                      colorClass="text-purple-400"
                    />
                    <ImageUploader
                      label="Après" 
                      currentPath={item.after_path || null}
                      currentFile={postprodDetailFiles.find(f => f.index === index && f.type === 'after')?.file || null}
                      onFileSelect={(file) => handleDetailFileChange(index, 'after', file)}
                      onClearPath={() => handlePostprodChange(index, 'after_path', null)}
                      storageBucket="postprod-images"
                      disabled={isPostProdDetailsDisabled}
                      colorClass="text-purple-400"
                    />
                  </div>
                  <button type="button" onClick={() => removePostProdDetail(index)} className="absolute -top-2 -right-2 p-1.5 bg-red-800/70 hover:bg-red-700 rounded-full text-red-300 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0" title="Supprimer ce détail" disabled={isPostProdDetailsDisabled}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPostProdDetail}
                className="text-xs font-bold text-purple-400 hover:text-foreground transition-colors pt-2 pl-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isPostProdDetailsDisabled}
              >
                + Ajouter une étape de post-production
              </button>
            </div>
          </div>

          {/* INFO CLIENT & DATE */}
          <div className="space-y-4 border-t border-zinc-800 pt-6">
            <p className="text-[10px] font-black text-foreground/50 uppercase tracking-widest ml-2">Informations Client</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-foreground/40 uppercase ml-1 flex items-center gap-1"><User size={10} /> Client</label>
                <input type="text" name="client_name" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-sm focus:border-zinc-500" value={formData.client_name || ""} onChange={handleChange} placeholder="Nom du client" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-foreground/40 uppercase ml-1 flex items-center gap-1"><Globe size={10} /> Site Web</label>
                <input type="text" name="client_website" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-sm focus:border-zinc-500" value={formData.client_website || ""} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>
          </div>

          {serverError && ( // Utiliser serverError
            <div className="bg-red-900/30 border border-red-500 p-3 rounded-lg text-red-400 text-xs text-center">
              {serverError}
            </div>
          )}
          {formErrors.length > 0 && (
            <div className="text-red-500">
              <p>Veuillez corriger les erreurs suivantes :</p>
              <ul>
                {formErrors.map((err, i) => (
                  <li key={i}>{err.path.join('.')} : {err.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* BOUTONS D'ACTION */}
          <div className="flex justify-end items-center gap-4 border-t border-zinc-800 pt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="text-foreground/70 hover:text-foreground font-bold uppercase text-[10px] tracking-widest px-6 py-3 rounded-dynamic transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-white hover:text-black text-black font-black py-4 px-8 rounded-dynamic uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              {isSubmitting ? "Enregistrement..." : (project ? 'Mettre à jour' : 'Publier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;