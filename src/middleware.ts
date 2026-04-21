import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Créer une réponse par défaut que le client Supabase pourra modifier si les cookies doivent être rafraîchis
  // (Sans modifier l'objet request pour ne pas détruire les formulaires POST)
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Mettre à jour le cookie sur la requête pour le reste du cycle de vie Next.js
          request.cookies.set({ name, value, ...options });
          // Mettre à jour le cookie sur la réponse envoyée au navigateur
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // --- GESTION DU CODE D'INVITATION (PKCE) ---
  // Si Supabase renvoie un code d'invitation sur la page d'accueil, on l'intercepte
  const code = request.nextUrl.searchParams.get('code');
  if (code && request.nextUrl.pathname === '/') {
    const callbackUrl = new URL('/auth/callback', request.url);
    // Conserver tous les paramètres d'URL (comme "next" pour la redirection)
    request.nextUrl.searchParams.forEach((value, key) => {
      callbackUrl.searchParams.append(key, value);
    });
    return NextResponse.redirect(callbackUrl);
  }

  // getUser() est plus sécurisé que getSession() car il valide systématiquement le token auprès de l'API Supabase
  const { data: { user } } = await supabase.auth.getUser();

  // --- 1. Protection de la route /admin et des API sensibles ---
  // (Ajoute ici d'autres routes si tu as par exemple '/api/private')
  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
    if (!user) {
      // Si c'est une requête API, on renvoie une erreur 401 au format JSON
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
      }
      // Sinon (c'est une page web), on le redirige vers le login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // --- 2. Redirection des utilisateurs déjà connectés ---
  if (request.nextUrl.pathname === '/login' && user) {
    // S'il est déjà connecté et tente d'aller sur /login, on l'envoie sur l'admin
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Faire correspondre tous les chemins de requêtes SAUF ceux qui commencent par :
     * - _next/static (fichiers statiques)
     * - _next/image (fichiers d'optimisation d'images)
     * - favicon.ico (favicon)
     * - n'importe quelle extension de fichier image (svg, png, jpg, jpeg, gif, webp)
     * 
     * Cela évite que le middleware ne s'exécute inutilement pour charger le design du site.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};