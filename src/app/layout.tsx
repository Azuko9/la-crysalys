// app/layout.tsx
import { supabase } from "@/lib/supabaseClient";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    card_bg: getS("card_bg", "#18181b"),
    border_radius: settings?.find(s => s.key === "border_radius")?.value || "0px",
   
  };

  return (
<html lang="fr">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --bg-color: ${theme.bg_color};
            --primary-color: ${theme.primary_color};
            --radius: ${theme.border_radius};
            --card-bg: ${theme.card_bg};
          }

          body { background-color: var(--bg-color) !important; }

          /* On force le changement de couleur sur tous tes blocs zinc-900/zinc-950 */
          .bg-zinc-900, .bg-zinc-900\/20, .bg-zinc-900\/40, .bg-card-dynamic {
            background-color: var(--card-bg) !important;
          }

          .rounded-dynamic { border-radius: var(--radius) !important; }
        `}} />
      </head>
      <body className="bg-background text-white antialiased">
        <Header/>
        {children}
        <Footer/>
      </body>
    </html>
  );


}