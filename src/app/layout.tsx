// app/layout.tsx (Server Component)
import { supabase } from "@/lib/supabaseClient";
import "./globals.css";
import Header from "@/components/Header";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Récupération des réglages en une seule requête
  const { data: settings } = await supabase.from("site_settings").select("*");

  // 2. Transformation en objet pour un accès facile
  const theme = {
    bg_color: settings?.find(s => s.key === "bg_color")?.value || "#000000",
    primary_color: settings?.find(s => s.key === "primary_color")?.value || "#22c55e",
    accent_color: settings?.find(s => s.key === "accent_color")?.value || "#3b82f6",
  };

  return (
    <html lang="fr">
      <head>
        {/* 3. Injection CRITIQUE : Le script de style bloquant */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --bg-color: ${theme.bg_color};
            --primary-color: ${theme.primary_color};
            --accent-color: ${theme.accent_color};
          }
        `}} />
      </head>
      <body className="bg-background text-white antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}