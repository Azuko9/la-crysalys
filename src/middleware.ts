import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. On prépare la réponse
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. On configure le client Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 3. On récupère la session utilisateur
  const { data: { session } } = await supabase.auth.getSession()

  // --- SÉCURITÉ 1 : PROTECTION DU LOGIN (Le Code 6 chiffres) ---
  if (request.nextUrl.pathname === '/login') {
      const hasGatePass = request.cookies.get('admin_gate_passed')
      // S'il n'a PAS le cookie "Gate", on le renvoie à l'accueil
      if (!hasGatePass) {
          return NextResponse.redirect(new URL('/', request.url))
      }
  }

  // --- SÉCURITÉ 2 : PROTECTION DE L'ADMIN (Email/Mdp) ---
  if (!session && request.nextUrl.pathname.startsWith('/admin')) {
    // Pas connecté ? Direction login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}