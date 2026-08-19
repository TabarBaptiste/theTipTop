'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, User, ShieldCheck, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';
import { cn } from '@/lib/utils';

// Destinations publiques, atteignables par n'importe quel visiteur.
// « Boutiques » retiré : la route /boutiques n'existe pas encore, le lien renvoyait un 404.
// À remettre le jour où la page sera créée.
const navigation = [
  { name: 'Le jeu', href: '/#how-it-works' },
  { name: 'Lots', href: '/#prizes' },
  { name: 'Règlement', href: '/reglement' },
  { name: 'FAQ', href: '/faq' },
];

// Espace personnel, ajouté à la nav seulement pour un compte connecté.
//
// L'entrée s'appelait « Mon concours » et figurait dans la nav publique. Deux
// problèmes : /dashboard est protégé par le middleware, donc un visiteur
// anonyme qui cliquait était éjecté vers la connexion depuis une signalétique
// censée mener quelque part ; et « Mon concours » était un libellé unique dans
// toute l'application, qui nomme cette page « Mes participations » partout
// ailleurs, y compris dans la barre latérale du profil.
const personalNavigation = { name: 'Mes participations', href: '/dashboard' };

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHydrated = useIsHydrated();
  const { user, isAuthenticated, logout } = useAuthStore();

  const backofficeHref =
    user?.role === 'ADMIN' ? '/admin' : user?.role === 'EMPLOYEE' ? '/employee' : null;
  const BackofficeIcon = user?.role === 'ADMIN' ? ShieldCheck : Store;

  // isHydrated conditionne l'ajout : sans lui, le rendu serveur et le rendu
  // client differeraient sur la presence du lien, et React signalerait une
  // divergence d'hydratation.
  const navLinks =
    isHydrated && isAuthenticated ? [...navigation, personalNavigation] : navigation;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-warm-beige bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {/* h-20 : la nav est calee sur le logo. Si tu changes cette hauteur,
          repercute-la sur les min-h-[calc(100vh-5rem)] des pages. */}
      <nav className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* unoptimized : l'optimiseur de Next refuse les SVG sans dangerouslyAllowSVG,
              et un SVG n'a rien à y gagner. width/height = ratio intrinseque (3019x1270). */}
          <Image
            src="/img/logo-artisan-mediterraneen-horizontal.svg"
            alt="Thé Tip Top"
            width={152}
            height={64}
            className="h-16 w-auto"
            unoptimized
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 md:flex lg:gap-6">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'whitespace-nowrap font-functional text-[10px] uppercase tracking-[1.5px] transition-colors hover:text-terracotta-600 lg:text-ui lg:tracking-[2px]',
                pathname === item.href
                  ? 'text-terracotta-600'
                  : 'text-noir'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Button asChild size="sm">
            <Link href="/participate">Participer</Link>
          </Button>
          {isHydrated && (
            <>
              {isAuthenticated ? (
                <>
                  {backofficeHref && (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={backofficeHref}
                        className="flex items-center gap-2 font-functional text-ui uppercase tracking-[2px] text-noir hover:text-terracotta-600"
                      >
                        <BackofficeIcon className="h-4 w-4" strokeWidth={1.5} />
                        {user?.role === 'ADMIN' ? 'Admin' : 'Espace employé'}
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 font-functional text-ui uppercase tracking-[2px] text-noir hover:text-terracotta-600"
                    >
                      <User className="h-4 w-4" strokeWidth={1.5} />
                      {user?.firstName || 'Mon compte'}
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href="/auth/login">Connexion</Link>
                </Button>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-noir" strokeWidth={1.5} />
          ) : (
            <Menu className="h-6 w-6 text-noir" strokeWidth={1.5} />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'overflow-hidden border-t border-warm-beige bg-white transition-all duration-300 ease-in-out md:hidden',
          // Hauteur calée sur le cas le plus haut : nav + bouton backoffice + profil + Jouer
          mobileMenuOpen ? 'max-h-[32rem]' : 'max-h-0'
        )}
      >
        <div className="space-y-1 px-6 pb-6 pt-4">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'block rounded-soft px-3 py-2 font-functional text-sm font-semibold',
                pathname === item.href
                  ? 'bg-terracotta-50 text-terracotta-600'
                  : 'text-noir hover:bg-cream'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-2 border-t border-warm-beige pt-4">
            <Button asChild className="w-full">
              <Link href="/participate" onClick={() => setMobileMenuOpen(false)}>
                Participer
              </Link>
            </Button>
            {isHydrated && (
              <>
                {isAuthenticated ? (
                  <>
                    {backofficeHref && (
                      <Button asChild variant="outline" className="w-full">
                        <Link
                          href={backofficeHref}
                          className="flex items-center gap-2 font-functional text-ui uppercase tracking-[2px] text-noir hover:text-terracotta-600"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <BackofficeIcon className="h-4 w-4" strokeWidth={1.5} />
                          {user?.role === 'ADMIN' ? 'Admin' : 'Espace employé'}
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="outline" className="w-full">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2 font-functional text-ui uppercase tracking-[2px] text-noir hover:text-terracotta-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" strokeWidth={1.5} />
                        {user?.firstName || 'Mon compte'}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
