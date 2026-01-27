"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AlignLeft, Calendar, Globe, Layers, Loader2, Trash2, UploadCloud, User, Wind, XCircle, Save
} from "lucide-react";
import { z } from 'zod'; // Import de Zod pour la validation côté client

import { saveProjectAction } from "@/lib/actions";
import { supabase } from "@/lib/supabaseClient";
import type { Project, Category, PostProdDetail } from "@/types";
import { uploadFileAndGetPath } from "@/lib/clientUploadHelpers"; // Import de la fonction d'upload



interface ProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const PROJECT_BUCKET_NAME = 'portfolio_images';

// Type pour les données du formulaire, basé sur Project mais avec des valeurs par défaut
// Schéma Zod pour la validation côté client (doit correspondre à celui de actions.ts)
const PostProdDetailSchema = z.object({
  detail: z.string().min(1, "Le détail de la post-production est requis."),
  before_path: z.string().nullable().optional(),
  after_path: z.string().nullable().optional(),
});

const ProjectSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().nullable(),
  youtube_url: z.string().url("URL YouTube invalide.").nullable().optional(),
  project_date: z.string().refine((val) => !isNaN(Date.parse(val)), "Date de projet invalide."),
  category: z.string(),
  client_name: z.string().nullable(),
  client_website: z.string().nullable(),
  description_drone: z.string().nullable(),
  postprod_main_description: z.string().nullable(),
  client_logo_path: z.string().nullable(),
  postprod_before_path: z.string().nullable(),
  postprod_after_path: z.string().nullable(),
  description_postprod: z.array(PostProdDetailSchema).nullable(),
});

// Type pour les données du formulaire, basé sur Project mais avec des valeurs par défaut
type ProjectFormDataType = Omit<Project, 'id' | 'created_at'>;

const emptyFormData: ProjectFormDataType = {
  title: "",
  youtube_url: "",
  description: null,
  description_drone: null,
  postprod_main_description: null,
  description_postprod: [],
  client_name: null,
  client_website: null,
  project_date: new Date().toISOString().split('T')[0],
  client_logo_path: null,
  postprod_before_path: null,
  postprod_after_path: null,
  category: "",
};

// --- SOUS-COMPOSANT POUR L'UPLOAD D'IMAGE ---
interface ImageUploaderProps {
  label: string;
  currentPath: string | null; // Accepte un chemin
  onPathChange: (path: string | null) => void; // Retourne un chemin
  storageBucket: string;
  folderPath?: string; // Nouveau: chemin du dossier dans le bucket
  colorClass: string;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, currentPath, onPathChange, storageBucket, folderPath = '', colorClass, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    setUploadError(null);

