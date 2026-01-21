"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeID } from "@/lib/utils";
import { ImageCompareSlider } from "@/components/ImageCompareSlider";
import { Layers, Wind, User, Calendar, ArrowLeft, Globe, Tag } from "lucide-react";
import type { Project } from '@/types';
import type { User as SupabaseUser } from "@supabase/supabase-js";
import ProjectModal from '@/components/ProjectModal';

interface RealisationDetailClientProps {
  initialProject: Project;
}

export default function RealisationDetailClientPage({ initialProject }: RealisationDetailClientProps) {
    const [project, setProject] = useState(initialProject);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();
    }, []);

    const fetchProject = async () => {
        const { data, error } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('id', project.id)
            .single();

        if (error || !data) {
            console.error("Failed to refetch project");
            router.push('/realisations');
            return;
        }

        // Le parsing est maintenant fait côté serveur, mais on garde la logique ici au cas où.
        if (data.description_postprod && typeof data.description_postprod === 'string') {
            try {
                data.description_postprod = JSON.parse(data.description_postprod);
            } catch (e) {
                console.error('Failed to parse description_postprod:', e);
                data.description_postprod = null;
            }
        }
        setProject(data as Project);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleDeleteSuccess = () => {
        alert('Projet supprimé avec succès.');
        router.push('/realisations');
    };

    const handleModalSuccess = () => {
        closeModal();
        fetchProject(); // Rafraîchit les données du projet après modification
    };

    const videoId = getYouTubeID(project.youtube_url);
    const projectDate = project.project_date ? new Date(project.project_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date non spécifiée';

    return (
        <>
            <main className="min-h-screen bg-background text-white pt-32 pb-20">
                <div className="max-w-5xl mx-auto px-4">
                    
                    <div className="flex justify-between items-start mb-8">
                        <Link href="/realisations" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                            <ArrowLeft size={16} />
                            Retour au portfolio
                        </Link>


                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-4">{project.title}</h1>
                    </div>

                    {/* Fiche Technique Horizontale */}
                    <div className="bg-card border border-zinc-800 rounded-dynamic p-6 mb-12">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <p className="text-xs text-zinc-500 font-bold uppercase flex items-center gap-2 mb-1"><User size={14}/> Client</p>
                                <p className="font-semibold">{project.client_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-bold uppercase flex items-center gap-2 mb-1"><Calendar size={14}/> Date</p>
                                <p className="font-semibold">{projectDate}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-bold uppercase flex items-center gap-2 mb-1"><Globe size={14}/> Site Web</p>
                                {project.client_website ? (
                                    <a href={project.client_website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate font-semibold">{project.client_website.replace(/https?:\/\//, '')}</a>
                                ) : (
                                    <p className="font-semibold">N/A</p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-bold uppercase flex items-center gap-2 mb-1"><Tag size={14}/> Catégories</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {project.category.split(',').map((cat: string, i: number) => (
                                        <span key={i} className="text-[9px] bg-zinc-700 text-white px-2 py-1 rounded uppercase font-bold">{cat.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* YouTube Video */}
                    {videoId && (
                        <div className="aspect-video mb-12 rounded-dynamic overflow-hidden border border-zinc-800 shadow-2xl bg-black">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1&rel=0`}
                                title={project.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="border-0"
                            ></iframe>
                        </div>
                    )}

                    {/* Contenu principal en une seule colonne */}
                    <div className="space-y-12">
                            
                            {project.description && (
                                <div>
                                    <h2 className="text-2xl font-black text-primary mb-4 italic uppercase tracking-tighter">Contexte du Projet</h2>
                                    <div className="prose prose-invert prose-zinc max-w-none text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                        <p>{project.description}</p>
                                    </div>
                                </div>
                            )}

                            {/* SECTION POST-PRODUCTION MISE À JOUR */}
                            {(project.postprod_main_description || project.postprod_before_url || (Array.isArray(project.description_postprod) && project.description_postprod.length > 0)) && (
                                <div className="bg-card border border-zinc-800 p-6 rounded-dynamic">
                                    <h2 className="text-xl font-black text-purple-400 mb-4 flex items-center gap-2 italic uppercase tracking-tighter"><Layers size={20}/> Post-Production & VFX</h2>
                                    
                                    {project.postprod_main_description && (
                                        <div className="prose prose-invert prose-sm max-w-none text-purple-200/80 mb-6 whitespace-pre-wrap">
                                            <p>{project.postprod_main_description}</p>
                                        </div>
                                    )}

                                    {project.postprod_before_url && project.postprod_after_url && (
                                        <div className="mb-8">
                                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-3">Aperçu Global</p>
                                            <ImageCompareSlider 
                                                beforeImage={project.postprod_before_url}
                                                afterImage={project.postprod_after_url}
                                            />
                                        </div>
                                    )}

                                    {Array.isArray(project.description_postprod) && project.description_postprod.length > 0 && (
                                        <div className="space-y-8">
                                            {project.description_postprod.map((item, index) => (
                                                <div key={index} className="border-t border-zinc-700/50 pt-6">
                                                    <p className="text-white font-bold mb-4 text-lg"> #{index + 1}: <span className="text-purple-300">{item.detail}</span></p>
                                                    {item.before_url && item.after_url && (
                                                        <ImageCompareSlider 
                                                            beforeImage={item.before_url}
                                                            afterImage={item.after_url}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {project.description_drone && (
                                <div className="bg-card border border-zinc-800 p-6 rounded-dynamic">
                                    <h2 className="text-xl font-black text-blue-400 mb-4 flex items-center gap-2 italic uppercase tracking-tighter"><Wind size={20}/> Spécificités Drone</h2>
                                    <div className="prose prose-sm prose-invert prose-zinc max-w-none text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                        <p>{project.description_drone}</p>
                                    </div>
                                </div>
                            )}

                    </div>
                </div>
            </main>

            {isModalOpen && (
                <ProjectModal
                    isOpen={isModalOpen}
                    project={project} // On passe le projet actuel à la modale
                    categories={[]} // La modale devrait fetch ses propres catégories si besoin
                    onClose={closeModal}
                    onSuccess={handleModalSuccess}
                />
            )}
        </>
    );
}