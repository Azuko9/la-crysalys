"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Menu, X } from "lucide-react"; // Icônes pour le mobile

const NAV_LINKS = [
  { name: "Expertise Drone", href: "/expertise" },
  { name: "Post-Productions", href: "/postprod" },
  { name: "Productions", href: "/realisations" },
  { name: "Nos Presta", href: "/prestation" },
  { name: "L'équipe", href: "/equipe" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // État du menu mobile

  useEffect(() => {
    // onAuthStateChange est appelé immédiatement avec la session en cours,
    // rendant un appel initial pour vérifier l'utilisateur redondant.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (pathname === "/") return null;

  return (
    <header className="fixed top-0 left-0 w-full z-[100] bg-background/90 backdrop-blur-md border-b border-zinc-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO - Taille adaptée pour mobile */}
          <Link href="/" className="relative h-12 w-32 md:h-16 md:w-48 hover:scale-105 transition flex-shrink-0" aria-label="Retour à l'accueil">
             <Image
              src="/Logo/logoAfficheBlanc.png"
              alt="Logo Crysalys"
              fill
              className="object-contain" // Garde les proportions sans couper l'image
              sizes="(max-width: 768px) 128px, 192px"
              priority
            />
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex space-x-8 items-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-bold transition-colors ${
                  pathname.startsWith(link.href) ? "text-primary" : "text-zinc-300 hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {isLoggedIn && (
              <Link href="/admin" className="px-3 py-1 border border-primary bg-primary/10 text-primary rounded-dynamic text-xs font-bold hover:bg-primary hover:text-black transition">
                  Admin
              </Link>
            )}
          </nav>

          {/* BOUTON HAMBURGER (Mobile uniquement) */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2 hover:bg-zinc-800 rounded-lg transition"
              aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      {/* MENU MOBILE OVERLAY */}
      {/* Le menu est rendu en dehors du conteneur principal pour s'étendre sur toute la largeur */}
      <div className={`md:hidden absolute top-20 left-0 w-full bg-card/95 backdrop-blur-xl border-b border-zinc-800 transition-all duration-300 ease-in-out ${
        isOpen ? "opacity-100 visible h-auto pb-8" : "opacity-0 invisible h-0"
      }`}>
        <nav className="flex flex-col px-6 pt-4 space-y-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-xl font-black uppercase italic tracking-tighter ${
                pathname === link.href ? "text-primary" : "text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          {isLoggedIn && (
            <Link 
              href="/admin" 
              className="mt-4 p-4 border border-primary bg-primary/10 text-primary rounded-dynamic text-center font-black uppercase italic"
            >
                Espace Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}