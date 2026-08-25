// ===========================================
// Tests unitaires - Page Paramètres
// ===========================================
// Le bloc « mot de passe » a deux visages. Un compte ordinaire doit prouver
// qu'il connaît l'ancien ; un compte créé par Google ou Facebook n'en a jamais
// eu et en définit un pour la première fois. Envoyer un `currentPassword` vide
// dans ce second cas ferait échouer la validation de l'API, et afficher le
// champ enfermerait le titulaire hors de son propre compte.

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from './page';
import { api } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/components/dashboard/account-sidebar', () => ({
  AccountSidebar: () => <aside />,
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/lib/api', () => ({
  api: { put: jest.fn(), delete: jest.fn(), get: jest.fn() },
}));

// Le role n'est pas fige : la suppression de compte se comporte differemment
// selon qu'il s'agit d'un participant ou d'un membre du personnel.
type Utilisateur = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'EMPLOYEE' | 'ADMIN';
  createdAt: string;
  hasPassword?: boolean;
};

const utilisateurDeBase: Utilisateur = {
  id: 'u1',
  email: 'camille@thetiptop.fr',
  firstName: 'Camille',
  lastName: 'Tran',
  role: 'CLIENT',
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Rejoue à chaque rendu : les tests changent `hasPassword` avant de rendre.
let utilisateurCourant: Utilisateur;

jest.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: () => ({
    user: utilisateurCourant,
    setUser: jest.fn(),
    isAuthenticated: true,
    isLoading: false,
    logout: jest.fn(),
  }),
}));

const mockedPut = api.put as jest.Mock;

/** Remplit le nouveau mot de passe et sa confirmation, puis soumet. */
function definirEtSoumettre(valeur: string) {
  fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: valeur } });
  fireEvent.change(screen.getByLabelText('Confirmer le nouveau mot de passe'), {
    target: { value: valeur },
  });
  fireEvent.click(screen.getByRole('button', { name: /mot de passe$/i }));
}

describe('SettingsPage - bloc mot de passe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPut.mockResolvedValue({ data: {} });
  });

  describe('compte disposant deja d un mot de passe', () => {
    beforeEach(() => {
      utilisateurCourant = { ...utilisateurDeBase, hasPassword: true };
    });

    it('demande l ancien mot de passe', () => {
      render(<SettingsPage />);

      expect(screen.getByLabelText('Mot de passe actuel')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Changer mon mot de passe' }),
      ).toBeInTheDocument();
    });

    it('transmet l ancien mot de passe a l API', async () => {
      render(<SettingsPage />);

      fireEvent.change(screen.getByLabelText('Mot de passe actuel'), {
        target: { value: 'Actuel123!' },
      });
      definirEtSoumettre('Nouveau123!');

      await waitFor(() => {
        expect(mockedPut).toHaveBeenCalledWith('/users/u1/password', {
          currentPassword: 'Actuel123!',
          newPassword: 'Nouveau123!',
        });
      });
    });
  });

  describe('compte cree par Google ou Facebook', () => {
    beforeEach(() => {
      utilisateurCourant = { ...utilisateurDeBase, hasPassword: false };
    });

    it('propose de definir un mot de passe, sans reclamer d ancien', () => {
      render(<SettingsPage />);

      expect(screen.queryByLabelText('Mot de passe actuel')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Définir mon mot de passe' })).toBeInTheDocument();
      expect(screen.getByText(/n'a pas encore de mot de passe/)).toBeInTheDocument();
    });

    // Le point sensible : un `currentPassword` vide serait refuse par l'API.
    it('n envoie pas de champ currentPassword', async () => {
      render(<SettingsPage />);

      definirEtSoumettre('Premier123!');

      await waitFor(() => {
        expect(mockedPut).toHaveBeenCalledWith('/users/u1/password', {
          newPassword: 'Premier123!',
        });
      });
    });
  });

  // Le droit a l'effacement porte sur un compte de participant, pas sur une
  // habilitation d'exploitation. L'API refuse la demande : afficher le bouton
  // reviendrait a promettre une action vouee a echouer.
  describe('suppression du compte', () => {
    it.each([['ADMIN'], ['EMPLOYEE']] as const)(
      'ne propose pas la suppression a un compte %s',
      (role) => {
        utilisateurCourant = { ...utilisateurDeBase, role, hasPassword: true };
        render(<SettingsPage />);

        expect(
          screen.queryByRole('button', { name: /Supprimer mon compte/i }),
        ).not.toBeInTheDocument();
        expect(screen.getByText(/adressez la demande à un autre administrateur/i)).toBeInTheDocument();
      },
    );

    it('la propose a un compte CLIENT', () => {
      utilisateurCourant = { ...utilisateurDeBase, hasPassword: true };
      render(<SettingsPage />);

      expect(
        screen.getByRole('button', { name: /Supprimer mon compte/i }),
      ).toBeInTheDocument();
    });
  });

  // Tant que le profil n'est pas charge, mieux vaut reclamer l'ancien a tort
  // que l'omettre a tort : l'API refuserait la demande, ce qui est preferable a
  // une dispense accordee par erreur.
  describe('profil dont l indicateur est absent', () => {
    beforeEach(() => {
      utilisateurCourant = { ...utilisateurDeBase };
    });

    it('retombe sur le formulaire complet', () => {
      render(<SettingsPage />);

      expect(screen.getByLabelText('Mot de passe actuel')).toBeInTheDocument();
    });
  });
});
