// Fichier : src/app/admin/nouveau-mot-de-passe/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAdminPasswordAction } from "@/lib/actions";
import toast from "react-hot-toast";
import { Lock, Save, Loader2, X, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateAdminPasswordAction(password);
    
    if (result.success) {
      toast.success("Mot de passe mis à jour avec succès ! Redirection...");
      router.push("/admin"); // Redirection vers le dashboard admin
    } else {
      toast.error('error' in result && result.error ? String(result.error) : "Une erreur est survenue lors de la mise à jour.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-4 flex items-start justify-center">
      <div className="max-w-md w-full bg-card border border-zinc-800 p-8 rounded-dynamic shadow-2xl mt-10 relative">
        
        <Link href="/admin" className="absolute top-6 right-6 text-foreground/50 hover:text-white transition-colors" aria-label="Retour au tableau de bord">
          <X size={28} />
        </Link>

        <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-6">
          <Lock className="text-primary" size={28} />
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
            Nouveau <span className="text-primary">Mot de passe</span>
          </h1>
        </div>

        <p className="text-foreground/70 mb-8 text-sm">
          Votre session est maintenant active. Entrez votre nouveau mot de passe ci-dessous.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground/50 uppercase ml-1 tracking-widest">Nouveau mot de passe</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-background border border-zinc-800 p-4 rounded-dynamic outline-none focus:border-primary text-foreground transition-colors pr-12" placeholder="Minimum 10 caractères..." />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400 hover:text-primary transition-colors"
                aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading || password.length < 10} className="w-full bg-primary hover:bg-white text-black font-black py-4 rounded-dynamic uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? "Mise à jour..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}
