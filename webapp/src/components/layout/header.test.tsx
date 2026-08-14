// ===========================================
// Tests unitaires - Header
// ===========================================

import { render, screen } from '@testing-library/react';
import { Header } from './header';
import type { User } from '@/lib/stores/auth-store';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

const mockAuthState = jest.fn();
jest.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: () => mockAuthState(),
}));

const baseUser: User = {
  id: 'u1',
  email: 'jean@example.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  role: 'CLIENT',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function signedOut() {
  mockAuthState.mockReturnValue({ user: null, isAuthenticated: false, logout: jest.fn() });
}

function signedInAs(role: User['role']) {
  mockAuthState.mockReturnValue({
    user: { ...baseUser, role },
    isAuthenticated: true,
    logout: jest.fn(),
  });
}

describe('Header', () => {
  beforeEach(() => {
    mockAuthState.mockReset();
  });

  it('affiche le logo et le ramene a l accueil', () => {
    signedOut();
    render(<Header />);

    const logo = screen.getByAltText('Thé Tip Top');
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });

  // La nav est rendue deux fois (desktop + menu mobile) : on interroge donc
  // toujours avec getAllByRole plutot que getByRole.
  it('liste les entrees de navigation attendues', () => {
    signedOut();
    render(<Header />);

    ['Le jeu', 'Lots', 'Règlement', 'FAQ'].forEach((label) => {
      expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0);
    });
  });

  it('n expose aucun lien vers la route inexistante /boutiques', () => {
    signedOut();
    render(<Header />);

    expect(screen.queryByRole('link', { name: 'Boutiques' })).not.toBeInTheDocument();
  });

  it('propose Connexion et Jouer quand on est deconnecte', () => {
    signedOut();
    render(<Header />);

    expect(screen.getAllByRole('link', { name: 'Connexion' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Jouer' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Jean' })).not.toBeInTheDocument();
  });

  it('remplace Connexion par le profil quand on est connecte', () => {
    signedInAs('CLIENT');
    render(<Header />);

    expect(screen.queryByRole('link', { name: 'Connexion' })).not.toBeInTheDocument();
    screen.getAllByRole('link', { name: 'Jean' }).forEach((link) => {
      expect(link).toHaveAttribute('href', '/dashboard/profile');
    });
  });

  it('n affiche pas de lien backoffice pour un compte CLIENT', () => {
    signedInAs('CLIENT');
    render(<Header />);

    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Espace employé' })).not.toBeInTheDocument();
  });

  it('donne acces au backoffice a un compte ADMIN', () => {
    signedInAs('ADMIN');
    render(<Header />);

    const links = screen.getAllByRole('link', { name: 'Admin' });
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link).toHaveAttribute('href', '/admin'));
  });

  it('donne acces a l espace employe a un compte EMPLOYEE', () => {
    signedInAs('EMPLOYEE');
    render(<Header />);

    const links = screen.getAllByRole('link', { name: 'Espace employé' });
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link).toHaveAttribute('href', '/employee'));
  });
});
