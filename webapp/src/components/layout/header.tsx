'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Le jeu', href: '/#how-it-works' },
  { name: 'Lots', href: '/#prizes' },
  { name: 'Mon concours', href: '/dashboard/participate' },
  { name: 'Mon Compte', href: '/dashboard' },
  { name: 'FAQ', href: '/faq' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-warm-beige bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-noir">
            The Tip Top
          </span>
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
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 font-functional text-ui uppercase tracking-[2px] text-noir hover:text-terracotta-deep"
              >
                <User className="h-4 w-4" strokeWidth={1.5} />
                {user?.firstName || 'Mon compte'}
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Deconnexion
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth/login">Connexion</Link>
            </Button>
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
          mobileMenuOpen ? 'max-h-96' : 'max-h-0'
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
            {isAuthenticated ? (
              <>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard">Mon compte</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Deconnexion
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="w-full">
                  <Link href="/auth/login">Connexion</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/register">Inscription</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
