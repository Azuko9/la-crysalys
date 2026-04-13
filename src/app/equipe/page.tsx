import { createSupabaseServerClient } from "@/app/server";
import TeamClientView from "./TeamClientView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'L\'Équipe - La Crysalys',
  description: 'Découvrez les talents et partenaires de La Crysalys.',
};

export default async function TeamPage() {
  const supabase = createSupabaseServerClient();
  
  // Récupération de l'utilisateur (pour les droits admin)
  const { data: { user } } = await supabase.auth.getUser();
  
  // Récupération des membres depuis le serveur
  const { data: members } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: true });

  // On délègue toute l'interface interactive au composant client
  // en lui passant les données déjà récupérées.
  return <TeamClientView initialMembers={members || []} user={user} />;
}