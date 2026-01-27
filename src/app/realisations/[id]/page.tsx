import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/app/server";
import type { Metadata } from 'next';
import RealisationDetailClientPage from "./RealisationDetailClientPage";
import type { Project } from "@/types";

// Props type
type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createSupabaseServerClient();

  const { data: project } = await supabase
    .from('portfolio_items')
    .select('title, description')
    .eq('id', params.id)
    .single();

  if (!project) {
    return {
      title: 'Projet non trouvé',
      description: 'Ce projet est introuvable.',
    }
  }

  return {
    title: `${project.title} | La Crysalys`,
    description: project.description || `Détails du projet ${project.title} réalisé par La Crysalys.`,
  }
}

export default async function RealisationDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();

  // Optimisation : On récupère toutes les données nécessaires en une seule fois.
  const { data: projectData, error } = await supabase.from('portfolio_items').select('*').eq('id', params.id).single();

  if (error || !projectData) {
    notFound();
  }

  // Sécurité et Optimisation : On parse le JSON côté serveur, dans un bloc try-catch.
  // Le composant client recevra des données propres.
  if (projectData.description_postprod && typeof projectData.description_postprod === 'string') {
    try {
      projectData.description_postprod = JSON.parse(projectData.description_postprod);
    } catch (e) {
      console.error('Failed to parse description_postprod:', e);
      projectData.description_postprod = []; // Sécurisation en cas d'échec, un tableau vide est plus cohérent avec le schéma Zod
    }
  }

  // On passe le projet entièrement traité au composant client.
  return <RealisationDetailClientPage initialProject={projectData as Project} />;
}