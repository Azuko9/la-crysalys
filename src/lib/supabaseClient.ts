// /src/lib/supabaseClient.ts

import { createBrowserClient } from '@supabase/ssr'

// Assurez-vous que vos variables d'environnement sont bien préfixées par NEXT_PUBLIC_
// pour être accessibles côté client.
const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Les variables d'environnement Supabase (URL et Anon Key) sont requises.");
}

// Crée un client Supabase pour le navigateur (côté client)
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);
