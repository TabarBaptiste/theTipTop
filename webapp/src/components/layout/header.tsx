'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, User, ShieldCheck, Store, ChevronDown, Gift, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
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


export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHydrated = useIsHydrated();
  const { user, isAuthenticated, logout } = useAuthStore();

  /**
   * Déconnexion puis retour à la page de connexion.
   *
   * Vider le magasin ne suffit pas : la protection des routes privées vit dans
   * le middleware, qui ne s'exécute qu'à la navigation. Sans redirection, un
   * administrateur restait donc sur son tableau de bord, déconnecté mais
   * toujours face au contenu.
   *
   * `replace` et non `push` : le pas précédent est la page privée qu'on vient
   * de quitter, et le bouton Retour ne doit pas y ramener.
   */
  const seDeconnecter = () => {
    logout();
    router.replace('/auth/login');
  };

  // Un membre du personnel vient piloter l'opération, pas y jouer : son entrée
  // de menu mène à son back-office, et non à l'espace personnel.
  const isStaff = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';
  const backofficeHref = user?.role === 'ADMIN' ? '/admin' : '/employee';
  const backofficeLabel = user?.role === 'ADMIN' ? 'Administration' : 'Espace employé';

  // L'icône du compte reflète le rôle : le bouclier pour l'administration, la
  // boutique pour un employé, la silhouette pour un participant.
  const AccountIcon = user?.role === 'ADMIN' ? ShieldCheck : user?.role === 'EMPLOYEE' ? Store : User;

  // La navigation ne porte plus que du contenu public. « Mes participations »
  // y figurait pour les participants, alors qu'il s'agit d'une destination
  // privée : elle apparaissait donc deux fois, ici et dans la barre latérale du
  // compte, qui est sa place. Elle a rejoint le menu de compte.
  const navLinks = navigation;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-section-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {/* 60 px, hauteur de la maquette. Si tu changes cette valeur,
          repercute-la sur les min-h-[calc(100vh-3.75rem)] des pages et sur le
          scroll-padding-top de globals.css. */}
      <nav className="container mx-auto flex h-[60px] items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* unoptimized : l'optimiseur de Next refuse les SVG sans dangerouslyAllowSVG,
              et un SVG n'a rien à y gagner. width/height = ratio intrinseque (3019x1270). */}
          <Image
            src="/img/logo-artisan-mediterraneen-horizontal.svg"
            alt="Thé Tip Top"
            width={152}
            height={64}
            className="h-10 w-auto"
            unoptimized
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex lg:gap-20">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'whitespace-nowrap font-functional text-ui uppercase transition-colors hover:text-terracotta-600',
                pathname === item.href ? 'text-terracotta-600' : 'text-noir'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <Button asChild size="nav">
            <Link href="/participate">Participer</Link>
          </Button>
          {isHydrated && (
            <>
              {isAuthenticated ? (
                // Un seul contrôle de compte, quel que soit le rôle : les
                // destinations personnelles s'y rangent au lieu d'encombrer la
                // navigation publique, qui ne porte que du contenu accessible
                // à tous.
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="nav"
                      className="flex items-center gap-2 font-functional text-ui uppercase tracking-[2px] text-noir hover:text-white active:bg-terracotta-600 active:text-white"
                    >
                      <AccountIcon className="h-4 w-4" strokeWidth={1.5} />
                      {user?.firstName || 'Mon compte'}
                      <ChevronDown className="h-3 w-3" strokeWidth={2} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isStaff ? (
                      <DropdownMenuItem asChild>
                        <Link href={backofficeHref}>
                          <AccountIcon className="h-4 w-4" strokeWidth={1.5} />
                          {backofficeLabel}
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <Gift className="h-4 w-4" strokeWidth={1.5} />
                          Mes participations
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">
                        <User className="h-4 w-4" strokeWidth={1.5} />
                        Mon profil
                      </Link>
                    </DropdownMenuItem>
                    {/* La déconnexion n'existait que dans la barre latérale du
                        compte : un visiteur connecté sur une page publique
                        devait d'abord naviguer ailleurs pour se déconnecter. */}
                    <DropdownMenuItem
                      onSelect={seDeconnecter}
                      className="text-red-700 data-[highlighted]:text-red-700"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.5} />
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="outline" size="nav">
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
          aria-expanded={mobileMenuOpen}
          aria-controls="menu-mobile"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-noir" strokeWidth={1.5} />
          ) : (
            <Menu className="h-6 w-6 text-noir" strokeWidth={1.5} />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {/* `max-h-0` masque le menu a l'oeil mais le laisse dans l'ordre de
          tabulation : au clavier, une tabulation depuis le bouton amenait sur
          « Le jeu », dont l'anneau de focus se dessinait dans un conteneur haut
          d'un pixel. `inert` retire tout le sous-arbre de la tabulation et de
          l'arbre d'accessibilite, sans toucher a la mise en page - l'animation
          de repli continue de jouer.

          React 18.3 traite `inert` comme un attribut booleen : lui passer la
          chaine vide revient a le rendre faux, et l'attribut n'atteignait pas
          le DOM. On lui passe donc un booleen, que ses types ne declarent pas
          encore. */}
      <div
        id="menu-mobile"
        {...({ inert: !mobileMenuOpen } as unknown as { inert?: boolean })}
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
                    {/* Le menu mobile est déjà une liste dépliée : les mêmes
                        destinations que le menu de compte s'y succèdent, sans
                        qu'un second niveau déroulant soit nécessaire. */}
                    <Button asChild variant="outline" className="w-full">
                      <Link
                        href={isStaff ? backofficeHref : '/dashboard'}
                        className="flex items-center gap-2 font-functional text-ui uppercase tracking-[2px] text-noir hover:text-white active:bg-terracotta-600 active:text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {isStaff ? (
                          <AccountIcon className="h-4 w-4" strokeWidth={1.5} />
                        ) : (
                          <Gift className="h-4 w-4" strokeWidth={1.5} />
                        )}
                        {isStaff ? backofficeLabel : 'Mes participations'}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2 font-functional text-ui uppercase tracking-[2px] text-noir hover:text-white active:bg-terracotta-600 active:text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" strokeWidth={1.5} />
                        Mon profil
                      </Link>
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        seDeconnecter();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-red-700 px-6 py-2 font-functional text-ui font-bold uppercase tracking-[2px] text-red-700 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.5} />
                      Se déconnecter
                    </button>
                  </>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      Connexion
                    </Link>
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
