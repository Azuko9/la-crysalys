"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // On connecte Supabase
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react";

export default function Contact() {
  
  // États pour stocker ce que l'utilisateur écrit
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    objet: "devis", // Valeur par défaut
    message: ""
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Fonction qui s'active quand on écrit dans les champs
  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Fonction d'envoi vers Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const { error } = await supabase
      .from('messages')
      .insert([
        {
          nom: formData.nom,
          email: formData.email,
          objet: formData.objet,
          message: formData.message,
        }
      ]);

    if (error) {
      console.error(error);
      setStatus("error");
    } else {
      setStatus("success");
      // On vide le formulaire
      setFormData({ nom: "", email: "", objet: "devis", message: "" });
    }
  };

  return (
    <main className="min-h-screen bg-background text-white px-8 pb-8 pt-8">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-16 pt-20">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 ">
          Contact
        </h1>
        <p className="text-gray-400 text-lg">
          Une idée ? Un projet ? Parlons-en.
        </p>
      </div>

      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* COLONNE GAUCHE : INFOS */}
        <div className="lg:col-span-1 bg-card p-8 rounded-dynamic border border-gray-800 h-fit">
          <h4 className="text-xl font-bold text-white mb-6">Nos Coordonnées</h4>
          <div className="space-y-6">
            <div className="flex items-start">
              <Phone className="text-primary mr-4 mt-1" size={20} />
              <div>
                <p className="font-bold text-gray-300">Téléphone</p>
                <p className="text-gray-400">06 76 13 08 27</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="text-primary mr-4 mt-1" size={20} />
              <div>
                <p className="font-bold text-gray-300">Email</p>
                <a href="mailto:Crysalys_production@outlook.fr" className="text-gray-400 hover:text-white transition">
                  Crysalys_production@outlook.fr
                </a>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="text-primary mr-4 mt-1" size={20} />
              <div>
                <p className="font-bold text-gray-300">Zone d'intervention</p>
                <p className="text-gray-400">Nouvelle-Aquitaine, National & International</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : FORMULAIRE */}
        <div className="lg:col-span-2 bg-card p-8 rounded-dynamic border border-gray-800">
          <h4 className="text-xl font-bold text-white mb-6">Envoyez-nous un message</h4>
          
          {/* Message de Succès */}
          {status === "success" && (
            <div className="mb-6 bg-green-900/30 border border-primary p-4 rounded-lg flex items-center text-green-400">
              <CheckCircle className="mr-3" />
              <div>
                <strong>Message envoyé !</strong>
                <p className="text-sm">Nous reviendrons vers vous très rapidement.</p>
              </div>
            </div>
          )}

          {/* Message d'Erreur */}
          {status === "error" && (
            <div className="mb-6 bg-red-900/30 border border-red-500 p-4 rounded-lg flex items-center text-red-400">
              <AlertCircle className="mr-3" />
              Une erreur est survenue. Veuillez réessayer ou nous appeler.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-400 mb-2">Nom / Entreprise</label>
                <input 
                  type="text" 
                  id="nom" 
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="w-full bg-background border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none transition"
                  placeholder="Votre nom"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input 
                  type="email" 
                  id="email"
                  value={formData.email}
                  onChange={handleChange} 
                  required
                  className="w-full bg-background border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none transition"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="objet" className="block text-sm font-medium text-gray-400 mb-2">Objet</label>
              <select 
                id="objet" 
                value={formData.objet}
                onChange={handleChange}
                className="w-full bg-background border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none transition"
              >
                <option value="devis">Demande de Devis</option>
                <option value="info">Renseignements</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Message</label>
              <textarea 
                id="message" 
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full bg-background border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none transition"
                placeholder="Décrivez votre projet..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={status === "loading" || status === "success"}
              className={`w-full font-bold py-4 rounded-lg transition flex items-center justify-center gap-2 
                ${status === "success" ? "bg-primary text-white" : "bg-primary hover:bg-green-700 text-white"}
                ${status === "loading" ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {status === "loading" ? "Envoi en cours..." : status === "success" ? "Envoyé !" : (
                <>
                  <Send size={18} /> Envoyer le message
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}