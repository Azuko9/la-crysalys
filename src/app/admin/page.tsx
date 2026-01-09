"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  LogOut, LayoutDashboard, Mail, Trash2, 
  Calendar, User, Palette, MessageSquare, ExternalLink
} from "lucide-react";
import ThemeManager from "@/components/ThemeManager";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessagesRecus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"messages" | "design">("messages");

  // 1. INITIALISATION ET SÉCURITÉ
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      fetchMessages();
    };
    init();
  }, [router]);

  // 2. RÉCUPÉRATION DES MESSAGES
  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMessagesRecus(data);
    setLoading(false);
  };

  // 3. SUPPRESSION D'UN MESSAGE
  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Voulez-vous supprimer ce message définitivement ?")) return;
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (!error) {
      setMessagesRecus(messages.filter(msg => msg.id !== id));
    }
  };

  // 4. DÉCONNEXION
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) return <div className="min-h-screen bg-background"></div>;

  return (
    <main className="min-h-screen bg-background text-white px-4 md:px-8 pb-20 pt-28">
      
      {/* --- HEADER DU DASHBOARD --- */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 border-b border-zinc-800 pb-10 gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary/10 rounded-dynamic border border-primary/20">
            <LayoutDashboard className="text-primary" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Admin_Room</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Session active : {user.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* SÉLECTEUR D'ONGLETS BRUTALISTE */}
          <nav className="flex bg-card p-1 rounded-dynamic border border-zinc-800">
            <button 
              onClick={() => setActiveTab("messages")}
              className={`flex items-center gap-2 px-6 py-3 rounded-dynamic text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "messages" ? "bg-primary text-black" : "text-zinc-500 hover:text-white"
              }`}
            >
              <MessageSquare size={14} /> Messages
            </button>
            <button 
              onClick={() => setActiveTab("design")}
              className={`flex items-center gap-2 px-6 py-3 rounded-dynamic text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "design" ? "bg-primary text-black" : "text-zinc-500 hover:text-white"
              }`}
            >
              <Palette size={14} /> Design
            </button>
          </nav>

          <button 
            onClick={handleLogout}
            className="p-4 text-zinc-600 hover:text-red-500 transition-colors bg-card/50 rounded-dynamic border border-zinc-800"
            title="Quitter l'espace admin"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* --- CONTENU : DESIGN SYSTÈME --- */}
        {activeTab === "design" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ThemeManager />
          </div>
        )}

        {/* --- CONTENU : MESSAGERIE --- */}
        {activeTab === "messages" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black italic uppercase flex items-center gap-4">
                <div className="w-10 h-10 bg-primary flex items-center justify-center text-black">
                    <Mail size={20} />
                </div>
                InBox <span className="text-zinc-800 font-mono text-4xl">/ {messages.length}</span>
              </h2>
            </div>
            
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 bg-card/50 border border-zinc-800 animate-pulse rounded-dynamic" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-zinc-600 italic py-32 bg-card/10 rounded-dynamic text-center border border-zinc-800 border-dashed uppercase text-[10px] font-black tracking-[0.5em]">
                 No data available _ Tout est calme.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-card border border-zinc-800 p-8 rounded-dynamic relative group hover:border-primary transition-all duration-500">
                    
                    {/* Bouton supprimer discret */}
                    <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="absolute top-8 right-8 text-zinc-700 hover:text-red-500 transition-colors p-2"
                    >
                        <Trash2 size={20} />
                    </button>

                    <div className="mb-8 pr-12">
                        <div className="flex items-center gap-4 mb-4">
                           <span className="bg-zinc-800 text-zinc-400 text-[9px] font-black px-3 py-1 uppercase tracking-widest border border-zinc-700">
                             Reception_OK
                           </span>
                           <h3 className="font-black text-3xl uppercase italic tracking-tighter text-white">
                             {msg.objet || "Sans Objet"}
                           </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                          <span className="flex items-center gap-2 text-primary"><User size={14}/> {msg.nom}</span>
                          <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(msg.created_at).toLocaleString('fr-FR')}</span>
                        </div>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/30"></div>
                        <p className="text-zinc-400 text-lg leading-relaxed pl-8 py-2 whitespace-pre-wrap font-medium">
                          {msg.message}
                        </p>
                    </div>

                    <a 
                      href={`mailto:${msg.email}`} 
                      className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:text-white transition-all gap-4 group"
                    >
                      <div className="w-12 h-12 bg-card border border-zinc-800 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                        <ExternalLink size={16} /> 
                      </div>
                      Reply to : {msg.email}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}