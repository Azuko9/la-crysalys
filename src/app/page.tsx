import Link from "next/link";
import { ArrowRight, Video } from "lucide-react";

export default function Home() {
  return (
    // 1. CONTENEUR PRINCIPAL : relative, h-screen pour prendre tout l'écran, overflow-hidden
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* --- 2. LA VIDÉO DE FOND --- */}
      <video
        autoPlay
        muted
        playsInline // Très important pour que ça marche sur iPhone/Safari
        className="absolute top-0 left-0 w-full h-full object-cover -z-20"
      >
        {/* Le chemin commence par / car le fichier est dans le dossier 'public' */}
        <source src="/background-video.mp4" type="video/mp4" />
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>

      {/* --- 3. L'OVERLAY (COUCHÉ NOIRE SEMI-TRANSPARENTE) --- */}
      {/* Ajuste bg-background/50 (50% d'opacité) selon tes besoins : /30, /70... */}
      <div className="absolute top-0 left-0 w-full h-full -z-10"></div>

      {/* --- 4. TON CONTENU (Texte, boutons...) --- */}
      {/* Important : relative et z-10 pour passer devant la vidéo et l'overlay */}
      <div className="relative z-10 max-w-5xl h-screen flex flex-col justify-between mx-auto text-center p-10 text-white">
        

        
<h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tighter">
  Capturez l'instant.<br />
  <span 
    className="text-transparent bg-clip-text bg-gradient-to-r"
    style={{ 
      backgroundImage: `linear-gradient(to right, var(--primary-color), #ffffff55)` 
    }}
  >
    Sublimez votre histoire.
  </span>
</h1>

        <div>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Nous transformons vos idées en expériences visuelles cinématographiques. Expertise drone, publicité et contenu corporate de haut vol.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link 
            href="/realisations" 
            className="bg-primary hover:bg-white/50 text-white font-bold py-4 px-8 rounded-dynamic flex items-center justify-center gap-3 transition transform hover:scale-105 text-lg shadow-lg"
          >
            Voir nos réalisations <ArrowRight />
          </Link>
          <Link 
            href="/contact" 
            className="bg-transparent hover:bg-white/10 text-white border-2 border-white font-bold py-4 px-8 rounded-dynamic transition transform hover:scale-105 text-lg flex items-center justify-center"
          >
            Demander un devis
          </Link>
        </div>
        </div>
        

      </div>

      {/* Petit dégradé en bas pour une transition douce si tu as du contenu en dessous */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-0"></div>
    </main>
  );
}