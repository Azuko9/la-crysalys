// app/layout.tsx
import { createSupabaseServerClient } from "@/app/server";
import "./globals.css";
// Le module @vercel/speed-insights/next doit être installé via npm/yarn/pnpm
import { SpeedInsights } from "@vercel/speed-insights/next"; 
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

// Note: `revalidate = 0` force le rendu dynamique à chaque requête, désactivant le cache de page.
// Si vous souhaitez un rendu statique (pour de meilleures performances), supprimez cette ligne
// ou donnez-lui une valeur en secondes (ex: `revalidate = 60;` pour revalider toutes les 60 secondes).
export const revalidate = 3600; // Cache les pages pendant 1h. Les Server Actions les forceront à se rafraîchir instantanément via revalidatePath de toute façon.

export const metadata: Metadata = {
  metadataBase: new URL('https://la-crysalys.vercel.app'),
  title: {
    default: 'La Crysalys - Production Audiovisuelle',
    template: '%s | La Crysalys',
  },
  description: 'Production audiovisuelle, expertise drone et post-production de haut niveau. Nous transformons vos idées en expériences visuelles.',
  openGraph: {
    title: 'La Crysalys - Production Audiovisuelle',
    description: 'Production audiovisuelle, expertise drone et post-production de haut niveau. Nous transformons vos idées en expériences visuelles.',
    url: 'https://la-crysalys.vercel.app',
    siteName: 'La Crysalys',
    images: [
      {
        url: '/og-image.jpg', // Assurez-vous d'ajouter une image og-image.jpg dans le dossier public
        width: 1200,
        height: 630,
        alt: 'La Crysalys - Production Audiovisuelle',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Crysalys - Production Audiovisuelle',
    description: 'Production audiovisuelle, expertise drone et post-production de haut niveau.',
    images: ['/og-image.jpg'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  // Récupération des données sans cache
  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value");

  // SÉCURITÉ : Fonction de nettoyage pour prévenir les injections CSS (Stored XSS)
  // N'autorise que les caractères alphanumériques, #, %, ., ,, (, ), et les espaces
  const sanitizeCSS = (value: string | undefined, fallback: string) => {
    if (!value) return fallback;
    return /^[a-zA-Z0-9#(),.% \-]+$/.test(value) ? value : fallback;
  };

  const theme = {
    bg_color: sanitizeCSS(settings?.find(s => s.key === "bg_color")?.value, "#000000"),
    primary_color: sanitizeCSS(settings?.find(s => s.key === "primary_color")?.value, "#22c55e"),
    card_bg: sanitizeCSS(settings?.find(s => s.key === "card_bg")?.value, "#18181b"),
    border_radius: sanitizeCSS(settings?.find(s => s.key === "border_radius")?.value, "0px"),
    text_color: sanitizeCSS(settings?.find(s => s.key === "text_color")?.value, "#ffffff"),
  };

  return (
<html lang="fr" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --bg-color: ${theme.bg_color};
            --primary-color: ${theme.primary_color};
            --radius: ${theme.border_radius};
            --card-bg: ${theme.card_bg};
            --text-color: ${theme.text_color};
          }

          body { 
            background-color: var(--bg-color) !important; 
            color: var(--text-color) !important;
          }

          /* On force le changement de couleur sur tous tes blocs zinc-900/zinc-950 */
          .bg-zinc-900, .bg-zinc-900\/20, .bg-zinc-900\/40, .bg-card-dynamic {
            background-color: var(--card-bg) !important;
          }

          .rounded-dynamic { border-radius: var(--radius) !important; }
        `}} />
      </head>
      <body className="bg-background text-foreground antialiased">
        <Header/>
        {children}
        <SpeedInsights />
        <Footer/>
      </body>
    </html>
  );


}