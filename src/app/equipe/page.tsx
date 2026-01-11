"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Users, Info, Pencil, Trash2, Instagram, Linkedin, Mail, 
  Camera, ChevronRight, PlusCircle, Handshake, Globe 
} from "lucide-react";
import TeamModal from "@/components/TeamModal"; 

export default function TeamPage() {
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États Admin
  const [user, setUser] = useState<any>(null);
  
  // États Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<any>(null);
  const [modalDefaultType, setModalDefaultType] = useState<'team' | 'partner'>('team');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      fetchMembers();
    };
    init();
  }, []);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: true });
    setAllMembers(data || []);
    setLoading(false);
  };

  const handleCreate = (type: 'team' | 'partner') => {
    setMemberToEdit(null);
    setModalDefaultType(type); // Définit quel onglet ouvrir par défaut
    setIsFormOpen(true);   
  };

  const handleEdit = (member: any) => {
    setMemberToEdit(member); 
    setIsFormOpen(true);     
  };

  // Séparation des listes
  const teamList = allMembers.filter(m => m.member_type === 'team' || !m.member_type);
  const partnerList = allMembers.filter(m => m.member_type === 'partner');

  return (
    <main className="min-h-screen bg-background text-white pb-24">
      
      {/* --- HEADER --- */}
      <section className="pt-32 pb-16 px-4 md:px-8 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-start mb-20">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] w-12 bg-primary"></div>
                <span className="text-primary font-black uppercase text-[10px] tracking-[0.4em]">Nos Talents</span>
              </div>
              <h1 className="text-7xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.75] mb-12 text-outline-black">
                Creative<br/><span className="text-primary">Minds.</span>
              </h1>
              <div className="bg-card border border-zinc-800 p-6 rounded-dynamic inline-flex items-center gap-4">
                <div className="w-3 h-3 rounded-dynamic bg-primary animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest">Passion • Créativité • Technique</span>
              </div>
            </div>

            <div className="w-full lg:w-96 space-y-4">
               <div className="p-6 bg-card/40 border border-zinc-800 rounded-dynamic backdrop-blur-md">
                  <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-6 tracking-widest flex items-center gap-2">
                    <Info size={14}/> L'Agence
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed font-medium mb-4">
                    Une équipe hybride réunissant pilotes certifiés, réalisateurs et motion designers, accompagnés de partenaires techniques de pointe.
                  </p>
               </div>
               <button onClick={() => window.location.href='/contact'} className="group w-full bg-primary hover:bg-white text-black py-5 rounded-dynamic font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                 Nous contacter <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 1 : L'ÉQUIPE
      ========================================================== */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mt-24">
        
        {/* TITRE ÉQUIPE */}
        <div className="mb-16 border-b border-zinc-800 pb-8">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-4">
              L'Équipe<span className="text-primary">.</span>
            </h2>
            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest">
                <Users size={16}/> Nos Experts
            </div>
        </div>

        {/* Bouton Ajouter Équipe (Admin) */}
        {user && (
          <div className="mb-16">
            <button onClick={() => handleCreate('team')} className="w-full py-10 border-2 border-dashed border-zinc-800 hover:border-primary rounded-dynamic text-zinc-500 hover:text-primary transition-all font-bold uppercase tracking-widest flex items-center justify-center gap-4 text-xs group">
              <div className="p-2 bg-zinc-900 rounded-full group-hover:bg-primary group-hover:text-black transition-colors"><PlusCircle size={20}/></div>
              Ajouter un membre à l'équipe
            </button>
          </div>
        )}
        
        <div className="flex flex-col gap-24">
          {teamList.length > 0 ? (
            teamList.map((member, index) => (
              <TeamMemberRow 
                key={member.id} 
                member={member}
                user={user}
                onEdit={() => handleEdit(member)} 
                fetchMembers={fetchMembers}
                index={index}
                isPartner={false}
              />
            ))
          ) : (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-dynamic">
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">L'équipe est vide pour le moment.</p>
            </div>
          )}
        </div>
      </section>


      {/* =========================================================
          SECTION 2 : LES PARTENAIRES
      ========================================================== */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mt-32 mb-24 pt-12 border-t border-zinc-900">
        
        {/* TITRE PARTENAIRES */}
        <div className="mb-16 border-b border-zinc-800 pb-8">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-4">
              Partenaires<span className="text-primary">.</span>
            </h2>
            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest">
                <Handshake size={16}/> Studios & Collaborateurs
            </div>
        </div>

        {/* Bouton Ajouter Partenaire (Admin) */}
        {user && (
          <div className="mb-16">
            <button onClick={() => handleCreate('partner')} className="w-full py-10 border-2 border-dashed border-zinc-800 hover:border-primary rounded-dynamic text-zinc-500 hover:text-primary transition-all font-bold uppercase tracking-widest flex items-center justify-center gap-4 text-xs group">
              <div className="p-2 bg-zinc-900 rounded-full group-hover:bg-primary group-hover:text-black transition-colors"><PlusCircle size={20}/></div>
              Ajouter un partenaire
            </button>
          </div>
        )}

        <div className="flex flex-col gap-16">
           {partnerList.length > 0 ? (
            partnerList.map((member, index) => (
              <TeamMemberRow 
                key={member.id} 
                member={member}
                user={user}
                onEdit={() => handleEdit(member)} 
                fetchMembers={fetchMembers}
                index={index}
                isPartner={true}
              />
            ))
          ) : (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-dynamic">
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Aucun partenaire listé.</p>
            </div>
          )}
        </div>
      </section>

      {/* MODAL (Invisible par défaut) */}
      {isFormOpen && (
        <TeamModal 
            isOpen={isFormOpen}
            member={memberToEdit}
            onClose={() => setIsFormOpen(false)}
            onSuccess={() => { setIsFormOpen(false); fetchMembers(); }}
            defaultType={modalDefaultType}
        />
      )}

    </main>
  );
}

