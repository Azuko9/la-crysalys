"use client";

import { deleteProjectAction } from "@/lib/actions";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Project } from "@/types";

interface AdminProjectControlsProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDeleteSuccess: () => void;
  className?: string;
}

export const AdminProjectControls: React.FC<AdminProjectControlsProps> = ({ project, onEdit, onDeleteSuccess, className }) => {

  // La fonction getFileUrlsFromProject n'est plus nécessaire ici car les chemins sont passés directement

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.title}" ? Cette action est irréversible.`)) {      
      const result = await deleteProjectAction(project.id);

      if (result.success) {
        toast.success("Projet supprimé !");
        onDeleteSuccess();
      } else {
        toast.error(`Erreur lors de la suppression : ${'error' in result ? result.error : 'Une erreur inconnue est survenue.'}`);
      }
    }
  };

  return (
    <div className={className}>
      <button onClick={(e) => { e.stopPropagation(); onEdit(project); }} className="bg-blue-600/90 hover:bg-blue-500 p-2 rounded text-foreground backdrop-blur-sm" title="Modifier"><Pencil size={14}/></button>
      <button onClick={handleDelete} className="bg-red-600/90 hover:bg-red-500 p-2 rounded text-foreground backdrop-blur-sm" title="Supprimer"><Trash2 size={14}/></button>
    </div>
  );
};