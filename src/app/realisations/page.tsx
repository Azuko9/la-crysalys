import { supabase } from "@/lib/supabaseClient";
import RealisationsClientPage from "./RealisationsClientPage";
import type { Metadata } from 'next';
import type { Project } from "./RealisationsClientPage";
import type { Category } from "@/components/CategoryManager";

export const metadata: Metadata = {
  title: 'Portfolio - Nos Réalisations | La Crysalys',
  description: 'Découvrez notre portfolio de productions audiovisuelles, incluant des projets drones, des films corporate, des publicités et des clips musicaux.',
};

async function getProjects(): Promise<Project[]> {
  const { data } = await supabase.from('portfolio_items').select('*').order('project_date', { ascending: false });
  return (data as Project[]) || [];
}

async function getCategories(): Promise<Category[]> {
  const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
  return (data as Category[]) || [];
}

export default async function RealisationsPage() {
  const [initialProjects, initialCategories] = await Promise.all([
    getProjects(),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-background text-white px-4 md:px-8 pb-20 pt-28">
      <RealisationsClientPage initialProjects={initialProjects} initialCategories={initialCategories} />
    </main>
  );
}