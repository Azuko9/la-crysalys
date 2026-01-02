"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Calendar, Briefcase, Globe, ExternalLink } from "lucide-react";

interface Project {
  id: string;
  title: string;
  youtube_url: string;
  category: string;
  description: string | null;
  client_name: string | null;
  client_website: string | null;
  project_date: string | null;
}

export default function RealisationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Erreur lors de la récupération du projet:", error);
        router.push("/realisations"); // Retour si projet inexistant
      } else {
        setProject(data as Project);
      }
      setLoading(false);
    };

    if (id) fetchProject();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
      </div>
    );
  }

  if (!project) return null;

  const videoId = getYouTubeID(project.youtube_url);

  return (
    <main className="min-h-screen bg-black text-white pb-20 pt-28 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* BOUTON RETOUR */}
        <Link 
          href="/realisations" 
          className="inline-flex items-center text-gray-400 hover:text-green-500 transition mb-8 group"
        >
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
          Retour aux réalisations
        </Link>

        {/* LECTEUR VIDÉO PRINCIPAL */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-zinc-900 mb-12">
          {videoId ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={project.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">Vidéo non disponible</div>
          )}
        </div>

        {/* INFOS DU PROJET */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* COLONNE GAUCHE : TEXTE */}
          <div className="lg:col-span-2">
            <div className="mb-6">
                <span className="text-green-500 text-sm font-bold uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                    {project.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
                    {project.title}
                </h1>
            </div>
            
            <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">
              {project.description || "Aucune description détaillée pour ce projet."}
            </p>
          </div>

          {/* COLONNE DROITE : METADONNÉES */}
          <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 h-fit space-y-6">
            <h3 className="text-xl font-bold border-b border-zinc-800 pb-4">Détails du projet</h3>
            
            {/* DATE */}
            <div className="flex items-start gap-4">
              <div className="bg-green-500/10 p-2 rounded-lg text-green-500">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Date de réalisation</p>
                <p className="text-white">
                    {project.project_date ? new Date(project.project_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : "Non précisée"}
                </p>
              </div>
            </div>

            {/* CLIENT */}
            {project.client_name && (
              <div className="flex items-start gap-4">
                <div className="bg-green-500/10 p-2 rounded-lg text-green-500">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Client</p>
                  <p className="text-white">{project.client_name}</p>
                </div>
              </div>
            )}

            {/* SITE WEB */}
            {project.client_website && (
              <div className="pt-4 border-t border-zinc-800">
                <a 
                  href={project.client_website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-green-500 hover:text-white transition-all group"
                >
                  Visiter le site <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
            )}
          </div>

        </div>

        {/* SECTION AUTRE PROJET (Optionnel) */}
        <div className="mt-24 pt-12 border-t border-zinc-900">
            <p className="text-zinc-500 mb-4">Besoin d&apos;un projet similaire ?</p>
            <Link href="/contact" className="text-2xl font-bold hover:text-green-500 transition-colors">
                Travaillons ensemble sur votre prochaine vidéo →
            </Link>
        </div>

      </div>
    </main>
  );
}