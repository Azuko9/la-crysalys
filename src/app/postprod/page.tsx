"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Plane, ShieldCheck, Video, Wind } from "lucide-react";

export default function ExpertiseDrone() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // On récupère UNIQUEMENT les vidéos de la catégorie "Drone"
  useEffect(() => {
    const fetchDroneVideos = async () => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('category', 'Drone') // <-- Le filtre magique
        .order('created_at', { ascending: false });

      if (error) console.log("Erreur:", error);
      else setVideos(data || []);
      
      setLoading(false);
    };

    fetchDroneVideos();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-8 pb-8 pt-8">
      
      {/* --- HEADER --- */}
      <div className="max-w-6xl mx-auto mb-16 pt-20">

        <h1 className="text-4xl md:text-5xl font-bold text-green-500 mb-4">
          Expertise Aérienne
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Prenez de la hauteur. Nos solutions de tournage par drone offrent des perspectives 
          cinématographiques uniques, dans le respect strict de la réglementation aérienne.
        </p>
      </div>

      {/* --- SECTION TECHNIQUE & SÉCURITÉ --- */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        
        {/* Carte 1 */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <ShieldCheck className="text-green-500 mb-4" size={32} />
          <h3 className="font-bold text-lg mb-2">Homologué DGAC</h3>
          <p className="text-sm text-gray-400">
            Télépilotes déclarés à la Direction Générale de l'Aviation Civile.
          </p>
        </div>

        {/* Carte 2 */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <Plane className="text-green-500 mb-4" size={32} />
          <h3 className="font-bold text-lg mb-2">Scénarios S1, S2, S3</h3>
          <p className="text-sm text-gray-400">
            Autorisations de vol en zone peuplée (ville) et hors agglomération.
          </p>
        </div>

        {/* Carte 3 */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <Video className="text-green-500 mb-4" size={32} />
          <h3 className="font-bold text-lg mb-2">Qualité Cinéma</h3>
          <p className="text-sm text-gray-400">
            Capteurs 4K / 5.2K RAW pour une image exploitable en post-production lourde.
          </p>
        </div>

        {/* Carte 4 */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <Wind className="text-green-500 mb-4" size={32} />
          <h3 className="font-bold text-lg mb-2">Vol FPV & Stabilisé</h3>
          <p className="text-sm text-gray-400">
            Du plan fluide et lent au vol dynamique et immersif en FPV (First Person View).
          </p>
        </div>
      </section>

      {/* --- GALERIE VIDÉOS DRONE --- */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 border-l-4 border-green-500 pl-4">
          Nos Vols Récents
        </h2>

        {loading ? (
          <p className="text-gray-500">Chargement des vols...</p>
        ) : videos.length === 0 ? (
          <div className="text-gray-500 italic p-8 bg-gray-900 rounded-xl">
            Aucune vidéo classée "Drone" pour le moment. Ajoutez-en via l'admin !
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videos.map((video) => {
              const videoId = getYouTubeID(video.youtube_url);
              return (
                <div key={video.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-green-500 transition">
                  <div className="relative aspect-video">
                    {videoId && (
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={video.title}
                        allowFullScreen
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{video.title}</h3>
                    <p className="text-sm text-gray-400 mt-2">{video.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </main>
  );
}