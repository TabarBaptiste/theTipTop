// ===========================================
// Tests unitaires - Header
// ===========================================

import { render, screen, fireEvent, within } from '@testing-library/react';
import { Header } from '@/components/layout/header';
import type { User } from '@/lib/stores/auth-store';

const mockReplace = jest.fn();
const mockPathname = jest.fn(() => '/');
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ replace: mockReplace }),
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

const mockLogout = jest.fn();

function signedOut() {
  mockAuthState.mockReturnValue({ user: null, isAuthenticated: false, logout: mockLogout });
}

function signedInAs(role: User['role']) {
  mockAuthState.mockReturnValue({
    user: { ...baseUser, role },
    isAuthenticated: true,
    logout: mockLogout,
  });
}

describe('Header', () => {
  beforeEach(() => {
    mockAuthState.mockReset();
    mockLogout.mockReset();
    mockReplace.mockReset();
    mockPathname.mockReset().mockReturnValue('/');
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

    // Le compte n'est plus un lien direct vers le profil mais un contrôle
    // ouvrant un menu : c'est ce qui evite de disperser les destinations
    // personnelles dans la barre de navigation.
    expect(screen.getByRole('button', { name: /Jean/ })).toBeInTheDocument();
    screen.getAllByRole('link', { name: 'Mon profil' }).forEach((link) => {
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

    const links = screen.getAllByRole('link', { name: 'Administration' });
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

  // Le personnel pilote l'opération, il n'y joue pas : lui proposer l'espace
  // personnel l'enverrait sur une page vide.
  it.each(['ADMIN', 'EMPLOYEE'] as const)(
    'ne propose pas Mes participations a un compte %s',
    (role) => {
      signedInAs(role);
      render(<Header />);

      expect(screen.queryByRole('link', { name: 'Mes participations' })).not.toBeInTheDocument();
    },
  );

  it('propose Mes participations a un compte CLIENT', () => {
    signedInAs('CLIENT');
    render(<Header />);

    expect(screen.getAllByRole('link', { name: 'Mes participations' }).length).toBeGreaterThan(0);
  });

  // Le compte du personnel ouvre un menu au lieu de mener directement au
  // profil : c'est ce qui evite un second bouton dans la barre.
  it('replie le backoffice sous un bouton pour le personnel', () => {
    signedInAs('ADMIN');
    render(<Header />);

    expect(screen.getByRole('button', { name: /Jean/ })).toBeInTheDocument();
  });

  // La variante « outline » du bouton passe son fond en terracotta au survol.
  // Le header surchargeait la couleur du texte en terracotta lui aussi, ce qui
  // ecrasait le hover:text-white de la variante : au survol comme a la
  // pression, le libelle et l'icone devenaient invisibles, terracotta sur
  // terracotta. Le fond et la couleur du texte doivent rester appaires.
  it.each([['ADMIN'], ['EMPLOYEE'], ['CLIENT']] as const)(
    'garde le libelle lisible au survol et au clic pour un compte %s',
    (role) => {
      signedInAs(role);
      render(<Header />);

      const declencheur = screen.getByRole('button', { name: /Jean/ });
      expect(declencheur.className).toContain('hover:text-white');
      expect(declencheur.className).not.toContain('hover:text-terracotta');

      // Le blanc ne vaut que sur un fond sombre : l'annoncer sans imposer le
      // fond donnerait du blanc sur creme, tout aussi illisible.
      expect(declencheur.className).toContain('active:bg-terracotta-600');
      expect(declencheur.className).toContain('active:text-white');
    },
  );

  // Vider le magasin ne fait pas quitter la page : la protection des routes
  // privees vit dans le middleware, qui ne s'execute qu'a la navigation. Sans
  // cette redirection, un administrateur restait sur son tableau de bord,
  // deconnecte mais toujours face au contenu.
  it('renvoie a la connexion apres une deconnexion', () => {
    signedInAs('ADMIN');
    render(<Header />);

    fireEvent.click(screen.getByRole('button', { name: /Se déconnecter/ }));

    expect(mockLogout).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/auth/login');
  });

  it('affiche « Mon compte » quand le profil ne porte pas de prénom', () => {
    mockAuthState.mockReturnValue({
      user: { ...baseUser, firstName: undefined },
      isAuthenticated: true,
      logout: mockLogout,
    });
    render(<Header />);

    expect(screen.getByRole('button', { name: /Mon compte/ })).toBeInTheDocument();
  });

  it('surligne le lien actif dans la navigation desktop', () => {
    mockPathname.mockReturnValue('/faq');
    signedOut();
    render(<Header />);

    const liens = screen.getAllByRole('link', { name: 'FAQ' });
    expect(liens[0].className).toContain('text-accent');
  });

  describe('menu mobile', () => {
    function boutonHamburger() {
      return screen.getByRole('button', { name: /(Ouvrir|Fermer) le menu/ });
    }

    it("s'ouvre et se referme au clic sur le bouton hamburger", () => {
      signedOut();
      render(<Header />);

      const bouton = boutonHamburger();
      expect(bouton).toHaveAttribute('aria-expanded', 'false');
      expect(bouton).toHaveAttribute('aria-label', 'Ouvrir le menu');

      fireEvent.click(bouton);
      expect(bouton).toHaveAttribute('aria-expanded', 'true');
      expect(bouton).toHaveAttribute('aria-label', 'Fermer le menu');

      fireEvent.click(bouton);
      expect(bouton).toHaveAttribute('aria-expanded', 'false');
    });

    it('se referme apres un clic sur un lien de navigation, qui reste surligne s’il est actif', () => {
      mockPathname.mockReturnValue('/faq');
      signedOut();
      render(<Header />);

      fireEvent.click(boutonHamburger());
      const menu = within(document.getElementById('menu-mobile')!);
      const lienFaq = menu.getAllByRole('link', { name: 'FAQ' })[0];
      expect(lienFaq.className).toContain('text-accent');

      fireEvent.click(lienFaq);
      expect(boutonHamburger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('se referme apres un clic sur « Participer »', () => {
      signedOut();
      render(<Header />);

      fireEvent.click(boutonHamburger());
      const menu = within(document.getElementById('menu-mobile')!);
      fireEvent.click(menu.getByRole('link', { name: 'Participer' }));

      expect(boutonHamburger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('se referme apres un clic sur « Connexion » pour un visiteur anonyme', () => {
      signedOut();
      render(<Header />);

      fireEvent.click(boutonHamburger());
      const menu = within(document.getElementById('menu-mobile')!);
      fireEvent.click(menu.getByRole('link', { name: 'Connexion' }));

      expect(boutonHamburger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('se referme apres un clic sur « Mes participations » pour un compte CLIENT', () => {
      signedInAs('CLIENT');
      render(<Header />);

      fireEvent.click(boutonHamburger());
      const menu = within(document.getElementById('menu-mobile')!);
      fireEvent.click(menu.getAllByRole('link', { name: 'Mes participations' })[0]);

      expect(boutonHamburger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('se referme apres un clic sur le lien de profil', () => {
      signedInAs('CLIENT');
      render(<Header />);

      fireEvent.click(boutonHamburger());
      const menu = within(document.getElementById('menu-mobile')!);
      fireEvent.click(menu.getAllByRole('link', { name: 'Mon profil' })[0]);

      expect(boutonHamburger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('se referme et deconnecte apres un clic sur « Se déconnecter »', () => {
      signedInAs('ADMIN');
      render(<Header />);

      fireEvent.click(boutonHamburger());
      const menu = within(document.getElementById('menu-mobile')!);
      fireEvent.click(menu.getByRole('button', { name: /Se déconnecter/ }));

      expect(mockLogout).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/auth/login');
      expect(boutonHamburger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('propose le raccourci vers le backoffice pour un compte ADMIN', () => {
      signedInAs('ADMIN');
      render(<Header />);

      fireEvent.click(boutonHamburger());
      const menu = within(document.getElementById('menu-mobile')!);
      const lien = menu.getAllByRole('link', { name: 'Administration' })[0];

      fireEvent.click(lien);
      expect(boutonHamburger()).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
