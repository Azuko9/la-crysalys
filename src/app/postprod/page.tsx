import { supabase } from "@/lib/supabaseClient";
import PostProdClientPage from "./PostProdClientPage";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post-Production - Montage, Étalonnage, VFX | La Crysalys',
  description: 'Notre studio de post-production donne vie à vos images. Services de montage vidéo, étalonnage colorimétrique, effets spéciaux (VFX) et mixage audio.',
};

async function getPostProdProjects() {
  const { data } = await supabase
    .from('portfolio_items')
    .select('*')
    .ilike('category', '%Post%') 
    .order('project_date', { ascending: false });
  return data || [];
}

async function getCategories() {
  const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
  return data || [];
}

export default async function PostProdPage() {
  const [initialProjects, initialCategories] = await Promise.all([
    getPostProdProjects(),
    getCategories()
  ]);

  return (
    <main className="min-h-screen bg-background text-white pb-24">
      <PostProdClientPage initialProjects={initialProjects} initialCategories={initialCategories} />
    </main>
  );
}