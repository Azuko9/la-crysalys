import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'La Crysalys - Production Audiovisuelle & Création de Contenu Drone',
  description: 'La Crysalys transforme vos idées en expériences visuelles cinématographiques. Spécialistes en production vidéo, post-production et prises de vues par drone.',
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  // Définition des données structurées de ton agence pour Google (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService', // Type plus général pour les services
    'name': 'La Crysalys',
    'image': 'https://la-crysalys.vercel.app/og-image.jpg',
    '@id': 'https://la-crysalys.vercel.app/',
    'url': 'https://la-crysalys.vercel.app/',
    'telephone': '+33676130827',
    'priceRange': '€€', // Indique une gamme de prix moyenne
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': 'FR'
    },
    'description': 'Agence de production audiovisuelle spécialisée dans la création de contenu cinématographique, la post-production et les prises de vues par drone.',
    name: 'La Crysalys',
    'makesOffer': [ // Liste tes services principaux
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Production Vidéo' } },
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Prises de vues par Drone' } },
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Post-Production & VFX' } }
    ]
  };

  return (
    // 1. CONTENEUR PRINCIPAL : relative, h-screen pour prendre tout l'écran, overflow-hidden
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* INJECTION DU JSON-LD POUR LE SEO (Invisible pour les utilisateurs) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* --- 2. L'IMAGE DE FOND --- */}
      <Image
        src="/DSC_7249_.jpg"
        alt="La Crysalys - Production Audiovisuelle"
        fill
        priority
        className="object-cover object-center md:object-[50%_-100px] -z-20"
      />

      {/* --- 3. L'OVERLAY (COUCHÉ NOIRE SEMI-TRANSPARENTE) --- */}
      {/* Ajuste bg-background/50 (50% d'opacité) selon tes besoins : /30, /70... */}
      <div className="absolute top-0 left-0 w-full h-full bg-background/50 -z-10"></div>

      {/* --- 4. TON CONTENU (Texte, boutons...) --- */}
      {/* Important : relative et z-10 pour passer devant la photo et l'overlay */}
      <div className="relative z-10 max-w-5xl h-screen flex flex-col justify-between mx-auto text-center p-10 text-foreground [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">



        <h1 className=" text-3xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tighter">
          Capturez l&apos;instant.<br />
          <span className="text-primary">
            Sublimez votre histoire.
          </span>
        </h1>

        <div>
          <p className="text-xl text-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Nous transformons vos idées en expériences visuelles cinématographiques. Expertise drone, publicité et contenu corporate de haut vol.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              href="/realisations"
              className="bg-primary hover:bg-white/50 text-foreground font-bold py-4 px-8 rounded-dynamic flex items-center justify-center gap-3 transition transform hover:scale-105 text-lg shadow-lg"
            >
              Voir nos réalisations <ArrowRight />
            </Link>
            <Link
              href="/contact"
              className="bg-transparent hover:bg-white/10 text-foreground border-2 border-white font-bold py-4 px-8 rounded-dynamic transition transform hover:scale-105 text-lg flex items-center justify-center"
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