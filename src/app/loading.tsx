import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Loading() {
  // Ce composant s'affichera automatiquement pendant que les pages serveur se chargent.
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center w-full">
      <div className="flex flex-col items-center gap-8">
        
        {/* Le Logo avec animation de pulsation */}
        <div className="relative w-24 h-24 animate-pulse">
          <Image 
            src="/Logo/logo_v_blanc.png" 
            alt="La Crysalys Logo" 
            fill 
            className="object-contain"
          />
        </div>

        {/* Le spinner et le texte */}
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 animate-pulse">
            Chargement...
          </p>
        </div>

      </div>
    </div>
  );
}