// ===========================================
// Tests unitaires - Rattachement d'une adresse réelle
// ===========================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompleteEmailPage from './page';
import { api } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/lib/api', () => ({
  api: { post: jest.fn() },
}));

jest.mock('@/lib/hooks/use-is-hydrated', () => ({
  useIsHydrated: () => true,
}));

// Un compte cree par Facebook sans adresse : c'est le seul cas ou cette page
// s'affiche, les autres etant renvoyes au tableau de bord.
jest.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: () => ({
    user: {
      id: 'u1',
      email: 'fb_f1@facebook-noreply.invalid',
      firstName: 'Camille',
      lastName: 'Tran',
      role: 'CLIENT',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    setUser: jest.fn(),
    isAuthenticated: true,
  }),
}));

const mockedPost = api.post as jest.Mock;

/** Saisit une adresse et demande le code, puis attend la seconde etape. */
async function franchirLEtapeEmail(adresse = 'camille@email.fr') {
  fireEvent.change(screen.getByLabelText('Votre adresse e-mail'), {
    target: { value: adresse },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Recevoir un code' }));

  await waitFor(() => {
    expect(screen.getByLabelText('Code de confirmation')).toBeInTheDocument();
  });
}

describe('CompleteEmailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPost.mockResolvedValue({ data: { email: 'camille@email.fr' } });
  });

  it('demande d abord une adresse', () => {
    render(<CompleteEmailPage />);

    expect(screen.getByLabelText('Votre adresse e-mail')).toBeInTheDocument();
    expect(screen.queryByLabelText('Code de confirmation')).not.toBeInTheDocument();
  });

  it('passe au code une fois l adresse envoyee, en rappelant la destination', async () => {
    render(<CompleteEmailPage />);
    await franchirLEtapeEmail();

    expect(mockedPost).toHaveBeenCalledWith('/auth/email/request', {
      email: 'camille@email.fr',
    });
    expect(screen.getByText('camille@email.fr')).toBeInTheDocument();
  });

  // Les deux etapes rendent la meme structure - un formulaire, un champ, un
  // bouton. Sans cle distincte, React reutilisait le meme noeud <input> et le
  // champ du code s'affichait deja rempli avec l'adresse saisie juste avant.
  it('presente un champ de code vide, et non l adresse saisie', async () => {
    render(<CompleteEmailPage />);
    await franchirLEtapeEmail();

    expect((screen.getByLabelText('Code de confirmation') as HTMLInputElement).value).toBe('');
  });

  it('transmet le code saisi', async () => {
    render(<CompleteEmailPage />);
    await franchirLEtapeEmail();

    fireEvent.change(screen.getByLabelText('Code de confirmation'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith('/auth/email/confirm', { code: '123456' });
    });
  });

  // Le retour en arriere emprunte le meme chemin de reconciliation, en sens
  // inverse : le champ doit redevenir celui de l'adresse, sans hériter du code
  // qui vient d'etre saisi. L'adresse precedente y reste, elle, volontairement
  // - on revient ici pour corriger une faute de frappe, pas pour tout
  // ressaisir.
  it('revient au champ adresse sans y laisser le code saisi', async () => {
    render(<CompleteEmailPage />);
    await franchirLEtapeEmail();

    fireEvent.change(screen.getByLabelText('Code de confirmation'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /pas la bonne adresse/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Votre adresse e-mail')).toBeInTheDocument();
    });
    const champ = screen.getByLabelText('Votre adresse e-mail') as HTMLInputElement;
    expect(champ.value).not.toBe('123456');
    expect(champ.value).toBe('camille@email.fr');
  });
});
