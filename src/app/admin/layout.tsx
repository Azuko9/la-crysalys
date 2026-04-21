import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/server";
import { createClient } from "@supabase/supabase-js";

// Force le rendu dynamique pour toute la section administration.
// Cela désactive complètement le cache "Full Route Cache" de Next.js pour ces pages,
// garantissant que l'admin voit toujours les données en temps réel de la BDD.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. On récupère la session via le client serveur standard
  const supabase = createSupabaseServerClient();
  // getUser() est plus sécurisé sur le serveur car il valide systématiquement le token auprès de Supabase
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // Si l'utilisateur n'est pas connecté, retour au login
  if (authError || !user) {
    redirect("/login");
  }

  // 2. On configure le client Admin pour outrepasser les RLS si nécessaire
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-8 text-center">
        <div className="bg-red-900/20 border border-red-500 p-8 rounded-xl max-w-lg">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Erreur de Configuration</h1>
          <p className="mb-4">Les clés Supabase (URL ou SERVICE_ROLE) sont introuvables sur Vercel.</p>
          <p className="text-sm opacity-80">Veuillez vérifier vos <strong>Environment Variables</strong> dans les paramètres Vercel et surtout, <strong>relancez un déploiement (Redeploy)</strong> pour qu'elles soient appliquées.</p>
        </div>
      </div>
    );
  }

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
    .eq("id", user.id)
    .single();

  // S'il n'y a pas de profil ou que le rôle n'est pas admin, on l'éjecte
  if (!profile || profile.role !== "admin") {
    redirect("/"); // On le renvoie à l'accueil (ou vers une page 403 / un-authorized)
  }

  // S'il est admin, on affiche le contenu de l'interface d'administration
  return <>{children}</>;
}