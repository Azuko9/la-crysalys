"use client";

import { deleteProjectAction } from "@/app/actions";
import { Pencil, Trash2 } from "lucide-react";
import type { Project } from "@/types";

interface AdminProjectControlsProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDeleteSuccess: () => void;
  className?: string;
}

export const AdminProjectControls: React.FC<AdminProjectControlsProps> = ({ project, onEdit, onDeleteSuccess, className }) => {

  const getFileUrlsFromProject = (project: Project): string[] => {
    const urls = new Set<string>();
  
    if (project.postprod_before_url) urls.add(project.postprod_before_url);
    if (project.postprod_after_url) urls.add(project.postprod_after_url);
  
    if (project.description_postprod && Array.isArray(project.description_postprod)) {
      project.description_postprod.forEach(detail => {
        if (detail.before_url) urls.add(detail.before_url);
        if (detail.after_url) urls.add(detail.after_url);
      });
    }
  
    return Array.from(urls);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.title}" ? Cette action est irréversible.`)) {
      const imageUrlsToDelete = getFileUrlsFromProject(project);
      const result = await deleteProjectAction(project.id, imageUrlsToDelete);

      if (result.success) {
        onDeleteSuccess();
      } else {
        alert(`Erreur lors de la suppression : ${result.error}`);
      }
    }
  };

  return (
    <div className={className}>
      <button onClick={(e) => { e.stopPropagation(); onEdit(project); }} className="bg-blue-600/90 hover:bg-blue-500 p-2 rounded text-white backdrop-blur-sm" title="Modifier"><Pencil size={14}/></button>
      <button onClick={handleDelete} className="bg-red-600/90 hover:bg-red-500 p-2 rounded text-white backdrop-blur-sm" title="Supprimer"><Trash2 size={14}/></button>
    </div>
  );
};