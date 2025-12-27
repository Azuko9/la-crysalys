import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header"; // <--- IMPORT DU HEADER

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La Crysalys Production",
  description: "Production audiovisuelle et Expertise Drone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        
        {/* Le Header s'affiche ici (sauf sur l'accueil grâce à notre condition) */}
        <Header />
        
        {/* Le contenu de tes pages (Realisations, Contact...) s'affiche ici */}
        {children}
        
      </body>
    </html>
  );
}