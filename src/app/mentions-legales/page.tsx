import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions Légales - La Crysalys',
  description: 'Consultez les mentions légales de La Crysalys, incluant les informations sur l\'éditeur du site, l\'hébergement et la propriété intellectuelle.',
  openGraph: {
    title: 'Mentions Légales - La Crysalys',
    description: 'Consultez les mentions légales de La Crysalys, incluant les informations sur l\'éditeur du site, l\'hébergement et la propriété intellectuelle.',
    url: 'https://la-crysalys.vercel.app/mentions-legales',
  },
  alternates: {
    canonical: '/mentions-legales',
  },
};

export default function MentionsLegales() {
  return (
    <div className="min-h-screen w-full bg-zinc-950 pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Titre */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground">
            Mentions <span className="text-primary">Légales</span>
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Contenu */}
        <div className="space-y-8 text-foreground/70 leading-relaxed">
          
          <section className="bg-card p-8 rounded-dynamic border border-zinc-800">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="text-primary">1.</span> Édition du site
            </h2>
            <p className="mb-4">
              En vertu de l&apos;article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique, il est précisé aux utilisateurs du site internet <strong>https://la-crysalys.vercel.app/</strong> l&apos;identité des différents intervenants dans le cadre de sa réalisation et de son suivi :
            </p>
            {/* IMPORTANT: Vous devez remplacer les informations ci-dessous par les vôtres. */}
            <ul className="space-y-2 list-disc pl-5">
              <li><strong>Propriétaire :</strong> CRYSALYS PRODUCTION</li>
              <li><strong>Adresse :</strong> 1 LOT OLASOGARAIA , 64240 HASPARREN</li>
              <li><strong>Contact :</strong> Crysalys_production@outlook.fr- 06 76 13 08 27</li>
              <li><strong>Identification :</strong> SIRET : 95314312000012</li>
              <li><strong>Site créé par :</strong>  Jean-Luc CAZALAA-ARRIBES</li>
            </ul>
          </section>

          <section className="bg-card p-8 rounded-dynamic border border-zinc-800">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="text-primary">2.</span> Hébergement
            </h2>
            <p>
              Le site est hébergé par la société <strong>Vercel Inc.</strong><br />
              Adresse : 340 S Lemon Ave #4133 Walnut, CA 91789, USA<br />
              <span className="text-xs italic opacity-70">Les données sont stockées sur des serveurs sécurisés.</span>
            
            </p>
          </section>

          <section className="bg-card p-8 rounded-dynamic border border-zinc-800">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="text-primary">3.</span> Propriété intellectuelle
            </h2>
            <p>
              <strong>La Crysalys</strong> est propriétaire des droits de propriété intellectuelle et détient les droits d’usage sur tous les éléments accessibles sur le site internet, notamment les textes, images, graphismes, logos, vidéos, architecture, icônes et sons.
              <br /><br />
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}