"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginClientPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      router.refresh();
      router.push("/admin");
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-dynamic border border-gray-800 w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-green-900/30 p-4 rounded-dynamic">
            <Lock className="text-primary" size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          Accès Admin
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-background border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none transition"
              placeholder="admin@crysalys.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-background border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none transition pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 text-sm p-3 rounded flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}