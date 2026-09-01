// ===========================================
// Tests unitaires - AccountSidebar
// ===========================================

import { render, screen, fireEvent } from '@testing-library/react';
import { AccountSidebar } from '@/components/dashboard/account-sidebar';

const mockPathname = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ replace: mockReplace }),
}));

const mockLogout = jest.fn();
jest.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: () => ({ logout: mockLogout }),
}));

describe('AccountSidebar', () => {
  beforeEach(() => {
    mockLogout.mockReset();
    mockReplace.mockReset();
  });

  // La protection des routes privees vit dans le middleware, qui ne s'execute
  // qu'a la navigation : sans redirection, on restait sur la page apres avoir
  // ete deconnecte.
  it('renvoie a la connexion apres une deconnexion', () => {
    mockPathname.mockReturnValue('/dashboard');
    render(<AccountSidebar />);

    fireEvent.click(screen.getByRole('button', { name: /Déconnexion/ }));

    expect(mockLogout).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/auth/login');
  });

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

  // Sur mobile la maquette replie la navigation : depliee en permanence, elle
  // repousserait le formulaire d un ecran entier avant le premier champ.
  describe('bascule mobile', () => {
    it('part replie et annonce son etat', () => {
      mockPathname.mockReturnValue('/dashboard/profile');
      render(<AccountSidebar />);

      const bascule = screen.getByRole('button', { name: /Afficher le menu/ });
      expect(bascule).toHaveAttribute('aria-expanded', 'false');
      expect(bascule).toHaveAttribute('aria-controls', 'account-nav');
    });

    it('deplie et replie au clic', () => {
      mockPathname.mockReturnValue('/dashboard/profile');
      render(<AccountSidebar />);

      fireEvent.click(screen.getByRole('button', { name: /Afficher le menu/ }));

      const ouverte = screen.getByRole('button', { name: /Masquer le menu/ });
      expect(ouverte).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(ouverte);
      expect(screen.getByRole('button', { name: /Afficher le menu/ })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    // Le panneau reste dans le DOM : il est masque par CSS et redevient visible
    // des le point de rupture lg, ou la bascule disparait.
    it('garde le panneau monte meme replie', () => {
      mockPathname.mockReturnValue('/dashboard/profile');
      const { container } = render(<AccountSidebar />);

      const panneau = container.querySelector('#account-nav');
      expect(panneau).toBeInTheDocument();
      expect(panneau).toHaveClass('hidden', 'lg:block');
    });
  });
});
