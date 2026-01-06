// app/layout.tsx (Server Component)
import { supabase } from "@/lib/supabaseClient";
import "./globals.css";
import Header from "@/components/Header";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Récupération de tous les réglages
  const { data: settings } = await supabase.from("site_settings").select("*");

  // 2. Transformation en objet avec valeurs par défaut de secours
  const theme = {
    bg_color: settings?.find(s => s.key === "bg_color")?.value || "#000000",
    primary_color: settings?.find(s => s.key === "primary_color")?.value || "#22c55e",
    accent_color: settings?.find(s => s.key === "accent_color")?.value || "#3b82f6",
    // AJOUTS POUR LA VERSION AVANCÉE
    border_radius: settings?.find(s => s.key === "border_radius")?.value || "0px",
    border_opacity: settings?.find(s => s.key === "border_opacity")?.value || "0.2",
  };

  return (
    <html lang="fr">
      <head>
        {/* 3. Injection des variables CSS pour tout le site */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --bg-color: ${theme.bg_color};
            --primary-color: ${theme.primary_color};
            --accent-color: ${theme.accent_color};
            --radius: ${theme.border_radius};
            --border-opacity: ${theme.border_opacity};
          }

          /* On force le fond sur le body pour éviter le flash blanc */
          body { 
            background-color: var(--bg-color) !important; 
          }

          /* Gestion dynamique des arrondis sur les éléments qui utilisent 'rounded-dynamic' */
          .rounded-dynamic {
            border-radius: var(--radius) !important;
          }

          /* On applique l'opacité variable sur les bordures par défaut (zinc-800) */
          .border-zinc-800 {
            border-color: rgba(255, 255, 255, var(--border-opacity)) !important;
          }
        `}} />
      </head>
      {/* On utilise bg-background définie dans tailwind.config.ts */}
      <body className="bg-background text-white antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}