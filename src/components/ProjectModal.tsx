"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AlignLeft, Calendar, Globe, Layers, Loader2, Trash2,
  UploadCloud, User, Wind, XCircle
} from "lucide-react";

import { saveProjectAction } from "@/app/actions";
import { supabase } from "@/lib/supabaseClient";
import type { Project, Category, PostProdDetail } from "@/app/index";



interface ProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

// Ce type représente les données du formulaire, aligné avec le type `Project` global.
type ProjectFormData = {
  title: string;
  youtube_url: string;
  description: string;
  description_drone: string;
  postprod_main_description: string;
  description_postprod: PostProdDetail[];
  client_name: string;
  client_website: string;
  project_date: string;
  postprod_before_url: string;
  postprod_after_url: string;
};

const emptyFormData: ProjectFormData = {
  title: "",
  youtube_url: "",
  description: "",
  description_drone: "",
  postprod_main_description: "",
  description_postprod: [],
  client_name: "",
  client_website: "",
  project_date: new Date().toISOString().split('T')[0],
  postprod_before_url: "",
  postprod_after_url: "",
};

// --- SOUS-COMPOSANT POUR L'UPLOAD D'IMAGE ---
interface ImageUploaderProps {
  label: string;
  currentUrl: string;
  onUrlChange: (url: string) => void;
  storageBucket: string;
  colorClass: string;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, currentUrl, onUrlChange, storageBucket, colorClass, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileName = `${Date.now()}-${file.name}`;
    setUploading(true);
    setUploadError(null);

    const { error: uploadError } = await supabase.storage.from(storageBucket).upload(fileName, file);
    if (uploadError) {
      setUploadError("Erreur: " + uploadError.message);
      setUploading(false); return;
    }

    const { data: { publicUrl } } = supabase.storage.from(storageBucket).getPublicUrl(fileName);
    onUrlChange(publicUrl);
    setUploading(false);
  };

  const handleRemoveImage = () => {
    onUrlChange(""); // Mise à jour optimiste de l'UI
  };

  return (
    <div className="space-y-2">
      <label className={`text-[10px] font-bold uppercase ml-1 ${colorClass}`}>{label}</label>
      {currentUrl ? (
        <div className="relative w-full h-32 rounded-dynamic overflow-hidden border border-zinc-700 group">
          <img src={currentUrl} alt="Aperçu" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button type="button" onClick={handleRemoveImage} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-full font-bold text-xs uppercase flex items-center gap-1"><Trash2 size={14} /> Changer</button>
          </div>
        </div>
      ) : (
        <div className={`relative w-full h-32 border-2 border-dashed border-zinc-700 hover:border-primary rounded-dynamic transition-colors bg-zinc-900/30 group`}>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading || disabled} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 pointer-events-none">
            {uploading ? <Loader2 size={28} className="animate-spin text-primary mb-2" /> : <UploadCloud size={28} className="mb-2 group-hover:text-primary transition-colors" />}
            <span className="text-[9px] font-bold uppercase tracking-widest">{uploading ? 'Envoi...' : 'Glisser une image'}</span>
          </div>
        </div>
      )}
      {uploadError && (
        <p className="text-red-500 text-xs mt-1">{uploadError}</p>
      )}
    </div>
  );
};