    // Utiliser la fonction d'upload côté client
    const uploadedPath = await uploadFileAndGetPath(file, storageBucket, folderPath);
    if (!uploadedPath) {
      setUploadError("Échec de l'upload de l'image.");
    }
    onPathChange(uploadedPath); // Met à jour le chemin dans le formulaire parent
    setUploading(false);
  };

  const handleRemoveImage = () => { // Supprime l'image du formulaire
    onPathChange(null);
  };

  return (
    <div className="space-y-2">
      <label className={`text-[10px] font-bold uppercase ml-1 ${colorClass}`}>{label}</label>
      {currentPath ? ( // Utiliser currentPath pour déterminer si une image est présente
        <div className="relative w-full h-32 rounded-dynamic overflow-hidden border border-zinc-700 group">
          <img src={supabase.storage.from(storageBucket).getPublicUrl(currentPath).data.publicUrl} alt="Aperçu" className="w-full h-full object-cover" />
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
  formData: ProjectFormDataType
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
  const [serverError, setServerError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]); // Pour les erreurs de validation Zod côté client

  const [initialImagePaths, setInitialImagePaths] = useState<Set<{ bucket: string; path: string }>>(new Set());

  const [formData, setFormData] = useState<ProjectFormDataType>(emptyFormData);

  // États pour les fichiers à uploader
  const [clientLogoFile, setClientLogoFile] = useState<File | null>(null);
  const [postprodBeforeFile, setPostprodBeforeFile] = useState<File | null>(null);
  const [postprodAfterFile, setPostprodAfterFile] = useState<File | null>(null);
  // Pour les images des détails de post-production, on garde une trace des fichiers par index et type
  const [postprodDetailFiles, setPostprodDetailFiles] = useState<Array<{ index: number; type: 'before' | 'after'; file: File | null }>>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logique de verrouillage de la section "étapes individuelles"
  const isPostProdDetailsDisabled = !formData.postprod_main_description?.trim();

  useEffect(() => {
    if (isOpen) {
      setServerError(null); // Réinitialise l'erreur serveur
      setFormErrors([]);
      setClientLogoFile(null);
      setPostprodBeforeFile(null);
      setPostprodAfterFile(null);
      setPostprodDetailFiles([]);
      setInitialImagePaths(new Set());

      if (project) {
        // Mode édition : on charge les données du projet
        setFormData({
          title: project.title || "",
          youtube_url: project.youtube_url || "",
          description: project.description || null, // Gérer null
          description_drone: project.description_drone || null, // Gérer null
          postprod_main_description: project.postprod_main_description || null, // Gérer null
          description_postprod: (project.description_postprod && Array.isArray(project.description_postprod))
            ? project.description_postprod
            : [],
          client_name: project.client_name || null, // Gérer null
          client_website: project.client_website || null, // Gérer null
          project_date: project.project_date || new Date().toISOString().split('T')[0],
          client_logo_path: project.client_logo_path || null,
          postprod_before_path: project.postprod_before_path || null,
          postprod_after_path: project.postprod_after_path || null,
          category: project.category || "",
        });

        // Collecter les chemins initiaux pour la suppression
        const paths = new Set<{ bucket: string; path: string }>();
        if (project.client_logo_path) paths.add({ bucket: PROJECT_BUCKET_NAME, path: project.client_logo_path });
        if (project.postprod_before_path) paths.add({ bucket: PROJECT_BUCKET_NAME, path: project.postprod_before_path });
        if (project.postprod_after_path) paths.add({ bucket: PROJECT_BUCKET_NAME, path: project.postprod_after_path });
        if (project.description_postprod && Array.isArray(project.description_postprod)) {
          project.description_postprod.forEach(d => {
            if (d.before_path) paths.add({ bucket: PROJECT_BUCKET_NAME, path: d.before_path });
            if (d.after_path) paths.add({ bucket: PROJECT_BUCKET_NAME, path: d.after_path });
          });
        }
        setInitialImagePaths(paths);

        const tags = project.category ? project.category.split(',').map(t => t.trim()) : [];
        setSelectedCats(tags.filter(t => !["Drone", "Post-Prod", "Short"].includes(t)));
      } else {
        // Mode création : on réinitialise le formulaire
        setFormData(emptyFormData);
        setInitialImagePaths(new Set());
        setSelectedCats([]);
      }
    }
  }, [project, isOpen]);

  const toggleCat = useCallback((name: string) => {
    setSelectedCats(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
  }, []);

  // Handler générique pour les champs de texte/sélection
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === "" ? null : value, // Convertir les chaînes vides en null pour les champs optionnels
    }));
  }, []);

  // Gérer les changements de fichiers pour les images principales
  const handleMainFileChange = (file: File | null, field: 'client_logo' | 'postprod_before' | 'postprod_after') => {
    switch (field) {
      case 'client_logo': setClientLogoFile(file); break;
      case 'postprod_before': setPostprodBeforeFile(file); break;
      case 'postprod_after': setPostprodAfterFile(file); break;
    }
  };

  // Gérer les changements de fichiers pour les détails de post-production
  const handlePostProdDetailFileChange = (index: number, type: 'before' | 'after', file: File | null) => {
    setPostprodDetailFiles(prev => {
      const existing = prev.find(item => item.index === index && item.type === type);
      if (existing) {
        return prev.map(item => item.index === index && item.type === type ? { ...item, file } : item);
      }
      return [...prev, { index, type, file }];
    });
  };

  // Ajouter/Supprimer des détails de post-production
  const addPostProdDetail = () => {
    setFormData(prev => ({
      ...prev,
      description_postprod: [...(prev.description_postprod || []), { detail: '', before_path: null, after_path: null }]
    }));
  };

  const removePostProdDetail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      description_postprod: prev.description_postprod?.filter((_, i) => i !== index) || [] // Assurez-vous que c'est un tableau vide si tout est supprimé
    }));
    setPostprodDetailFiles(prev => prev.filter(item => item.index !== index));
  };

  const handlePostprodChange = useCallback((index: number, field: keyof PostProdDetail, value: string | null) => {
    setFormData(prev => {
      const newDetails = [...(prev.description_postprod || [])];
      if (newDetails[index]) { // S'assurer que l'élément existe
        newDetails[index] = { ...newDetails[index], [field]: value };
      }
      return { ...prev, description_postprod: newDetails };
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors([]);
    setServerError(null);

    // Validation côté client avec Zod
    const clientValidation = ProjectSchema.safeParse(formData);
    if (!clientValidation.success) {
      setFormErrors(clientValidation.error.issues);
      setIsSubmitting(false);
      return;
    }

    const dataToSave = {
      ...formData,
      category: getFinalCategories(selectedCats, formData).join(', '),
    };

    const imagesToDelete: { bucket: string; path: string }[] = [];

    try {
      // --- 1. Upload des images principales et collecte des chemins ---
      if (clientLogoFile) {
        const path = await uploadFileAndGetPath(clientLogoFile, PROJECT_BUCKET_NAME, 'projects/logos/');
        if (!path) throw new Error("Échec de l'upload du logo client.");
        if (formData.client_logo_path) imagesToDelete.push({ bucket: PROJECT_BUCKET_NAME, path: formData.client_logo_path });
        dataToSave.client_logo_path = path;
      }

      if (postprodBeforeFile) {
        const path = await uploadFileAndGetPath(postprodBeforeFile, PROJECT_BUCKET_NAME, 'projects/postprod/');
        if (!path) throw new Error("Échec de l'upload de l'image 'avant'.");
        if (formData.postprod_before_path) imagesToDelete.push({ bucket: PROJECT_BUCKET_NAME, path: formData.postprod_before_path });
        dataToSave.postprod_before_path = path;
      }

      if (postprodAfterFile) {
        const path = await uploadFileAndGetPath(postprodAfterFile, PROJECT_BUCKET_NAME, 'projects/postprod/');
        if (!path) throw new Error("Échec de l'upload de l'image 'après'.");
        if (formData.postprod_after_path) imagesToDelete.push({ bucket: PROJECT_BUCKET_NAME, path: formData.postprod_after_path });
        dataToSave.postprod_after_path = path;
      }

      // --- 2. Upload des images des détails de post-production ---
      if (dataToSave.description_postprod) {
        for (let i = 0; i < dataToSave.description_postprod.length; i++) {
          const detail = dataToSave.description_postprod[i];
          const beforeFile = postprodDetailFiles.find(item => item.index === i && item.type === 'before')?.file;
          const afterFile = postprodDetailFiles.find(item => item.index === i && item.type === 'after')?.file;

          if (beforeFile) {
            const path = await uploadFileAndGetPath(beforeFile, PROJECT_BUCKET_NAME, 'projects/postprod_details/');
            if (!path) throw new Error(`Échec de l'upload de l'image 'avant' pour le détail ${i + 1}.`);
            if (detail.before_path) imagesToDelete.push({ bucket: PROJECT_BUCKET_NAME, path: detail.before_path });
            detail.before_path = path;
          }
          if (afterFile) {
            const path = await uploadFileAndGetPath(afterFile, PROJECT_BUCKET_NAME, 'projects/postprod_details/');
            if (!path) throw new Error(`Échec de l'upload de l'image 'après' pour le détail ${i + 1}.`);
            if (detail.after_path) imagesToDelete.push({ bucket: PROJECT_BUCKET_NAME, path: detail.after_path });
            detail.after_path = path;
          }
        }
      }

      // --- 3. Déterminer les images à supprimer (anciennes images remplacées ou supprimées) ---
      const currentPathsInForm = new Set<string>();
      if (dataToSave.client_logo_path) currentPathsInForm.add(dataToSave.client_logo_path);
      if (dataToSave.postprod_before_path) currentPathsInForm.add(dataToSave.postprod_before_path);
      if (dataToSave.postprod_after_path) currentPathsInForm.add(dataToSave.postprod_after_path);
      if (dataToSave.description_postprod) {
        dataToSave.description_postprod.forEach(d => {
          if (d.before_path) currentPathsInForm.add(d.before_path);
          if (d.after_path) currentPathsInForm.add(d.after_path);
        });
      }

      // Filtrer les chemins initiaux qui ne sont plus présents dans le formulaire final
      const pathsToDeleteFromStorage: { bucket: string; path: string }[] = Array.from(initialImagePaths).filter(
        img => !currentPathsInForm.has(img.path)
      );

      // Ajouter les images marquées pour suppression par un nouvel upload
      imagesToDelete.forEach(img => pathsToDeleteFromStorage.push(img));

      // --- 4. Appeler la Server Action ---
      const result = await saveProjectAction(dataToSave, project ? project.id : null, pathsToDeleteFromStorage);

      setIsSubmitting(false);
      if (result.success) {
        alert("Projet sauvegardé avec succès !");
        // Réinitialiser les fichiers après un succès
        setClientLogoFile(null);
        setPostprodBeforeFile(null);
        setPostprodAfterFile(null);
        setPostprodDetailFiles([]);
        onSuccess(); // Ferme la modal et rafraîchit la liste
      } else {
        setServerError(('error' in result && result.error) || "Une erreur inconnue est survenue côté serveur."); // Utiliser 'error' in result
        // Gérer les erreurs de validation Zod du serveur si elles sont retournées
        if ('details' in result && result.details) {
          setFormErrors((result.details as any).issues);
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      setServerError(error.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, selectedCats, project, onSuccess, initialImagePaths, clientLogoFile, postprodBeforeFile, postprodAfterFile, postprodDetailFiles]);

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

        <form onSubmit={handleSubmit} className="space-y-8"> {/* Utiliser handleSubmit du useCallback */}

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
                  onPathChange={(path) => setFormData(prev => ({ ...prev, postprod_before_path: path }))}
                  storageBucket={PROJECT_BUCKET_NAME}
                  colorClass="text-purple-400"
                  folderPath="projects/postprod/"
                />
                <ImageUploader
                  label="Image Principale APRÈS Post-Prod"
                  currentPath={formData.postprod_after_path}
                  onPathChange={(path) => setFormData(prev => ({ ...prev, postprod_after_path: path }))}
                  storageBucket={PROJECT_BUCKET_NAME}
                  colorClass="text-purple-400"
                  folderPath="projects/postprod/"
                />
              </div>

              <p className="text-[10px] font-bold text-purple-400/70 uppercase tracking-widest ml-2 pt-2 border-t border-purple-900/40">Étapes individuelles (optionnel)</p>

              {/* Logo Client */}
              <ImageUploader
                label="Logo Client"
                currentPath={formData.client_logo_path}
                onPathChange={(path) => setFormData(prev => ({ ...prev, client_logo_path: path }))}
                storageBucket={PROJECT_BUCKET_NAME}
                colorClass="text-zinc-400"
                folderPath="projects/logos/"
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
                      label="Avant" currentPath={item.before_path || null}
                      onPathChange={(path) => handlePostprodChange(index, 'before_path', path)}
                      storageBucket={PROJECT_BUCKET_NAME}
                      folderPath="projects/postprod_details/"
                      disabled={isPostProdDetailsDisabled}
                      colorClass="text-purple-400"
                    />
                    <ImageUploader
                      label="Après" currentPath={item.after_path || null}
                      onPathChange={(path) => handlePostprodChange(index, 'after_path', path)}
                      storageBucket={PROJECT_BUCKET_NAME}
                      folderPath="projects/postprod_details/"
                      disabled={isPostProdDetailsDisabled}
                      colorClass="text-purple-400"
                    />
                  </div>
                  <button type="button" onClick={() => { setFormData(prev => ({ ...prev, description_postprod: (prev.description_postprod || []).filter((_, i) => i !== index) })); }} className="absolute -top-2 -right-2 p-1.5 bg-red-800/70 hover:bg-red-700 rounded-full text-red-300 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0" title="Supprimer ce détail" disabled={isPostProdDetailsDisabled}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPostProdDetail}
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
                <input type="text" name="client_name" className="w-full bg-background border border-zinc-800 p-3 rounded-dynamic text-sm focus:border-zinc-500" value={formData.client_name || ""} onChange={handleChange} placeholder="Nom du client" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-600 uppercase ml-1 flex items-center gap-1"><Globe size={10} /> Site Web</label>
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
            <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white font-bold uppercase text-[10px] tracking-widest px-6 py-3 rounded-dynamic transition-colors">
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