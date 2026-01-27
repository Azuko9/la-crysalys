"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getYouTubeID } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import type { Project } from "@/types";
import { AdminProjectControls } from "./AdminProjectControls";

interface ProjectCardProps {
  projet: Project;
  user: User | null;
  onEdit: (project: Project) => void;
  onDeleteSuccess: () => void;
  isVertical?: boolean;
}

// Définir le nom du bucket pour les images de projets
const PROJECT_BUCKET_NAME = 'portfolio_images';

export function ProjectCard({ projet, user, onEdit, onDeleteSuccess, isVertical = false }: ProjectCardProps) {
  const videoId = getYouTubeID(projet.youtube_url);
  
  const categoriesList = projet.category ? projet.category.split(',').map((c) => c.trim()).filter(c => c) : [];

  // Fonction pour collecter tous les chemins d'images du projet
  const getAllImagePathsForProject = (project: Project): { bucket: string; path: string }[] => {
    const paths: { bucket: string; path: string }[] = [];
    if (project.client_logo_path) paths.push({ bucket: PROJECT_BUCKET_NAME, path: project.client_logo_path });
    if (project.postprod_before_path) paths.push({ bucket: PROJECT_BUCKET_NAME, path: project.postprod_before_path });
    if (project.postprod_after_path) paths.push({ bucket: PROJECT_BUCKET_NAME, path: project.postprod_after_path });
    if (project.description_postprod && Array.isArray(project.description_postprod)) {
      project.description_postprod.forEach(d => {
        if (d.before_path) paths.push({ bucket: PROJECT_BUCKET_NAME, path: d.before_path });
        if (d.after_path) paths.push({ bucket: PROJECT_BUCKET_NAME, path: d.after_path });
      });
    }
    return paths;
  };

  return (
    <div className="bg-card border border-zinc-800 rounded-dynamic overflow-hidden group transition-all relative flex flex-col h-full">
      <Link href={`/realisations/${projet.id}`} className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-t-dynamic">
      <div className={`relative ${isVertical ? 'aspect-[9/16]' : 'aspect-video'} bg-black overflow-hidden w-full`}>
          {videoId && (
            <Image
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={projet.title}
              fill
              className="object-cover opacity-90 group-hover:opacity-0 transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />)}
        
        <div className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          {videoId && <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${videoId}`} title={projet.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" className="w-full h-full" style={{ border: 0 }} />}
        </div>
      </div>
      </Link>
        {user && (
          <AdminProjectControls 
            project={projet} 
            onEdit={onEdit} 
            onDeleteSuccess={onDeleteSuccess} 
            className="absolute top-2 right-2 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity" 
            imagesToDelete={getAllImagePathsForProject(projet)} // Passe tous les chemins d'images pour suppression
          />
        )}
      <div className="p-4 bg-card flex-1 flex flex-col justify-between">
        <h3 className="font-black uppercase text-xs line-clamp-1 tracking-wider text-white group-hover:text-primary transition-colors">{projet.title}</h3>
        <div className="flex flex-wrap gap-1 mt-3">
          {categoriesList.map((cat, i) => (
            <span key={i} className="text-[8px] bg-transparent border border-primary text-primary px-2 py-0.5 rounded uppercase font-bold tracking-wide">{cat}</span>
          ))}
        </div>
      </div>
    </div>
  );
}