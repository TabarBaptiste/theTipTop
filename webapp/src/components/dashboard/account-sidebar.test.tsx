// ===========================================
// Tests unitaires - AccountSidebar
// ===========================================

import { render, screen } from '@testing-library/react';
import { AccountSidebar } from './account-sidebar';

const mockPathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

jest.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: () => ({ logout: jest.fn() }),
}));

describe('AccountSidebar', () => {
  it('liste les trois entrees de l espace personnel', () => {
    mockPathname.mockReturnValue('/dashboard/profile');
    render(<AccountSidebar />);

    expect(screen.getByRole('link', { name: 'Profil' })).toHaveAttribute(
      'href',
      '/dashboard/profile',
    );
    expect(screen.getByRole('link', { name: 'Paramètres' })).toHaveAttribute(
      'href',
      '/dashboard/settings',
    );
    expect(screen.getByRole('link', { name: 'Mes participations' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  // /dashboard est un prefixe de /dashboard/profile : une comparaison laxiste
  // surlignerait deux entrees a la fois.
  it('ne marque qu une seule entree active sur une sous-route', () => {
    mockPathname.mockReturnValue('/dashboard/profile');
    render(<AccountSidebar />);

    expect(screen.getByRole('link', { name: 'Profil' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Mes participations' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('marque Parametres quand on y est', () => {
    mockPathname.mockReturnValue('/dashboard/settings');
    render(<AccountSidebar />);

    expect(screen.getByRole('link', { name: 'Paramètres' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Profil' })).not.toHaveAttribute('aria-current');
  });

  it('propose la deconnexion', () => {
    mockPathname.mockReturnValue('/dashboard');
    render(<AccountSidebar />);

    expect(screen.getByRole('button', { name: /Déconnexion/ })).toBeInTheDocument();
  });
});
