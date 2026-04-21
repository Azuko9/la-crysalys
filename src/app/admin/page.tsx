import { createSupabaseServerClient } from "@/app/server";
import AdminDashboardClient from "./AdminDashboardClient";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Utilisation du client admin pour récupérer les messages (contourne RLS si besoin)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const { data: messages } = await supabaseAdmin
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminDashboardClient initialMessages={messages || []} userEmail={user.email || ""} />;
}