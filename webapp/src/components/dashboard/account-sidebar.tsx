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
    <aside className="space-y-1">
      {links.map((link) => {
        // Comparaison stricte : /dashboard est un préfixe de /dashboard/profile,
        // un startsWith surlignerait deux entrées à la fois.
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-soft px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'bg-terracotta-50 text-terracotta-deep'
                : 'text-noir hover:bg-terracotta-50/50',
            )}
          >
            <link.icon className="h-4 w-4" strokeWidth={1.5} />
            {link.name}
          </Link>
        );
      })}

      <button
        onClick={logout}
        className="flex w-full items-center gap-3 rounded-soft px-4 py-3 text-sm font-medium text-noir transition-colors hover:bg-terracotta-50/50"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.5} />
        Deconnexion
      </button>
    </aside>
  );
}
