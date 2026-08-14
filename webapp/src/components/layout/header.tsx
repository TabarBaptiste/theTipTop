'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import { Menu, X, User, ShieldCheck, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';

// « Boutiques » retiré : la route /boutiques n'existe pas encore, le lien renvoyait un 404.
// À remettre le jour où la page sera créée.
const navigation = [
  { name: 'Le jeu', href: '/#how-it-works' },
  { name: 'Lots', href: '/#prizes' },
  { name: 'Règlement', href: '/reglement' },
  { name: 'FAQ', href: '/faq' },
];

// Détection d'hydratation sans setState dans un effect :
// renvoie false côté serveur, true dès le premier rendu client.
const emptySubscribe = () => () => { };
function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHydrated = useIsHydrated();
  const { user, isAuthenticated, logout } = useAuthStore();

  const backofficeHref =
    user?.role === 'ADMIN' ? '/admin' : user?.role === 'EMPLOYEE' ? '/employee' : null;
  const BackofficeIcon = user?.role === 'ADMIN' ? ShieldCheck : Store;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-warm-beige bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            src="/img/L_artisan_méditerranéen_horizontal_complet.svg"
            alt="Thé Tip Top"
            className="h-20 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 md:flex lg:gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'whitespace-nowrap font-functional text-[10px] uppercase tracking-[1.5px] transition-colors hover:text-terracotta-deep lg:text-ui lg:tracking-[2px]',
                pathname === item.href
                  ? 'text-terracotta-deep'
                  : 'text-noir'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isHydrated && (
            <>
              {isAuthenticated ? (
                <>
                  {backofficeHref && (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={backofficeHref}
                        className="flex items-center gap-2 font-functional text-ui uppercase tracking-[2px] text-noir hover:text-terracotta-deep"
                      >
                        <BackofficeIcon className="h-4 w-4" strokeWidth={1.5} />
                        {user?.role === 'ADMIN' ? 'Admin' : 'Espace employé'}
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 font-functional text-ui uppercase tracking-[2px] text-noir hover:text-terracotta-deep"
                    >
                      <User className="h-4 w-4" strokeWidth={1.5} />
                      {user?.firstName || 'Mon compte'}
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/dashboard/participate">Jouer</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/auth/login">Connexion</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/auth/login">Jouer</Link>
                  </Button>
                </>
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
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'block rounded-soft px-3 py-2 font-functional text-sm font-semibold',
                pathname === item.href
                  ? 'bg-terracotta-50 text-terracotta-deep'
                  : 'text-noir hover:bg-cream'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-2 border-t border-warm-beige pt-4">
            {isHydrated && (
              <>
                {isAuthenticated ? (
                  <>
                    {backofficeHref && (
                      <Button asChild variant="outline" className="w-full">
                        <Link
                          href={backofficeHref}
                          className="flex items-center gap-2 font-functional text-ui uppercase tracking-[2px] text-noir hover:text-terracotta-deep"
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
                        className="flex items-center gap-2 font-functional text-ui uppercase tracking-[2px] text-noir hover:text-terracotta-deep"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" strokeWidth={1.5} />
                        {user?.firstName || 'Mon compte'}
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/dashboard/participate" onClick={() => setMobileMenuOpen(false)}>
                        Jouer
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>Jouer</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
