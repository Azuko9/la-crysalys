"use client";

import { useState } from "react";
import { sendContactMessageAction } from "@/lib/actions";
import Script from "next/script";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react";
import type { ContactMessage } from "@/types";

type ContactFormData = Omit<ContactMessage, "id" | "created_at"> & {
  botField?: string;
};

export default function Contact() {
  
  const [formData, setFormData] = useState<ContactFormData>({
    nom: "",
    email: "",
    objet: "devis",
    message: "",
    botField: ""
  });

  // Nouvel état pour les erreurs de validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // RÈGLES DE VALIDATION
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // 1. Validation Nom (Lettres, espaces, tirets uniquement, 2 à 50 caractères)
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est obligatoire.";
    } else if (!nameRegex.test(formData.nom)) {
      newErrors.nom = "Le nom contient des caractères invalides (2 lettres min).";
    }

    // 2. Validation Email (Format strict)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email est obligatoire.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide.";
    }

    // 3. Validation Message (Longueur min et max)
    if (!formData.message.trim()) {
      newErrors.message = "Le message ne peut pas être vide.";
    } else if (formData.message.length < 10) {
      newErrors.message = "Le message est trop court (10 caractères min).";
    } else if (formData.message.length > 2000) {
      newErrors.message = "Le message est trop long (2000 caractères max).";
    }

    setErrors(newErrors);
    // Si l'objet newErrors est vide, c'est que tout est bon !
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // On efface l'erreur du champ quand l'utilisateur commence à corriger
    if (errors[e.target.id]) {
      setErrors({ ...errors, [e.target.id]: "" });
    }
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // On lance la validation avant d'envoyer
    if (!validateForm()) {
      return; // On arrête tout si c'est pas valide
    }
    
    setStatus("loading");
    setServerError(null);

    const result = await sendContactMessageAction(formData);

    if (result.success) {
      setStatus("success");
      setFormData({ nom: "", email: "", objet: "devis", message: "", botField: "" });
      setErrors({}); // Réinitialiser les erreurs après succès
    } else {
      setStatus("error");
      if ('errors' in result && result.errors) {
        // Erreurs de validation du serveur
        const serverErrors: Record<string, string> = {};
        // Zod retourne un tableau d'erreurs pour chaque champ, on prend juste le premier.
        const typedErrors = result.errors as Record<string, string[]>;
        for (const key in typedErrors) {
          const errorArray = typedErrors[key];
          if (errorArray && errorArray.length > 0) {
            serverErrors[key] = errorArray[0];
          }
        }
        setErrors(serverErrors);

      } else if ('error' in result && result.error) {
        // Erreur générale du serveur
        setServerError(result.error);
      } else {
        setServerError("Une erreur inattendue est survenue.");
      }
    }
  };

  // --- JSON-LD LocalBusiness SEO ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "La Crysalys",
    "image": "https://la-crysalys.vercel.app/Logo/logoAfficheBlanc.png",
    "telephone": "0676130827",
    "email": "Crysalys_production@outlook.fr",
    "url": "https://la-crysalys.vercel.app",
    "areaServed": "Nouvelle-Aquitaine, National & International",
    "priceRange": "$$"
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-8 pb-8 pt-8">
      
      <Script
        id="local-business-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-6xl mx-auto mb-16 pt-20">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 ">
          Contact
        </h1>
        <p className="text-foreground/70 text-lg">
          Une idée ? Un projet ? Parlons-en.
        </p>
      </div>

      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* COLONNE GAUCHE (inchangée) */}
        <div className="lg:col-span-1 bg-card p-8 rounded-dynamic border border-gray-800 h-fit">
           <h4 className="text-xl font-bold text-foreground mb-6">Nos Coordonnées</h4>
           {/* ... (Le reste de tes infos reste pareil) ... */}
           <div className="space-y-6">
            <div className="flex items-start">
              <Phone className="text-primary mr-4 mt-1" size={20} />
              <div>
                <p className="font-bold text-foreground/80">Téléphone</p>
                <p className="text-foreground/70">06 76 13 08 27</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="text-primary mr-4 mt-1" size={20} />
              <div>
                <p className="font-bold text-foreground/80">Email</p>
                <a href="mailto:Crysalys_production@outlook.fr" className="text-foreground/70 hover:text-foreground transition">
                  Crysalys_production@outlook.fr
                </a>
              </div>
            </div>
            <div className="flex items-start">
                <MapPin className="text-primary mr-4 mt-1" size={20} />
                <div>
                <p className="font-bold text-foreground/80">Zone d&apos;intervention</p>
                <p className="text-foreground/70">Nouvelle-Aquitaine, National & International</p>
                </div>
            </div>
           </div>
        </div>

        {/* COLONNE DROITE : FORMULAIRE SÉCURISÉ */}
        <div className="lg:col-span-2 bg-card p-8 rounded-dynamic border border-gray-800">
          <h4 className="text-xl font-bold text-foreground mb-6">Envoyez-nous un message</h4>
          
          {status === "success" && (
            <div className="mb-6 bg-green-900/30 border border-primary p-4 rounded-lg flex items-center text-green-400 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="mr-3" />
              <div>
                <strong>Message envoyé !</strong>
                <p className="text-sm">Nous reviendrons vers vous très rapidement.</p>
              </div>
            </div>
          )}

          {(status === "error" && serverError) && (
            <div className="mb-6 bg-red-900/30 border border-red-500 p-4 rounded-lg flex items-center text-red-400">
              <AlertCircle className="mr-3" />
              {serverError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NOM */}
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-foreground/70 mb-2">Nom / Entreprise</label>
                <input 
                  type="text" 
                  id="nom" 
                  value={formData.nom}
                  onChange={handleChange}
                  // Sécurité HTML native
                  maxLength={50}
                  className={`w-full bg-background border rounded-lg p-3 text-foreground outline-none transition
                    ${errors.nom ? "border-red-500 focus:border-red-500" : "border-gray-700 focus:border-primary"}`}
                  placeholder="Votre nom"
                />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
              </div>
              
              {/* EMAIL */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground/70 mb-2">Email</label>
                <input 
                  type="email" 
                  id="email"
                  value={formData.email}
                  onChange={handleChange} 
                  maxLength={100}
                  className={`w-full bg-background border rounded-lg p-3 text-foreground outline-none transition
                    ${errors.email ? "border-red-500 focus:border-red-500" : "border-gray-700 focus:border-primary"}`}
                  placeholder="votre@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* OBJET */}
            <div>
              <label htmlFor="objet" className="block text-sm font-medium text-foreground/70 mb-2">Objet</label>
              <select 
                id="objet" 
                value={formData.objet}
                onChange={handleChange}
                className="w-full bg-background border border-gray-700 rounded-lg p-3 text-foreground focus:border-primary outline-none transition"
              >
                <option value="devis">Demande de Devis</option>
                <option value="info">Renseignements</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            {/* MESSAGE */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground/70 mb-2">
                Message <span className="text-xs text-foreground/40">({formData.message.length}/2000)</span>
              </label>
              <textarea 
                id="message" 
                rows={5}
                value={formData.message}
                onChange={handleChange}
                maxLength={2000}
                className={`w-full bg-background border rounded-lg p-3 text-foreground outline-none transition
                    ${errors.message ? "border-red-500 focus:border-red-500" : "border-gray-700 focus:border-primary"}`}
                placeholder="Décrivez votre projet..."
              ></textarea>
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>

            {/* Champ Honeypot (invisible pour les humains, rempli par les bots de spam) */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <label htmlFor="botField">Ne remplissez pas ce champ si vous êtes humain</label>
              <input 
                type="text" 
                id="botField" 
                name="botField" 
                value={formData.botField}
                onChange={handleChange}
                tabIndex={-1} 
                autoComplete="off" 
              />
            </div>

            <button 
              type="submit" 
              disabled={status === "loading" || status === "success"}
              className={`w-full font-bold py-4 rounded-lg transition flex items-center justify-center gap-2 
                ${status === "success" ? "bg-primary text-foreground" : "bg-primary hover:bg-green-700 text-foreground"}
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