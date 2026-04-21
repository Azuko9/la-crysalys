"use client";

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

export function ProjectCard({ projet, user, onEdit, onDeleteSuccess, isVertical = false }: ProjectCardProps) {
  const videoId = getYouTubeID(projet.youtube_url);
  
  // Gère la transition entre l'ancien tableau texte et la nouvelle relation Many-to-Many
  const rawCategories = (projet as any).portfolio_item_categories;
  const mappedCategories = Array.isArray(rawCategories) 
    ? rawCategories.map((c: any) => c.categories?.name).filter(Boolean) 
    : [];

  const rawOldCategory = projet.category as any;
  let oldCategories: string[] = [];
  if (Array.isArray(rawOldCategory)) {
    oldCategories = rawOldCategory;
  } else if (typeof rawOldCategory === 'string' && rawOldCategory.length > 0) {
    oldCategories = rawOldCategory.replace(/^\{|\}$/g, '').split(',').map((s: string) => s.replace(/^"|"$/g, '').trim());
  }
  const categoriesList = oldCategories.length > 0 ? oldCategories : mappedCategories;

  return (
    <div className="bg-card border border-zinc-800 rounded-dynamic overflow-hidden group transition-all relative flex flex-col h-full hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20 duration-300 ease-out">
      <Link href={`/realisations/${projet.id}`} className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-t-dynamic">
      <div className={`relative ${isVertical ? 'aspect-[9/16]' : 'aspect-video'} bg-black overflow-hidden w-full`}>
          {videoId && (
            <Image
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={projet.title}
              fill
              priority
              className="object-cover opacity-90 group-hover:opacity-0 transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />)}
        
        <div className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          {videoId && <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${videoId}`} title={projet.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" loading="lazy" className="w-full h-full" style={{ border: 0 }} />}
        </div>
      </div>
      </Link>
        {user && (
          <AdminProjectControls 
            project={projet} 
            onEdit={onEdit} 
            onDeleteSuccess={onDeleteSuccess} 
            className="absolute top-2 right-2 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity" 
          />
        )}
      <div className="p-4 bg-card flex-1 flex flex-col justify-between">
        <h3 className="font-black uppercase text-sm line-clamp-1 tracking-wider text-foreground group-hover:text-primary transition-colors">{projet.title}</h3>
        <div className="flex flex-wrap gap-1 mt-3">
          {categoriesList.map((cat, i) => (
            <span key={i} className="text-xs bg-transparent border border-primary text-primary px-2 py-0.5 rounded uppercase font-bold tracking-wide">{cat}</span>
          ))}
        </div>
      </div>
    </div>
  );
}