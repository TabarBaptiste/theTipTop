import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ===========================================
// Middleware d'authentification (protection UX)
// ===========================================
// La sécurité réelle est assurée par le back-end (JwtAuthGuard / RolesGuard).
// Ce middleware évite l'affichage des pages privées aux visiteurs non
// authentifiés et redirige selon le rôle (lu depuis le refresh token).

// Routes nécessitant simplement une authentification
const AUTH_REQUIRED = ['/dashboard'];

// Routes nécessitant un rôle précis
const ROLE_RULES: { prefix: string; roles: string[] }[] = [
  { prefix: '/admin', roles: ['ADMIN'] },
  { prefix: '/employee', roles: ['EMPLOYEE', 'ADMIN'] },
];

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Décode (sans vérifier la signature) le rôle contenu dans le payload du JWT.
 * Suffisant pour une redirection côté client ; la vérification réelle se fait
 * côté API.
 */
function decodeRole(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(base64));
    return typeof json.role === 'string' ? json.role : null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const roleRule = ROLE_RULES.find((rule) => matchesPrefix(pathname, rule.prefix));
  const needsAuth = AUTH_REQUIRED.some((prefix) => matchesPrefix(pathname, prefix));

  if (!roleRule && !needsAuth) {
    return NextResponse.next();
  }

  const token = req.cookies.get('refreshToken')?.value;

  // Non authentifié → redirection vers la connexion (avec retour)
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Vérification du rôle pour les zones restreintes
  if (roleRule) {
    const role = decodeRole(token);
    if (!role || !roleRule.roles.includes(role)) {
      const fallbackUrl = req.nextUrl.clone();
      fallbackUrl.pathname = '/dashboard';
      fallbackUrl.search = '';
      return NextResponse.redirect(fallbackUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/employee/:path*'],
};
