import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/server";
import { createClient } from "@supabase/supabase-js";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. On récupère la session via le client serveur standard
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Si l'utilisateur n'est pas connecté, retour au login
  if (!session) {
    redirect("/login");
  }

  // 2. On configure le client Admin pour outrepasser les RLS si nécessaire
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 3. On vérifie le rôle de l'utilisateur dans la table profiles
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  // S'il n'y a pas de profil ou que le rôle n'est pas admin, on l'éjecte
  if (!profile || profile.role !== "admin") {
    redirect("/"); // On le renvoie à l'accueil (ou vers une page 403 / un-authorized)
  }

  // S'il est admin, on affiche le contenu de l'interface d'administration
  return <>{children}</>;
}