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
    bg: getS("bg_color", "#000000"),
    primary: getS("primary_color", "#a23939"),
    radius: getS("border_radius", "10px"),
    opacity: getS("border_opacity", "0.2"),
  };

  return (
    <html lang="fr">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --bg-color: ${theme.bg};
            --primary-color: ${theme.primary};
            --radius: ${theme.radius};
            --border-opacity: ${theme.opacity};
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