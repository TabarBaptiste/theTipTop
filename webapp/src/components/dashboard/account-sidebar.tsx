'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, SlidersHorizontal, Gift, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';

// « Mes gains » et « Notifications » figurent dans la maquette mais leurs routes
// n'existent pas : les afficher produirait des 404. À ajouter le jour où les
// pages seront créées.
const links = [
  { name: 'Profil', href: '/dashboard/profile', icon: User },
  { name: 'Paramètres', href: '/dashboard/settings', icon: SlidersHorizontal },
  { name: 'Mes participations', href: '/dashboard', icon: Gift },
];

/**
 * Navigation de l'espace personnel, partagée par toutes ses pages.
 *
 * Elle vit dans un composant plutôt que dans chaque page : dupliquée, elle
 * divergerait à la première entrée ajoutée d'un seul côté.
 */
export function AccountSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <aside>
      {/* Panneau teinté sur page blanche, comme la maquette : c'est le bloc qui
          porte la couleur, pas la page. */}
      <div className="rounded-card bg-cream p-4">
        <nav className="space-y-1">
          {links.map((link) => {
            // Comparaison stricte : /dashboard est un préfixe de
            // /dashboard/profile, un startsWith surlignerait deux entrées.
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-soft px-3 py-2.5 text-sm transition-colors',
                  // La maquette distingue l'entrée active par la graisse, sans
                  // pastille de fond — un terracotta-50 sur ce panneau crème
                  // serait de toute façon indiscernable (1.03 d'écart).
                  // terracotta-600 et non deep : #BA6905 tombe à 3.89:1 ici,
                  // sous le seuil AA.
                  isActive
                    ? 'font-semibold text-terracotta-600'
                    : 'text-noir hover:text-terracotta-600',
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-warm-beige pt-4">
          <button
            onClick={logout}
            // red-700 et non red-600 : ce dernier plafonne a 4.41:1 sur red-50.
            className="inline-flex items-center gap-2 rounded-pill bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
}