// --------------------------------------------------------
// SOUS-COMPOSANT ROW (DESIGN UNIFIÉ + INFOS SUPPLÉMENTAIRES)
// --------------------------------------------------------

function TeamMemberRow({ member, user, onEdit, fetchMembers, index, isPartner }: { member: any, user: any, onEdit: () => void, fetchMembers: () => void, index: number, isPartner: boolean }) {
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Supprimer ${member.name} ?`)) {
      const { error } = await supabase.from('team_members').delete().eq('id', member.id);
      if (!error) fetchMembers();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 items-center group bg-card border border-zinc-800 p-6 rounded-dynamic shadow-2xl hover:border-primary/30 transition-colors">
      
      {/* 1. COLONNE GAUCHE : INFOS */}
      <div className="w-full lg:w-6/12 flex flex-col gap-6 order-2 lg:order-1">
        
        {/* En-tête : Index + Rôle */}
        <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">0{index + 1}</span>
            <div className="h-[1px] flex-1 bg-primary"></div>
            <span className="text-[9px] font-bold uppercase tracking-widest border border-primary px-3 py-1 rounded bg-primary/10 text-primary flex items-center gap-2">
                {isPartner ? <Handshake size={10}/> : <Camera size={10}/>} {member.role}
            </span>
        </div>

        {/* Bloc Nom + Société */}
        <div>
            <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-[0.9] text-white group-hover:text-primary transition-all">
                {member.name}
            </h3>
            {/* Affichage de la Société juste en dessous */}
            {member.company && (
                <div className="mt-2 text-primary font-bold uppercase text-sm tracking-widest flex items-center gap-2 opacity-80">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    {member.company}
                </div>
            )}
        </div>

        {/* Bio */}
        <div className="border-l-2 border-primary pl-6 space-y-4">
           <p className="text-zinc-400 text-sm leading-relaxed font-medium whitespace-pre-wrap">
              {member.bio || "Description non disponible."}
           </p>
        </div>

        {/* Réseaux Sociaux & Contact */}
        <div className="flex flex-wrap gap-4 mt-2 border-t border-zinc-800 pt-6">
            
            {/* EMAIL */}
            {member.email && (
                <a href={`mailto:${member.email}`} className="h-10 px-4 bg-zinc-900 border border-zinc-800 rounded-dynamic flex items-center justify-center text-zinc-500 hover:text-primary hover:border-primary hover:bg-primary/10 transition-all gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <Mail size={14}/> Email
                </a>
            )}

            {/* SITE WEB */}
            {member.website && (
                <a href={member.website} target="_blank" rel="noreferrer" className="h-10 px-4 bg-zinc-900 border border-zinc-800 rounded-dynamic flex items-center justify-center text-zinc-500 hover:text-primary hover:border-primary hover:bg-primary/10 transition-all gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <Globe size={14}/> Site
                </a>
            )}

            {/* INSTAGRAM */}
            {member.instagram && (
                <a href={member.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-dynamic flex items-center justify-center text-zinc-500 hover:text-primary hover:border-primary hover:bg-primary/10 transition-all">
                    <Instagram size={16}/>
                </a>
            )}

            {/* LINKEDIN */}
            {member.linkedin && (
                <a href={member.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-dynamic flex items-center justify-center text-zinc-500 hover:text-primary hover:border-primary hover:bg-primary/10 transition-all">
                    <Linkedin size={16}/>
                </a>
            )}
        </div>
      </div>

      {/* 2. COLONNE DROITE : PHOTO (DESIGN PORTRAIT UNIFIÉ) */}
      <div className="w-full lg:w-6/12 order-1 lg:order-2 relative flex justify-center lg:justify-end">
         
         <div className="relative w-full max-w-md aspect-[3/4] rounded-dynamic overflow-hidden border border-zinc-800 transition-all shadow-2xl bg-zinc-900 group-hover:border-primary/50">
            <img 
                src={member.photo_url || "https://via.placeholder.com/400x600?text=No+Photo"} 
                alt={member.name}
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-out transform group-hover:scale-105"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Boutons Admin */}
            {user && (
            <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="bg-blue-600 hover:bg-blue-500 p-3 rounded-lg text-white shadow-lg backdrop-blur-md"><Pencil size={16}/></button>
                <button onClick={handleDelete} className="bg-red-600 hover:bg-red-500 p-3 rounded-lg text-white shadow-lg backdrop-blur-md"><Trash2 size={16}/></button>
            </div>
            )}
         </div>

         {/* Élément décoratif arrière-plan */}
         <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full border border-zinc-800 rounded-dynamic hidden md:block"></div>
      </div>

    </div>
  );
}