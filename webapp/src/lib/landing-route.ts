import type { User } from '@/lib/stores/auth-store';

/**
 * Page d'accueil après authentification, selon le rôle.
 *
 * Un administrateur ou un employé n'a rien à faire sur /dashboard : cette page
 * ne liste que les participations personnelles du compte connecté, donc vide
 * et sans intérêt pour eux. On les envoie directement à leur back-office.
 */
export function landingRouteFor(role: User['role'] | undefined): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'EMPLOYEE':
      return '/employee';
    default:
      return '/dashboard';
  }
}
