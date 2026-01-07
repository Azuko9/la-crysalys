"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // On importe Supabase

export default function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // État pour savoir si on est connecté

  // On écoute l'état de la connexion au chargement
  useEffect(() => {
    // 1. Vérification initiale
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user); // Si user existe, ça devient true, sinon false
    };
    checkUser();

    // 2. On s'abonne aux changements (Connexion / Déconnexion en direct)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    // Nettoyage de l'abonnement quand on quitte
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Si on est sur l'accueil, pas de Header
  if (pathname === "/") return null;

  const navLinks = [
    { name: "Expertise Drone", href: "/expertise"},
    { name: "Post-Productions", href: "/postprod" },
    { name: "Productions", href: "/realisations" },
    
    { name: "Nos Presta", href: "/prestation" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO */}
          <Link href="/" className="flex-shrink-0 relative w-48 h-48 hover:scale-105 transition">
             <Image
              src="/Logo/logoAfficheBlanc.png"
              alt="Logo Crysalys"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 200px"
              priority
            />
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isDrone = link.name === "Expertise Drone"; // On repère le lien Drone
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-bold transition-colors duration-300 ${
                    isActive 
                      ? "text-primary" // 1. Si la page est active : Vert (priorité absolue)
                      : isDrone
                        ? "text-gray-100 hover:text-white" // 2. Si c'est le lien Drone (et pas actif) 
                        : "text-gray-300 hover:text-white"    // 3. Pour tous les autres liens : Gris
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            {/* LIEN ADMIN (Visible seulement si connecté) */}
            {isLoggedIn && (
              <Link 
                href="/admin" 
                className="ml-4 px-3 py-1 border border-red-900 bg-red-900/20 text-red-500 rounded text-xs font-bold hover:bg-red-900 hover:text-white transition"
              >
                  Espace Admin
              </Link>
            )}
          </nav>

          {/* MENU MOBILE (Simple) */}
          <div className="md:hidden flex gap-4">
             {isLoggedIn && (
                <Link href="/admin" className="text-red-500 font-bold text-sm">Admin</Link>
             )}
             <Link href="/contact" className="text-primary font-bold text-sm">
                Contact
             </Link>
          </div>

        </div>
      </div>
    </header>
  );
}