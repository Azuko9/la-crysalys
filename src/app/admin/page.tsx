"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Mail, Trash2, Calendar, User } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessagesRecus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. VÉRIFICATION CONNEXION + CHARGEMENT MESSAGES
  useEffect(() => {
    const init = async () => {
      // A. Est-ce que je suis connecté ?
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login"); // Si non, ouste !
        return;
      }
      setUser(user);
      
      // B. Je récupère les messages
      fetchMessages();
    };
    init();
  }, [router]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMessagesRecus(data);
    setLoading(false);
  };

  // 2. SUPPRESSION MESSAGE
  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Voulez-vous supprimer ce message définitivement ?")) return;
    
    const { error } = await supabase.from('messages').delete().eq('id', id);
    
    if (!error) {
      // On met à jour la liste sans recharger la page
      setMessagesRecus(messages.filter(msg => msg.id !== id));
      alert("Message supprimé.");
    } else {
      console.error(error);
      alert("Erreur lors de la suppression.");
    }
  };

  // 3. DÉCONNEXION
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) return <div className="min-h-screen bg-black"></div>;

  return (
    <main className="min-h-screen bg-black text-white px-8 pb-8 pt-28">
      
      {/* HEADER DE LA PAGE ADMIN */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-800 pb-6 gap-4">
        
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-green-500" size={32} />
          <div>
            <h1 className="text-3xl font-bold">Messagerie Admin</h1>
            <p className="text-gray-400 text-sm">Connecté en tant que {user.email}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 transition transform hover:scale-105 shadow-lg shadow-red-900/20"
        >
          <LogOut size={20} /> 
          Se déconnecter
        </button>

      </div>

      {/* LISTE DES MESSAGES */}
      <div className="max-w-4xl mx-auto">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Mail className="text-green-500" /> 
              Boîte de réception ({messages.length})
           </h2>
           
           {loading ? (
             <p className="text-gray-500 animate-pulse">Chargement des messages...</p>
           ) : messages.length === 0 ? (
             <div className="text-gray-500 italic p-8 bg-gray-900 rounded-xl text-center border border-gray-800">
                Votre boîte est vide. Tout est calme. 🍃
             </div>
           ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-gray-900 border border-gray-800 p-6 rounded-xl relative group hover:border-gray-600 transition shadow-lg">
                    
                    {/* Bouton Supprimer (Poubelle) */}
                    <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="absolute top-4 right-4 text-gray-600 hover:text-red-500 p-2 bg-black/20 rounded-full transition hover:bg-black/50"
                        title="Supprimer ce message"
                    >
                        <Trash2 size={18} />
                    </button>

                    {/* En-tête du message */}
                    <div className="mb-2 pr-10">
                        <h3 className="font-bold text-lg text-white">{msg.objet}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-1">
                          <span className="flex items-center gap-1"><User size={14} /> {msg.nom}</span>
                          <span className="hidden md:inline">•</span>
                          {/* Date et Heure précises */}
                          <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(msg.created_at).toLocaleString('fr-FR')}</span>
                        </div>
                    </div>

                    {/* Corps du message */}
                    <p className="text-gray-300 text-sm mb-4 bg-black/30 p-4 rounded-lg whitespace-pre-wrap border border-gray-800/50">
                      {msg.message}
                    </p>

                    {/* Lien de réponse */}
                    <a 
                      href={`mailto:${msg.email}`} 
                      className="inline-flex items-center text-sm font-bold text-green-400 hover:text-white transition gap-2"
                    >
                      <Mail size={14} /> Répondre à {msg.email}
                    </a>
                  </div>
                ))}
              </div>
           )}
      </div>
    </main>
  );
}