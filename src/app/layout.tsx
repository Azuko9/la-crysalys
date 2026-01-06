// app/layout.tsx
import { supabase } from "@/lib/supabaseClient";
import "./globals.css";
import Header from "@/components/Header";

// FORCE LE RENDU DYNAMIQUE (Désactive le cache de page)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Récupération des données sans cache
  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value");

  const getS = (key: string, def: string) => settings?.find(s => s.key === key)?.value || def;

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
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
                  --bg-color: ${theme.bg_color};
                  --primary-color: ${theme.primary_color};
                  --radius: ${theme.border_radius};
                  --border-opacity: ${theme.border_opacity};
          }
          body { background-color: var(--bg-color) !important; }
        `}} />
      </head>
      <body className="bg-background text-white antialiased">
        <Header />
        {children}
      </body>
    </html>
  );


}