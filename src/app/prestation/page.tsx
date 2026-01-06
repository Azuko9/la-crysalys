"use client";

import Link from "next/link";
import { ArrowLeft, Check, Star } from "lucide-react"; // J'ajoute des icônes pour le style

export default function Prestation() {
  return (
    <main className="min-h-screen bg-background text-white px-8 pb-8 pt-8">
      
      {/* --- HEADER --- */}
      <div className="max-w-6xl mx-auto mb-16 pt-20">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Nos Prestations
        </h1>
        <h2 className="text-xl text-gray-300">
          Laissez éclore votre imagination avec La Crysalys
        </h2>
        <p className="mt-4 text-gray-400 max-w-2xl">
          Écriture, Réalisation, Tournage (Sol & Drone), Montage, VFX et Motion Design. 
          Nous adaptons nos moyens techniques à votre histoire.
        </p>
      </div>
            {/* --- CTA --- */}
      <div className="max-w-4xl mx-auto text-center bg-gray-900 p-4 m-12 rounded-dynamic border border-gray-800">
        <h3 className="text-2xl font-bold text-white mb-4">Un projet sur mesure ?</h3>
        <p className="text-gray-400 mb-8">
          Nous nous adaptons à votre budget et vos exigences spécifiques (Drone FPV, Événementiel, Clip...).
        </p>
        <Link 
          href="/contact" 
          className="bg-primary hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-105 inline-block"
        >
          Demander un Devis
        </Link>
      </div>


      {/* --- SECTION 1 : PUBLICITÉ --- */}
      <section className="max-w-6xl mx-auto mb-20">
        <h3 className="text-3xl font-bold text-white mb-8 border-l-4 border-primary pl-4">
          Publicité
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* PACK SILVER */}
          <div className="bg-gray-900 rounded-dynamic p-8 border border-gray-800 flex flex-col hover:border-gray-600 transition">
            <div className="bg-gray-500 text-black font-bold text-center py-2 rounded mb-6 w-32 uppercase text-sm tracking-wider">
              Pack Silver
            </div>
            {/*<div className="text-4xl font-bold text-white mb-2">850 €</div>*/}
            <p className="text-gray-400 mb-6 italic">1/2 journée tournage + 2 jours montage</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start"><Check className="text-primary mr-2 shrink-0" size={18} /> Captation live & mise en scène</li>
              <li className="flex items-start"><Check className="text-primary mr-2 shrink-0" size={18} /> Rédactionnel + Cahier des charges</li>
              <li className="flex items-start"><Check className="text-primary mr-2 shrink-0" size={18} /> Montage image + son + titrages</li>
              <li className="flex items-start"><Check className="text-primary mr-2 shrink-0" size={18} /> Format court &lt; 1 minute (HD)</li>
            </ul>
            
            <div className="bg-gray-800 p-4 rounded text-sm text-gray-300">
              <span className="font-bold text-green-400">Options :</span> Motion Design (300€/j) | Voix off (50€)
            </div>
          </div>

          {/* PACK GOLD (Mis en avant) */}
          <div className="bg-gray-900 rounded-dynamic p-8 border-2 border-yellow-500 relative flex flex-col shadow-[0_0_30px_rgba(234,179,8,0.1)]">
            <div className="absolute top-0 right-0 bg-yellow-500 text-black font-bold px-4 py-1 rounded-bl-xl text-xs">
              RECOMMANDÉ
            </div>
            <div className="bg-yellow-500 text-black font-bold text-center py-2 rounded mb-6 w-32 uppercase text-sm tracking-wider flex items-center justify-center gap-2">
               Pack Gold <Star size={14} fill="black" />
            </div>
            {/*<div className="text-4xl font-bold text-white mb-2">1 600 €</div>*/}
            <p className="text-gray-400 mb-6 italic">2 demi-journées tournage + 3 jours montage</p> 
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start"><Check className="text-yellow-500 mr-2 shrink-0" size={18} /> Tout du Pack Silver</li>
              <li className="flex items-start"><Check className="text-yellow-500 mr-2 shrink-0" size={18} /> Scénario + Découpage technique</li>
              <li className="flex items-start"><Check className="text-yellow-500 mr-2 shrink-0" size={18} /> <strong>Montage Avancé</strong> (VFX, 3D, Transitions)</li>
              <li className="flex items-start"><Check className="text-yellow-500 mr-2 shrink-0" size={18} /> Motion Design & Bruitages inclus</li>
              <li className="flex items-start"><Check className="text-yellow-500 mr-2 shrink-0" size={18} /> Format 1 à 2 minutes (HD)</li>
            </ul>

            <div className="bg-gray-800 p-4 rounded text-sm text-gray-300">
               <span className="font-bold text-yellow-500">Inclus :</span> Motion Design avancé
            </div>
          </div>

        </div>
      </section>

      {/* --- SECTION 2 : INSTITUTIONNEL --- */}
      <section className="max-w-6xl mx-auto mb-20">
        <h3 className="text-3xl font-bold text-white mb-8 border-l-4 border-blue-500 pl-4">
          Institutionnel & Corporate
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Carte Silver Corp */}
           <div className="bg-gray-900 rounded-dynamic p-8 border border-gray-800 hover:border-blue-500 transition">
              <div className="text-2xl font-bold mb-2 text-gray-300">Pack Silver</div>
              {/*<div className="text-3xl font-bold text-blue-400 mb-4">1 195 €</div>*/}
              <ul className="space-y-2 text-gray-400 mb-6">
                  <li>• 1 jour tournage + 3 jours montage</li>
                  <li>• Interviews + Scénario original</li>
                  <li>• Film 2 à 5 minutes</li>
              </ul>
           </div>

           {/* Carte Gold Corp */}
           <div className="bg-gray-900 rounded-dynamic p-8 border border-gray-800 hover:border-yellow-500 transition">
              <div className="text-2xl font-bold mb-2 text-yellow-500">Pack Gold</div>
              {/*<div className="text-3xl font-bold text-white mb-4">2 300 €</div>*/} 
              <ul className="space-y-2 text-gray-400 mb-6">
                  <li>• 2 jours tournage + 5 jours montage</li>
                  <li>• Scénario complet + Dialogues</li>
                  <li>• Motion Design, 3D, VFX avancés</li>
              </ul>
           </div>
        </div>
      </section>



    </main>
  );
}