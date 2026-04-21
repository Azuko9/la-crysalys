import { useState, useEffect, useCallback } from "react";
import { z } from 'zod';
import toast from 'react-hot-toast';
import { saveProjectAction, rollbackUploadsAction } from "@/lib/actions";
import { ProjectSchema } from "@/lib/schemas";
import { uploadFileAndGetPath } from "@/lib/clientUploadHelpers";
import type { Project, PostProdDetail } from "@/types";

export type ProjectFormDataType = Omit<Project, 'id' | 'created_at'>;

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
  category: [],
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

export function useProjectForm(project: Project | null, isOpen: boolean, onSuccess: () => void) {
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [formData, setFormData] = useState<ProjectFormDataType>(emptyFormData);

  const [clientLogoFile, setClientLogoFile] = useState<File | null>(null);
  const [postprodBeforeFile, setPostprodBeforeFile] = useState<File | null>(null);
  const [postprodAfterFile, setPostprodAfterFile] = useState<File | null>(null);
  const [postprodDetailFiles, setPostprodDetailFiles] = useState<Array<{ index: number; type: 'before' | 'after'; file: File | null }>>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPostProdDetailsDisabled = !formData.postprod_main_description?.trim();

  useEffect(() => {
    if (isOpen) {
      setServerError(null);
      setFormErrors([]);
      setClientLogoFile(null);
      setPostprodBeforeFile(null);
      setPostprodAfterFile(null);
      setPostprodDetailFiles([]);

      if (project) {
        setFormData({
          title: project.title || "",
          youtube_url: project.youtube_url || "",
          description: project.description || null,
          description_drone: project.description_drone || null,
          postprod_main_description: project.postprod_main_description || null,
          description_postprod: (project.description_postprod && Array.isArray(project.description_postprod))
            ? project.description_postprod
            : [],
          client_name: project.client_name || null,
          client_website: project.client_website || null,
          project_date: project.project_date || new Date().toISOString().split('T')[0],
          client_logo_path: project.client_logo_path || null,
          postprod_before_path: project.postprod_before_path || null,
          postprod_after_path: project.postprod_after_path || null,
          category: project.category || [],
        });

        const tags = Array.isArray(project.category) ? project.category : [];
        setSelectedCats(tags.filter(t => !["Drone", "Post-Prod", "Short"].includes(t)));
      } else {
        setFormData(emptyFormData);
        setSelectedCats([]);
      }
    }
  }, [project, isOpen]);

  const toggleCat = useCallback((name: string) => {
    setSelectedCats(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  }, []);

  const addPostProdDetail = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      description_postprod: [...(prev.description_postprod || []), { detail: '', before_path: null, after_path: null }]
    }));
  }, []);

  const removePostProdDetail = useCallback((index: number) => {
    setFormData(prev => ({ ...prev, description_postprod: (prev.description_postprod || []).filter((_, i) => i !== index) })); 
    setPostprodDetailFiles(prev => prev.filter(f => f.index !== index).map(f => f.index > index ? { ...f, index: f.index - 1 } : f));
  }, []);

  const handleDetailFileChange = useCallback((index: number, type: 'before' | 'after', file: File | null) => {
    setPostprodDetailFiles(prev => {
      const existing = prev.filter(f => !(f.index === index && f.type === type));
      if (file) return [...existing, { index, type, file }];
      return existing;
    });
  }, []);

  const handlePostprodChange = useCallback((index: number, field: keyof PostProdDetail, value: string | null) => {
    setFormData(prev => {
      const newDetails = [...(prev.description_postprod || [])];
      if (newDetails[index]) {
        newDetails[index] = { ...newDetails[index], [field]: value };
      }
      return { ...prev, description_postprod: newDetails };
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setFormErrors([]);
    setServerError(null);

    const dataToSave = { ...formData, category: getFinalCategories(selectedCats, formData) };
    const clientValidation = ProjectSchema.safeParse(dataToSave);
    
    if (!clientValidation.success) {
      setFormErrors(clientValidation.error.issues);
      setIsSubmitting(false);
      return;
    }

    const newlyUploadedImages: { bucket: string; path: string }[] = [];

    try {
      const uploadJobs: { file: File; bucket: string; folder: string; setter: (p: string) => void }[] = [];
      if (clientLogoFile) uploadJobs.push({ file: clientLogoFile, bucket: 'logos', folder: 'projects/logos/', setter: p => dataToSave.client_logo_path = p });
      if (postprodBeforeFile) uploadJobs.push({ file: postprodBeforeFile, bucket: 'postprod-images', folder: 'projects/postprod/', setter: p => dataToSave.postprod_before_path = p });
      if (postprodAfterFile) uploadJobs.push({ file: postprodAfterFile, bucket: 'postprod-images', folder: 'projects/postprod/', setter: p => dataToSave.postprod_after_path = p });

      if (dataToSave.description_postprod) {
        dataToSave.description_postprod.forEach((detail, i) => {
          const beforeFile = postprodDetailFiles.find(item => item.index === i && item.type === 'before')?.file;
          const afterFile = postprodDetailFiles.find(item => item.index === i && item.type === 'after')?.file;
          if (beforeFile) uploadJobs.push({ file: beforeFile, bucket: 'postprod-images', folder: 'projects/postprod_details/', setter: p => detail.before_path = p });
          if (afterFile) uploadJobs.push({ file: afterFile, bucket: 'postprod-images', folder: 'projects/postprod_details/', setter: p => detail.after_path = p });
        });
      }

      const uploadResults = await Promise.all(uploadJobs.map(async job => {
        const path = await uploadFileAndGetPath(job.file, job.bucket, job.folder);
        return { ...job, path };
      }));

      uploadResults.forEach(res => { if (res.path) newlyUploadedImages.push({ bucket: res.bucket, path: res.path }); });
      if (uploadResults.some(res => !res.path)) throw new Error("Échec de l'upload d'une ou plusieurs images. L'opération a été annulée.");
      uploadResults.forEach(res => { if (res.path) res.setter(res.path); });

      const result = await saveProjectAction(dataToSave, project ? project.id : null);

      setIsSubmitting(false);
      if (result.success) {
        toast.success("Projet sauvegardé avec succès !");
        setClientLogoFile(null); setPostprodBeforeFile(null); setPostprodAfterFile(null); setPostprodDetailFiles([]);
        onSuccess();
      } else {
        if (newlyUploadedImages.length > 0) await rollbackUploadsAction(newlyUploadedImages);
        setServerError('error' in result ? String(result.error) : "Une erreur inconnue est survenue côté serveur.");
        if ('details' in result && result.details) {
          const flattened = result.details as { fieldErrors: Record<string, string[]> };
          const issuesFromServer: z.ZodIssue[] = [];
          if (flattened.fieldErrors) {
            Object.entries(flattened.fieldErrors).forEach(([field, msgs]) => {
              msgs.forEach(msg => issuesFromServer.push({ path: [field], message: msg, code: 'custom' } as z.ZodIssue));
            });
          }
          setFormErrors(issuesFromServer);
        }
        toast.error("Erreur lors de la sauvegarde. Veuillez vérifier le formulaire.");
      }
    } catch (error: unknown) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      if (newlyUploadedImages.length > 0) await rollbackUploadsAction(newlyUploadedImages);
      const errorMessage = error instanceof Error ? error.message : "Une erreur inattendue est survenue.";
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, selectedCats, project, onSuccess, clientLogoFile, postprodBeforeFile, postprodAfterFile, postprodDetailFiles, isSubmitting]);

  return {
    formData, setFormData, selectedCats, toggleCat, handleChange, addPostProdDetail, removePostProdDetail,
    handleDetailFileChange, handlePostprodChange, handleSubmit, clientLogoFile, setClientLogoFile,
    postprodBeforeFile, setPostprodBeforeFile, postprodAfterFile, setPostprodAfterFile,
    postprodDetailFiles, setPostprodDetailFiles, isSubmitting, formErrors, serverError, isPostProdDetailsDisabled
  };
}