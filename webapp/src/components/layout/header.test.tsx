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
  it('liste les entrees de navigation publiques', () => {
    signedOut();
    render(<Header />);

    ['Le jeu', 'Lots', 'Règlement', 'FAQ'].forEach((label) => {
      expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0);
    });
  });

  // /dashboard est protege par le middleware : proposer ce lien a un visiteur
  // anonyme le renverrait vers la connexion depuis une nav censee mener
  // quelque part.
  it('masque l espace personnel a un visiteur anonyme', () => {
    signedOut();
    render(<Header />);

    expect(screen.queryByRole('link', { name: 'Mes participations' })).not.toBeInTheDocument();
  });

  it('expose l espace personnel a un compte connecte', () => {
    signedInAs('CLIENT');
    render(<Header />);

    const liens = screen.getAllByRole('link', { name: 'Mes participations' });
    expect(liens.length).toBeGreaterThan(0);
    expect(liens[0]).toHaveAttribute('href', '/dashboard');
  });

  // L ancien libelle etait un hapax : la page s appelle « Mes participations »
  // partout ailleurs dans l application.
  it('n emploie plus l ancien libelle Mon concours', () => {
    signedInAs('CLIENT');
    render(<Header />);

    expect(screen.queryByRole('link', { name: 'Mon concours' })).not.toBeInTheDocument();
  });

  it('n expose aucun lien vers la route inexistante /boutiques', () => {
    signedOut();
    render(<Header />);

    expect(screen.queryByRole('link', { name: 'Boutiques' })).not.toBeInTheDocument();
  });

  // Participer est toujours visible ; seul le second bouton change selon l'etat.
  it('propose Participer puis Connexion quand on est deconnecte', () => {
    signedOut();
    render(<Header />);

    screen.getAllByRole('link', { name: 'Participer' }).forEach((link) => {
      expect(link).toHaveAttribute('href', '/participate');
    });
    expect(screen.getAllByRole('link', { name: 'Connexion' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Jean' })).not.toBeInTheDocument();
  });

  it('remplace Connexion par le profil quand on est connecte, en gardant Participer', () => {
    signedInAs('CLIENT');
    render(<Header />);

    expect(screen.queryByRole('link', { name: 'Connexion' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Participer' }).length).toBeGreaterThan(0);
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
