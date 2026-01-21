import { createBrowserClient } from '@supabase/ssr'

// Ce fichier crée un client Supabase pour le NAVIGATEUR (côté client).
// Il ne doit utiliser que des clés PUBLIQUES.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // N'utilisez JAMAIS votre clé de service (service_role) côté client.
  // Utilisez toujours la clé anonyme (anon key) publique, qui doit être préfixée par NEXT_PUBLIC_ dans votre .env.local
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)