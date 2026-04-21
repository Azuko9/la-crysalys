"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Tu pourrais relier ça à Sentry ou un autre outil de tracking ici
    console.error("Erreur critique interceptée :", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 text-center">
      <AlertTriangle size={64} className="text-red-500 mb-6 animate-pulse" />
      <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Oups, une turbulence !</h2>
      <p className="text-foreground/60 max-w-md mb-8 text-sm">
        Une erreur inattendue s'est produite lors du chargement de cette page. Nos drones de maintenance ont été avertis.
      </p>
      <div className="flex gap-4">
        <button onClick={() => reset()} className="bg-primary hover:bg-white text-black font-bold py-3 px-6 rounded-dynamic transition-colors flex items-center gap-2 text-sm"><RefreshCcw size={16}/> Réessayer</button>
        <Link href="/" className="bg-card border border-zinc-800 hover:border-zinc-600 text-foreground font-bold py-3 px-6 rounded-dynamic transition-colors text-sm">Retour à l'accueil</Link>
      </div>
    </div>
  );
}