const getFinalCategories = (
  selectedCats: string[],
  formData: ProjectFormData
): string[] => {
  const finalLabels = new Set(selectedCats);

  if (formData.youtube_url.includes('/shorts/')) {
    finalLabels.add('Short');
  }
  if (formData.description_drone && formData.description_drone.trim().length > 0) {
    finalLabels.add('Drone');
  }
  if (formData.postprod_main_description && formData.postprod_main_description.trim().length > 0) {
    finalLabels.add('Post-Prod');
  }
  return Array.from(finalLabels);
};

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, project, categories, onClose, onSuccess }) => {
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialImageUrls, setInitialImageUrls] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<ProjectFormData>(emptyFormData);

  // Logique de verrouillage de la section "étapes individuelles"
  const isPostProdDetailsDisabled = !formData.postprod_main_description.trim();

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (project) {
        const urls = new Set<string>();
        // Mode édition : on charge les données du projet
        setFormData({
          title: project.title || "",
          youtube_url: project.youtube_url || "",
          description: project.description || "",
          description_drone: project.description_drone || "",
          postprod_main_description: project.postprod_main_description || "",
          // On charge le tableau JSON, ou on initialise un tableau vide s'il n'y a rien
          description_postprod: (project.description_postprod && Array.isArray(project.description_postprod))
            ? project.description_postprod
            : [],
          client_name: project.client_name || "",
          client_website: project.client_website || "",
          project_date: project.project_date || new Date().toISOString().split('T')[0],
          postprod_before_url: project.postprod_before_url || "",
          postprod_after_url: project.postprod_after_url || "",
        });

        if (project.postprod_before_url) urls.add(project.postprod_before_url);
        if (project.postprod_after_url) urls.add(project.postprod_after_url);
        if (project.description_postprod && Array.isArray(project.description_postprod)) {
          project.description_postprod.forEach(d => {
            if (d.before_url) urls.add(d.before_url);
            if (d.after_url) urls.add(d.after_url);
          });
        }
        setInitialImageUrls(urls);

        const tags = project.category ? project.category.split(',').map(t => t.trim()) : [];
        setSelectedCats(tags.filter(t => !["Drone", "Post-Prod", "Short"].includes(t)));
      } else {
        // Mode création : on réinitialise le formulaire
        setFormData({
          ...emptyFormData,
          project_date: new Date().toISOString().split('T')[0],
        });
        setInitialImageUrls(new Set());
        setSelectedCats([]);
      }
    }
  }, [project, isOpen]);

  const toggleCat = useCallback((name: string) => {
    setSelectedCats(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
  }, []);

  // Handler générique pour les champs de formulaire simples
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handlePostprodChange = useCallback((index: number, field: keyof PostProdDetail, value: string) => {
    setFormData(prev => {
      const newDetails = [...(prev.description_postprod || [])];
      newDetails[index] = { ...newDetails[index], [field]: value };
      return { ...prev, description_postprod: newDetails };
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // On filtre les détails qui sont complètement vides avant de sauvegarder
    const cleanedPostProd = (formData.description_postprod || []).filter(
      d => d.detail.trim() !== '' || d.before_url || d.after_url
    );

    const payload = {
      ...formData,
      description_postprod: cleanedPostProd,
      category: getFinalCategories(selectedCats, formData).join(', '),
    };

    // Déterminer les images à supprimer en comparant l'état initial et final
    const finalImageUrls = new Set<string>();
    if (payload.postprod_before_url) finalImageUrls.add(payload.postprod_before_url);
    if (payload.postprod_after_url) finalImageUrls.add(payload.postprod_after_url);
    if (payload.description_postprod) {
      payload.description_postprod.forEach(d => {
        if (d.before_url) finalImageUrls.add(d.before_url);
        if (d.after_url) finalImageUrls.add(d.after_url);
      });
    }
    const imagesToDelete = Array.from(initialImageUrls).filter(url => !finalImageUrls.has(url));

    const result = await saveProjectAction(payload, project ? project.id : null, imagesToDelete);

    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setError(`Erreur lors de la sauvegarde: ${result.error}`);
    }
  }, [formData, selectedCats, project, onSuccess, initialImageUrls]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-background/95 p-4 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-card border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-3xl shadow-2xl my-8 text-white">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-primary">
            {project ? 'Modifier' : 'Ajouter'} <span className="text-white">Projet</span>
          </h3>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
            <XCircle size={32} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* SECTION INFOS GÉNÉRALES */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Informations Générales</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text" name="title" placeholder="Titre du projet" required
                  className="w-full bg-background border border-zinc-800 p-4 rounded-dynamic outline-none focus:border-primary font-bold text-lg h-full"
                  value={formData.title} onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-zinc-600 uppercase ml-1 flex items-center gap-1 mb-1"><Calendar size={10} /> Date de sortie</label>
                <input
                  type="date" name="project_date" required
                  className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-sm focus:border-zinc-500 text-white"
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
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Tags Métiers</p>
            <div className="flex flex-wrap gap-2 p-4 bg-background/50 border border-zinc-800 rounded-dynamic">
              {categories.map(cat => (
                <button
                  key={cat.id} type="button" onClick={() => toggleCat(cat.name)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black border transition-all ${selectedCats.includes(cat.name) ? 'bg-primary border-primary text-black' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                    }`}
                >
                  {cat.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION CONTENU DÉTAILLÉ */}
          <div className="space-y-6">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Contenu Détaillé</p>

            {/* DESCRIPTION GÉNÉRALE */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-400 ml-2">
                <AlignLeft size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Contexte Général</span>
              </div>
              <textarea
                name="description"
                placeholder="Description globale du projet, objectifs..."
                rows={4}
                className="w-full bg-background border border-zinc-800 p-4 rounded-dynamic outline-none focus:border-white text-zinc-300"
                value={formData.description} onChange={handleChange}
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
                value={formData.description_drone} onChange={handleChange}
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
                value={formData.postprod_main_description}
                onChange={handleChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <ImageUploader
                  label="Image Principale AVANT Post-Prod"
                  currentUrl={formData.postprod_before_url}
                  onUrlChange={(url) => setFormData(prev => ({ ...prev, postprod_before_url: url }))}
                  storageBucket="postprod-images" colorClass="text-purple-400"
                />
                <ImageUploader
                  label="Image Principale APRÈS Post-Prod"
                  currentUrl={formData.postprod_after_url}
                  onUrlChange={(url) => setFormData(prev => ({ ...prev, postprod_after_url: url }))}
                  storageBucket="postprod-images" colorClass="text-purple-400"
                />
              </div>

              <p className="text-[10px] font-bold text-purple-400/70 uppercase tracking-widest ml-2 pt-2 border-t border-purple-900/40">Étapes individuelles (optionnel)</p>

              {isPostProdDetailsDisabled && (
                <div className="p-3 bg-purple-950/70 border border-purple-800/50 rounded-lg text-center text-xs text-purple-300/80">
                  Veuillez remplir la description générale de la post-production pour pouvoir ajouter des étapes détaillées.
                </div>
              )}

              {(formData.description_postprod || []).map((item, index) => (
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
                      label="Avant" currentUrl={item.before_url}
                      onUrlChange={(url) => handlePostprodChange(index, 'before_url', url)}
                      storageBucket="postprod-images" colorClass="text-purple-400"
                      disabled={isPostProdDetailsDisabled}
                    />
                    <ImageUploader
                      label="Après" currentUrl={item.after_url}
                      onUrlChange={(url) => handlePostprodChange(index, 'after_url', url)}
                      storageBucket="postprod-images" colorClass="text-purple-400"
                      disabled={isPostProdDetailsDisabled}
                    />
                  </div>
                  <button type="button" onClick={() => { setFormData(prev => ({ ...prev, description_postprod: (prev.description_postprod || []).filter((_, i) => i !== index) })); }} className="absolute -top-2 -right-2 p-1.5 bg-red-800/70 hover:bg-red-700 rounded-full text-red-300 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0" title="Supprimer ce détail" disabled={isPostProdDetailsDisabled}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => { setFormData(prev => ({ ...prev, description_postprod: [...(prev.description_postprod || []), { detail: "", before_url: "", after_url: "" }] })); }}
                className="text-xs font-bold text-purple-400 hover:text-white transition-colors pt-2 pl-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isPostProdDetailsDisabled}
              >
                + Ajouter une étape de post-production
              </button>
            </div>
          </div>

          {/* INFO CLIENT & DATE */}
          <div className="space-y-4 border-t border-zinc-800 pt-6">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Informations Client</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-600 uppercase ml-1 flex items-center gap-1"><User size={10} /> Client</label>
                <input type="text" name="client_name" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-sm focus:border-zinc-500"
                  value={formData.client_name} onChange={handleChange} placeholder="Nom du client" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-600 uppercase ml-1 flex items-center gap-1"><Globe size={10} /> Site Web</label>
                <input type="text" name="client_website" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-sm focus:border-zinc-500"
                  value={formData.client_website} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500 p-3 rounded-lg text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          {/* BOUTONS D'ACTION */}
          <div className="flex justify-end items-center gap-4 border-t border-zinc-800 pt-6">
            <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white font-bold uppercase text-[10px] tracking-widest px-6 py-3 rounded-dynamic transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="bg-primary hover:bg-white hover:text-black text-black font-black py-4 px-8 rounded-dynamic uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="animate-spin" /> : <UploadCloud size={18} />}
              {loading ? "Enregistrement..." : (project ? 'Mettre à jour' : 'Publier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;