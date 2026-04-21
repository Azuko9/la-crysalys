"use client";

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, Loader2, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

function LoginCore() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'error' | 'success', message: string} | null>(() => {
    const error = searchParams.get('error');
    return error ? { type: 'error', message: error } : null;
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setNotification({ type: 'error', message: "Identifiants incorrects ou compte introuvable." });
      setIsLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 pt-20 pb-20">
      <div className="max-w-md w-full bg-card p-8 rounded-dynamic border border-zinc-800 shadow-2xl">
        <h1 className="text-3xl font-black text-center text-foreground mb-2 italic uppercase tracking-tighter">
          Connexion <span className="text-primary">Admin</span>
        </h1>
        <p className="text-center text-foreground/50 text-sm mb-8">
          Veuillez vous identifier pour accéder à l'administration.
        </p>

        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center text-sm animate-in fade-in ${
            notification.type === 'error' 
              ? 'bg-red-900/30 border border-red-500 text-red-400' 
              : 'bg-green-900/30 border border-green-500 text-green-400'
          }`}>
            {notification.type === 'error' && <AlertCircle className="mr-3 flex-shrink-0" size={20} />}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Mail size={12} /> Email
            </label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-dynamic bg-background border border-zinc-800 text-foreground outline-none focus:border-primary transition-colors" 
              placeholder="admin@lacrysalys.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Lock size={12} /> Mot de passe
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-dynamic bg-background border border-zinc-800 text-foreground outline-none focus:border-primary transition-colors pr-12" 
                placeholder="••••••••"
              />
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

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-primary hover:bg-white hover:text-black text-black font-black uppercase tracking-widest text-xs rounded-dynamic transition-all mt-8 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : null}
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  // Suspense est nécessaire car LoginCore utilise le hook useSearchParams.
  // On affiche un loader global pour la page pendant que le client Next.js se charge.
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <LoginCore />
    </Suspense>
  );
}